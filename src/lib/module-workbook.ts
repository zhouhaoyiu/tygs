import { read, utils, writeFile, type CellObject, type WorkSheet } from "xlsx";
import { normalizeHeader, type SourceRow } from "./workbook";
import { blankValues, type ModuleSchema } from "./workspace";

export type ModuleImportRow = { raw: SourceRow; values: Record<string, string> };
export type ModuleWorkbook = {
	sha256: string;
	fileName: string;
	rows: ModuleImportRow[];
	unmapped: string[];
};

function text(cell: CellObject | undefined): string {
	if (cell?.t === "e" || (cell?.f && cell.v == null))
		throw new Error("存在错误单元格或未计算公式");
	if (cell?.v == null) return "";
	return cell.t === "n" && cell.w ? cell.w : String(cell.v);
}
function capture(
	sheet: WorkSheet,
	start: number,
	end: number,
	lastColumn: number,
): SourceRow["cells"] {
	const cells: SourceRow["cells"] = {};
	for (let r = start; r <= end; r++)
		for (let c = 0; c <= lastColumn; c++) {
			const address = utils.encode_cell({ r, c }),
				cell = sheet[address] as CellObject | undefined;
			text(cell);
			if (cell && (cell.v != null || cell.f || cell.l))
				cells[address] = {
					value: cell.v ?? null,
					type: cell.t,
					...(cell.z ? { format: String(cell.z) } : {}),
					...(cell.f ? { formula: cell.f } : {}),
					...(cell.l?.Target ? { hyperlink: cell.l.Target } : {}),
				};
		}
	return cells;
}
export async function parseModuleWorkbook(
	bytes: ArrayBuffer | Uint8Array,
	fileName: string,
	schema: ModuleSchema,
	format: "table" | "printed-card" = "table",
): Promise<ModuleWorkbook> {
	if (format === "printed-card" && schema.key !== "cards")
		throw new Error("打印表卡格式仅适用于设施登记卡");
	const buffer = Uint8Array.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
	if (buffer.byteLength > 30 * 1024 * 1024) throw new Error("文件不能超过30 MB");
	const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)), (v) =>
		v.toString(16).padStart(2, "0"),
	).join("");
	const book = read(buffer, { type: "array", cellNF: true, cellDates: false });
	const labels = new Map<string, string>();
	for (const field of schema.fields) {
		labels.set(normalizeHeader(field.label), field.key);
		labels.set(field.key, field.key);
	}
	const rows: ModuleImportRow[] = [],
		unmapped = new Set<string>();
	function add(
		sheet: string,
		rowNumber: number,
		rawValues: Record<string, string>,
		cells: SourceRow["cells"],
	) {
		const values = blankValues(schema),
			seen = new Set<string>();
		for (const [label, value] of Object.entries(rawValues)) {
			const key = labels.get(normalizeHeader(label));
			if (!key) {
				if (value.trim()) unmapped.add(label);
				continue;
			}
			if (seen.has(key)) throw new Error(`${sheet} 第${rowNumber}行重复映射字段：${label}`);
			seen.add(key);
			values[key] = value;
		}
		for (const field of schema.fields)
			if (field.required && !values[field.key].trim())
				throw new Error(`${sheet} 第${rowNumber}行缺少${field.label}`);
		rows.push({ raw: { sheet, rowNumber, values: rawValues, cells }, values });
	}
	for (const sheetName of book.SheetNames) {
		const sheet = book.Sheets[sheetName];
		if (!sheet["!ref"]) continue;
		const range = utils.decode_range(sheet["!ref"]);
		if (range.e.r >= 100000 || range.e.c > 99) throw new Error("单张表最多100,000行、100列");
		const headers = Array.from({ length: range.e.c + 1 }, (_, c) =>
			text(sheet[utils.encode_cell({ r: 0, c })]),
		);
		const mappedHeaders = headers.map((h) => labels.get(normalizeHeader(h))).filter(Boolean);
		const isTable = schema.fields
			.filter((f) => f.required)
			.every((f) => mappedHeaders.includes(f.key));
		if (format === "table" && isTable) {
			const nonempty = headers.filter((h) => h.trim()).map(normalizeHeader);
			if (new Set(nonempty).size !== nonempty.length)
				throw new Error(`${sheetName} 存在重复表头`);
			for (let r = 1; r <= range.e.r; r++) {
				const values = Object.fromEntries(
					headers.map((h, c) => [
						h || `_unnamed_${c + 1}`,
						text(sheet[utils.encode_cell({ r, c })]),
					]),
				);
				if (Object.values(values).every((v) => !v.trim())) continue;
				add(sheetName, r + 1, values, capture(sheet, r, r, range.e.c));
			}
		} else if (format === "printed-card") {
			// Legacy printed cards use label/value pairs in repeated blocks, not parallel field arrays.
			let start = -1,
				values: Record<string, string> = {};
			function finish(end: number) {
				if (start >= 0)
					add(sheetName, start + 1, values, capture(sheet, start, end, range.e.c));
			}
			for (let r = 0; r <= range.e.r; r++) {
				const row = Array.from({ length: range.e.c + 1 }, (_, c) =>
					text(sheet[utils.encode_cell({ r, c })]),
				);
				const firstLabel = row.findIndex((v) => labels.get(normalizeHeader(v)) === "ssmc");
				if (firstLabel >= 0) {
					finish(r - 1);
					start = r;
					values = {};
				}
				if (start < 0) continue;
				for (let c = 0; c < row.length; c++) {
					if (!labels.has(normalizeHeader(row[c]))) continue;
					const label = row[c];
					if (
						Object.keys(values).some(
							(h) =>
								labels.get(normalizeHeader(h)) ===
								labels.get(normalizeHeader(label)),
						)
					)
						throw new Error(`${sheetName} 第${r + 1}行字段重复，请使用导入模板核对`);
					let next = c + 1;
					while (next < row.length && !row[next].trim()) next++;
					values[label] =
						next < row.length && !labels.has(normalizeHeader(row[next]))
							? row[next]
							: "";
					if (values[label]) c = next;
				}
			}
			finish(range.e.r);
			if (start < 0) throw new Error(`${sheetName} 不是可识别的表卡格式`);
		} else throw new Error(`${sheetName} 缺少必需表头，请使用本模块导入模板`);
	}
	if (!rows.length) throw new Error("文件没有可导入记录");
	if (rows.length > 100000) throw new Error("单次文件最多100,000条记录");
	return { sha256, fileName, rows, unmapped: [...unmapped] };
}
export function downloadModuleTemplate(schema: ModuleSchema) {
	const book = utils.book_new();
	utils.book_append_sheet(book, utils.aoa_to_sheet([schema.fields.map((f) => f.label)]), "数据");
	writeFile(book, `${schema.title}-导入模板.xlsx`);
}
export function exportModuleRows(
	schema: ModuleSchema,
	rows: Array<{ values: Record<string, string> }>,
) {
	const book = utils.book_new();
	utils.book_append_sheet(
		book,
		utils.aoa_to_sheet([
			schema.fields.map((f) => f.label),
			...rows.map((r) => schema.fields.map((f) => r.values[f.key] ?? "")),
		]),
		"记录",
	);
	writeFile(book, `${schema.title}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
