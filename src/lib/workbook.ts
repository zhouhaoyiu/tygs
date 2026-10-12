import type { CellObject } from "xlsx";

export type LedgerKind = "meters" | "rooms" | "chambers" | "recheck" | "maintenance";
export const ledgerNames: Record<LedgerKind, string> = {
	meters: "总表采集",
	rooms: "水表间采集",
	chambers: "井室采集",
	recheck: "总表复核",
	maintenance: "阀门维护检修",
};
export type SourceRow = {
	sheet: string;
	rowNumber: number;
	values: Record<string, string>;
	cells: Record<
		string,
		{ value: unknown; type: string; format?: string; formula?: string; hyperlink?: string }
	>;
};
export type ParsedWorkbook = {
	fileName: string;
	sha256: string;
	kind: LedgerKind;
	expectedRows: number;
	rows: SourceRow[];
};

export function normalizeHeader(value: string): string {
	return value
		.normalize("NFKC")
		.replace(/\((必填|自动)\)/g, "")
		.replace(/[\s:]+/g, "");
}

export function inferKind(headers: string[]): LedgerKind {
	const keys = new Set(headers.map(normalizeHeader));
	if (keys.has("本次维护、检修内容") && keys.has("检修时间")) return "maintenance";
	if (keys.has("井内其余水表口径及用途") && keys.has("户号")) return "recheck";
	if (keys.has("小区名称") && keys.has("水表位置")) return "rooms";
	if (keys.has("井室类型") && keys.has("街道名称")) return "chambers";
	if (keys.has("户号") && keys.has("水表厂家") && keys.has("井深")) return "meters";
	throw new Error("无法识别台账表头，请核对文件");
}

export async function parseWorkbook(
	bytes: ArrayBuffer | Uint8Array,
	fileName: string,
): Promise<ParsedWorkbook> {
	const buffer = Uint8Array.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
	if (buffer.byteLength > 30 * 1024 * 1024) throw new Error("文件不能超过 30 MB");
	const { read, utils } = await import("xlsx");
	const hash = await globalThis.crypto.subtle.digest("SHA-256", buffer);
	const sha256 = Array.from(new Uint8Array(hash), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
	const book = read(buffer, { type: "array", cellNF: true, cellDates: false });
	const rows: SourceRow[] = [];
	let kind: LedgerKind | undefined;
	for (const sheetName of book.SheetNames) {
		const sheet = book.Sheets[sheetName];
		if (!sheet["!ref"]) continue;
		const range = utils.decode_range(sheet["!ref"]);
		if (range.e.r > 100000 || range.e.c > 99)
			throw new Error("单张工作表最多支持 100,000 行、100 列");
		const headers: string[] = [];
		for (let c = 0; c <= range.e.c; c++) {
			const cell = sheet[utils.encode_cell({ r: 0, c })] as CellObject | undefined;
			headers.push(cell?.v == null ? "" : String(cell.v));
		}
		if (headers.every((header) => !header.trim()))
			throw new Error(`${sheetName} 的第一行没有表头`);
		const nonempty = headers.filter((header) => header.trim());
		if (new Set(nonempty.map(normalizeHeader)).size !== nonempty.length)
			throw new Error(`${sheetName} 存在重复表头`);
		const sheetKind = inferKind(headers);
		if (kind && kind !== sheetKind) throw new Error("同一文件包含不同台账类型，请分开导入");
		kind = sheetKind;
		for (let r = 1; r <= range.e.r; r++) {
			const values: Record<string, string> = {};
			const cells: SourceRow["cells"] = {};
			let hasValue = false;
			for (let c = 0; c <= range.e.c; c++) {
				const address = utils.encode_cell({ r, c });
				const cell = sheet[address] as CellObject | undefined;
				const header = headers[c] || `_unnamed_${c + 1}`;
				if (cell?.t === "e" || (cell?.f && cell.v == null))
					throw new Error(`${sheetName}!${address} 含错误或未计算公式`);
				const value = cell?.v;
				// Use the displayed form of numeric identifiers, but preserve the typed cell separately.
				const identifier = /^(编号|户号)$/.test(normalizeHeader(header));
				const date = cell?.z && /[yd]/i.test(String(cell.z)) && cell.t === "n";
				values[header] =
					value == null ? "" : (identifier || date) && cell?.w ? cell.w : String(value);
				if (values[header].trim()) hasValue = true;
				if (cell && (value != null || cell.f || cell.l))
					cells[address] = {
						value: value ?? null,
						type: cell.t,
						...(cell.z ? { format: String(cell.z) } : {}),
						...(cell.f ? { formula: cell.f } : {}),
						...(cell.l?.Target ? { hyperlink: cell.l.Target } : {}),
					};
			}
			if (hasValue) rows.push({ sheet: sheetName, rowNumber: r + 1, values, cells });
		}
	}
	if (!kind || !rows.length) throw new Error("文件没有可导入记录");
	if (rows.length > 100000) throw new Error("单次文件最多支持 100,000 条记录");
	return { fileName, sha256, kind, expectedRows: rows.length, rows };
}

export function photoLinks(
	values: Record<string, string>,
): Array<{ label: string; url: string; sharedPage: boolean }> {
	const result: Array<{ label: string; url: string; sharedPage: boolean }> = [];
	for (const [label, value] of Object.entries(values)) {
		if (!/照片|拍照/.test(label)) continue;
		for (const match of value.match(/https?:\/\/[^\s，,;；]+/g) || []) {
			try {
				const url = new URL(match);
				if (url.username || url.password) continue;
				result.push({
					label: normalizeHeader(label),
					url: url.href,
					sharedPage:
						url.hostname === "drive.weixin.qq.com" ||
						!/\.(jpe?g|png|webp|gif)(?:$|\?)/i.test(url.href),
				});
			} catch {
				/* Preserve invalid URLs in raw values; never execute them. */
			}
		}
	}
	return result;
}
