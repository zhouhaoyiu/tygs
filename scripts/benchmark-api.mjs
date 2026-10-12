import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const phase = process.argv[2];
if (!["before", "after"].includes(phase)) throw new Error("Use before or after");
const dataDir = path.join(root, "local-tygs-data");
const credentials = JSON.parse(await fs.readFile(path.join(dataDir, "credentials.json"), "utf8"));
const base = "http://127.0.0.1:8097";
const login = await fetch(base + "/admin/adminLogin", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ userName: credentials.userName, passWord: credentials.passWord }),
});
if (!login.ok) throw new Error("Local benchmark sign-in failed");
const { token } = await login.json();
const routes = [
	"/WaterMeterRoom/getAllWaterMeterRoomInfo",
	"/WaterMeterWell/getAllWaterMeterWellInfo",
	"/FireHydrant/getAllFireHydrantInfo",
	"/ValueWell/getAllValueWellInfo",
	"/Tygs/getWaterMeterCount",
	"/locations/summary",
	"/locations/records?size=30",
	"/ledger/summary",
	"/ledger/records?kind=rooms&size=30",
	"/ledger/relations",
	...(phase === "after"
		? ["rooms", "meters", "hydrants", "valves"].map(
				(type) => `/facilities/${type}/records?size=30`,
			)
		: []),
];
const results = [];
for (const route of routes) {
	const samples = [];
	let bodyBytes, rowCount, total;
	for (let i = 0; i < 6; i++) {
		const start = performance.now();
		const response = await fetch(base + route, {
			headers: { Authorization: `Bearer ${token}`, "Accept-Encoding": "identity" },
			signal: AbortSignal.timeout(60000),
		});
		if (!response.ok) throw new Error(`${route}: ${response.status}`);
		const body = await response.text();
		const elapsed = performance.now() - start;
		const parsed = JSON.parse(body);
		bodyBytes = Buffer.byteLength(body);
		rowCount = Array.isArray(parsed) ? parsed.length : parsed.rows?.length;
		total = Array.isArray(parsed) ? parsed.length : parsed.total;
		samples.push(Number(elapsed.toFixed(2)));
	}
	const warm = samples.slice(1).sort((a, b) => a - b);
	const result = {
		route,
		bodyBytes,
		rowCount,
		total,
		firstMs: samples[0],
		warmMedianMs: warm[2],
		samplesMs: samples,
	};
	results.push(result);
	console.log(JSON.stringify(result));
}
await fetch(base + "/admin/logout", {
	method: "POST",
	headers: { Authorization: `Bearer ${token}` },
});
await fs.writeFile(
	path.join(dataDir, `performance-${phase}.json`),
	JSON.stringify(
		{
			time: new Date().toISOString(),
			phase,
			environment: "local loopback; existing JVM; no artificial network throttling",
			results,
		},
		null,
		2,
	),
	{ mode: 0o600 },
);
