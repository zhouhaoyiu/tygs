import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { parseWorkbook } from "../src/lib/workbook.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = path.join(root, "local-tygs-data");
const sourceDir = process.argv[2] || "/Volumes/WD_BLACK";
const credentials = JSON.parse(await fs.readFile(path.join(dataDir, "credentials.json"), "utf8"));
const files = [
	["水表间采集台帐7.3.xlsx", 13673],
	["总表采集台帐7.3.xlsx", 3399],
	["井室采集台账7.3.xlsx", 7008],
	["复核总表采集台账7.3.xlsx", 467],
	["阀门维护检修采集台帐7.11.xlsx", 1965],
];
let token;
async function request(route, body) {
	const response = await fetch("http://127.0.0.1:8097" + route, {
		method: body ? "POST" : "GET",
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
		signal: AbortSignal.timeout(120000),
	});
	const result = await response.json();
	if (!response.ok)
		throw new Error(`${route}: ${response.status}: ${result.message || "request failed"}`);
	return result;
}
const login = await request("/admin/adminLogin", {
	userName: credentials.userName,
	passWord: credentials.passWord,
});
token = login.token;
await fs.mkdir(path.join(dataDir, "sources"), { recursive: true, mode: 0o700 });
const results = [];
for (const [fileName, expected] of files) {
	const original = await fs.readFile(path.join(sourceDir, fileName));
	const workbook = await parseWorkbook(original, fileName);
	assert.equal(workbook.expectedRows, expected, `${fileName}: source row count changed`);
	const copy = path.join(dataDir, "sources", fileName);
	try {
		await fs.writeFile(copy, original, { flag: "wx", mode: 0o600 });
	} catch (error) {
		if (error.code !== "EEXIST") throw error;
	}
	assert.equal(
		createHash("sha256")
			.update(await fs.readFile(copy))
			.digest("hex"),
		workbook.sha256,
		"Existing source copy differs",
	);
	let inserted = 0,
		skipped = 0;
	for (let start = 0; start < workbook.rows.length; start += 250) {
		const result = await request("/ledger/import", {
			...workbook,
			rows: workbook.rows.slice(start, start + 250),
		});
		inserted += result.inserted;
		skipped += result.skipped;
		if (start + 250 >= workbook.rows.length) assert.equal(result.complete, true);
	}
	const repeat = await request("/ledger/import", {
		...workbook,
		rows: workbook.rows.slice(0, 250),
	});
	assert.equal(repeat.inserted, 0);
	assert.equal(repeat.skipped, Math.min(250, expected));
	assert.equal(
		createHash("sha256")
			.update(await fs.readFile(path.join(sourceDir, fileName)))
			.digest("hex"),
		workbook.sha256,
		"Original source changed",
	);
	results.push({
		fileName,
		sha256: workbook.sha256,
		kind: workbook.kind,
		records: expected,
		inserted,
		skipped,
		sourceUnchanged: true,
		duplicateImportVerified: true,
	});
	console.log(JSON.stringify(results.at(-1)));
}
const summary = await request("/ledger/summary");
assert.equal(
	summary.total,
	files.reduce((sum, entry) => sum + entry[1], 0),
);
const relations = await request("/ledger/relations");
await fs.writeFile(
	path.join(dataDir, "import-receipt.json"),
	JSON.stringify(
		{
			time: new Date().toISOString(),
			database: "H2 file database, MySQL compatibility mode",
			results,
			summary,
			relations,
		},
		null,
		2,
	),
	{ mode: 0o600 },
);
console.log(JSON.stringify({ total: summary.total, kinds: summary.kinds, relations }));
