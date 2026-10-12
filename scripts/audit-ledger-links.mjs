import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import ts from "typescript";
import { JSDOM } from "jsdom";
import { parseWorkbook, normalizeHeader, photoLinks } from "../src/lib/workbook.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = path.join(root, "local-tygs-data");
const receipt = JSON.parse(await fs.readFile(path.join(dataDir, "import-receipt.json"), "utf8"));
const datasets = {};
const normalize = (value) =>
	String(value || "")
		.normalize("NFKC")
		.toUpperCase()
		.replace(/[—–－−﹣]/g, "-")
		.replace(/\s+/g, "");
for (const source of receipt.results) {
	const book = await parseWorkbook(
		await fs.readFile(path.join(dataDir, "sources", source.fileName)),
		source.fileName,
	);
	datasets[source.kind] = book.rows.map((row) => ({
		...row,
		fields: Object.fromEntries(
			Object.entries(row.values).map(([key, value]) => [normalizeHeader(key), value]),
		),
		photos: photoLinks(row.values),
	}));
}

function compare(left, right, keys) {
	const index = new Map();
	for (const row of datasets[right])
		for (const key of new Set(keys(row, right).filter(Boolean))) {
			if (!index.has(key)) index.set(key, []);
			index.get(key).push(row.rowNumber);
		}
	const counts = {
		total: datasets[left].length,
		missingKey: 0,
		unmatched: 0,
		uniqueCandidate: 0,
		ambiguous: 0,
	};
	const candidates = [];
	for (const row of datasets[left]) {
		const values = keys(row, left).filter(Boolean);
		const matches = new Set(values.flatMap((key) => index.get(key) || []));
		if (!values.length) counts.missingKey++;
		else if (!matches.size) counts.unmatched++;
		else if (matches.size === 1) counts.uniqueCandidate++;
		else counts.ambiguous++;
		if (matches.size) candidates.push({ sourceRow: row.rowNumber, targetRows: [...matches] });
	}
	return { from: left, to: right, counts, candidates };
}
const relations = [];
for (const [left, right] of [
	["recheck", "meters"],
	["maintenance", "chambers"],
	["meters", "rooms"],
	["recheck", "rooms"],
]) {
	relations.push({
		rule: "identical_photo_link",
		...compare(left, right, (row) => row.photos.map((photo) => photo.url)),
	});
}
for (const [left, right] of [
	["meters", "rooms"],
	["recheck", "rooms"],
]) {
	relations.push({
		rule: "exact_account_name_to_community",
		...compare(left, right, (row, kind) => [
			normalize(row.fields[kind === "rooms" ? "小区名称" : "户名"]),
		]),
	});
	relations.push({
		rule: "exact_address_or_position_text",
		...compare(left, right, (row, kind) =>
			(kind === "rooms" ? ["位置", "详细地址"] : ["坐标", "定位坐标", "地址"]).map((field) =>
				normalize(row.fields[field]),
			),
		),
	});
}
relations.push({
	rule: "exact_recheck_address_or_position_to_meter_position",
	...compare("recheck", "meters", (row) =>
		["地址", "坐标", "定位坐标"].map((field) => normalize(row.fields[field])),
	),
});

function literal(node) {
	if (!node) return undefined;
	if (ts.isStringLiteral(node)) return node.text;
	if (ts.isNumericLiteral(node)) return Number(node.text);
	if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
	if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
	if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
		const arg = literal(node.arguments[0]);
		if (node.expression.text === "Boolean") return Boolean(arg);
		if (node.expression.text === "Number") return node.arguments.length ? Number(arg) : 0;
	}
	return undefined;
}
function bootstrap(html) {
	const document = new JSDOM(html).window.document;
	const script = [...document.querySelectorAll("script")]
		.map((node) => node.textContent)
		.find((text) => text.includes("xd_global_shareInitDate"));
	if (!script) return null;
	const ast = ts.createSourceFile(
		"share.js",
		script,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.JS,
	);
	let object;
	function visit(node) {
		if (
			ts.isVariableDeclaration(node) &&
			node.name.getText(ast) === "xd_global_shareInitDate" &&
			node.initializer &&
			ts.isObjectLiteralExpression(node.initializer)
		)
			object = node.initializer;
		ts.forEachChild(node, visit);
	}
	visit(ast);
	if (!object) return null;
	return Object.fromEntries(
		object.properties
			.filter(ts.isPropertyAssignment)
			.map((property) => [property.name.text, literal(property.initializer)]),
	);
}

const probes = [],
	counts = {},
	allLinks = new Set();
for (const [kind, rows] of Object.entries(datasets)) {
	const photos = rows.flatMap((row) => row.photos);
	counts[kind] = {
		records: rows.length,
		recordsWithPhotoLinks: rows.filter((row) => row.photos.length).length,
		links: photos.length,
		uniqueLinks: new Set(photos.map((photo) => photo.url)).size,
		directImageUrls: photos.filter((photo) => !photo.sharedPage).length,
	};
	photos.forEach((photo) => allLinks.add(photo.url));
	for (const index of [0, Math.floor(rows.length / 2), rows.length - 1]) {
		const row = rows[index];
		for (const photo of row.photos.slice(0, 2)) {
			const url = new URL(photo.url);
			if (url.protocol !== "https:" || url.hostname !== "drive.weixin.qq.com") continue;
			const result = {
				kind,
				rowNumber: row.rowNumber,
				field: photo.label,
				urlSha256: createHash("sha256").update(photo.url).digest("hex"),
			};
			try {
				const response = await fetch(url, {
					signal: AbortSignal.timeout(15000),
					redirect: "manual",
				});
				result.httpStatus = response.status;
				result.contentType = response.headers.get("content-type");
				if (result.contentType?.startsWith("text/html")) {
					const html = await response.text();
					const data = bootstrap(html);
					if (data) {
						result.hasLogin = data.has_login;
						result.authType = data.auth_type;
						result.errorCode = data.err_code;
						result.downloadUrlPresent = Boolean(data.download_url);
						result.fileType = path
							.extname(String(data.object_name || ""))
							.toLowerCase();
						result.state =
							!data.has_login && !data.download_url
								? "login_page_no_image_url"
								: "share_page";
					} else result.state = "unrecognized_html";
				} else {
					result.state = result.contentType?.startsWith("image/")
						? "image_response"
						: "non_image_response";
					await response.body?.cancel();
				}
			} catch (error) {
				result.state = "request_failed";
				result.error = error.cause?.code || error.message;
			}
			probes.push(result);
		}
	}
	console.log(
		JSON.stringify({
			kind,
			...counts[kind],
			sampled: probes.filter((p) => p.kind === kind).length,
		}),
	);
}
const result = {
	time: new Date().toISOString(),
	method: "Exact normalized text or identical full photo URL; candidates only, no links applied. Photo requests are anonymous and stratified by first/middle/last source row, up to two fields per row.",
	counts,
	uniquePhotoLinks: allLinks.size,
	relations,
	probes,
};
await fs.writeFile(
	path.join(dataDir, "association-photo-audit.json"),
	JSON.stringify(result, null, 2),
	{ mode: 0o600 },
);
console.log(
	JSON.stringify({
		relations: relations.map(({ candidates: _candidates, ...relation }) => relation),
		probeStates: probes.reduce(
			(result, probe) => ({ ...result, [probe.state]: (result[probe.state] || 0) + 1 }),
			{},
		),
		uniquePhotoLinks: allLinks.size,
	}),
);
