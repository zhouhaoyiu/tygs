import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { parseWorkbook } from "../src/lib/workbook.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = path.join(root, "local-tygs-data");
const credentials = JSON.parse(await fs.readFile(path.join(dataDir, "credentials.json"), "utf8"));
let token;
async function request(route, body) {
	const response = await fetch("http://127.0.0.1:8097" + route, {
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		method: body ? "POST" : "GET",
		...(body ? { body: JSON.stringify(body) } : {}),
		signal: AbortSignal.timeout(60000),
	});
	const data = await response.json();
	if (!response.ok) throw new Error(`${route}: ${response.status}: ${data.message}`);
	return data;
}
token = (
	await request("/admin/adminLogin", {
		userName: credentials.userName,
		passWord: credentials.passWord,
	})
).token;
const endpoints = {
	watermeterwell: "/WaterMeterWell/getAllWaterMeterWellInfo",
	watermeterroom: "/WaterMeterRoom/getAllWaterMeterRoomInfo",
	valuewell: "/ValueWell/getAllValueWellInfo",
	firehydrant: "/FireHydrant/getAllFireHydrantInfo",
};
const facilities = {};
for (const [table, endpoint] of Object.entries(endpoints)) {
	const data = await request(endpoint);
	assert.ok(Array.isArray(data), endpoint);
	facilities[table] = new Map(
		data.map((row) => [
			row.id,
			Object.fromEntries(
				Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]),
			),
		]),
	);
}
const summary = await request("/ledger/summary");
const checks = [];
for (const source of summary.sources) {
	const original = await parseWorkbook(
		await fs.readFile(path.join(dataDir, "sources", source.fileName)),
		source.fileName,
	);
	assert.equal(original.sha256, source.sha256);
	const expected = new Map(
		original.rows.map((row) => [JSON.stringify([row.sheet, row.rowNumber]), row]),
	);
	let after = 0,
		checked = 0,
		fields = 0,
		facilityCount = 0;
	const seen = new Set();
	while (true) {
		const rows = await request(`/ledger/sources/${source.sha256}/rows?after=${after}&size=250`);
		if (!rows.length) break;
		for (const row of rows) {
			const key = JSON.stringify([row.sheetName, row.rowNumber]);
			assert.ok(!seen.has(key), "Duplicate physical source row");
			seen.add(key);
			assert.deepEqual(
				row.raw,
				expected.get(key),
				`${source.kind}: source row ${row.rowNumber}`,
			);
			if (row.targetTable) {
				const facility = facilities[row.targetTable].get(row.targetId);
				assert.ok(facility, `Missing business record ${row.targetTable}/${row.targetId}`);
				for (const [field, value] of Object.entries(row.mapped)) {
					assert.equal(
						facility[field.toLowerCase()],
						value,
						`${source.kind}:${row.rowNumber}:${field}`,
					);
					fields++;
				}
				facilityCount++;
			} else assert.equal(row.targetId, null);
			checked++;
		}
		after = rows.at(-1).id;
	}
	assert.equal(checked, expected.size);
	checks.push({
		fileName: source.fileName,
		kind: source.kind,
		sha256: source.sha256,
		rawRowsCompared: checked,
		businessRowsCompared: facilityCount,
		mappedFieldsCompared: fields,
	});
	console.log(JSON.stringify(checks.at(-1)));
}
const result = {
	time: new Date().toISOString(),
	totalRawRows: checks.reduce((sum, row) => sum + row.rawRowsCompared, 0),
	businessCounts: Object.fromEntries(
		Object.entries(facilities).map(([table, rows]) => [table, rows.size]),
	),
	checks,
};
assert.equal(result.totalRawRows, 26512);
await fs.writeFile(
	path.join(dataDir, "verification-receipt.json"),
	JSON.stringify(result, null, 2),
	{ mode: 0o600 },
);
console.log(JSON.stringify(result));
