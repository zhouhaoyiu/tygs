import { describe, expect, it } from "vitest";
import { utils, write } from "xlsx";
import { inferKind, normalizeHeader, parseWorkbook, photoLinks } from "../src/lib/workbook";

function bytes(rows: unknown[][]) {
	const book = utils.book_new();
	utils.book_append_sheet(book, utils.aoa_to_sheet(rows), "台账");
	return write(book, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}
const headers = ["户号（必填）", "水表厂家（必填）", "井深（必填）", "编号", "井外拍照（必填）"];
describe("workbook provenance", () => {
	it("preserves text identifiers, zero, empty cells, and physical row numbers", async () => {
		const result = await parseWorkbook(
			bytes([
				headers,
				["001234", "厂商", 0, "", "https://drive.weixin.qq.com/s?k=test"],
				[],
				["009999", "厂商", 2],
			]),
			"总表.xlsx",
		);
		expect(result.kind).toBe("meters");
		expect(result.expectedRows).toBe(2);
		expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
		expect(result.rows.map((row) => row.rowNumber)).toEqual([2, 4]);
		expect(result.rows[0].values[headers[0]]).toBe("001234");
		expect(result.rows[0].values[headers[2]]).toBe("0");
		expect(result.rows[0].values[headers[3]]).toBe("");
		expect(result.rows[0].cells.C2.value).toBe(0);
	});
	it("does not accumulate rows from a previous file", async () => {
		const input = bytes([headers, ["001234", "厂商", 0]]);
		const first = await parseWorkbook(input, "first.xlsx");
		const second = await parseWorkbook(input, "second.xlsx");
		expect(second.rows).toEqual(first.rows);
		expect(second.sha256).toBe(first.sha256);
		expect(second.rows).toHaveLength(1);
	});
	it("rejects duplicate normalized headers and unsupported workbooks", async () => {
		await expect(
			parseWorkbook(
				bytes([
					[...headers, "户号"],
					["1", "厂商", 0],
				]),
				"test.xlsx",
			),
		).rejects.toThrow("重复表头");
		await expect(parseWorkbook(bytes([["任意列"], ["任意内容"]]), "test.xlsx")).rejects.toThrow(
			"无法识别",
		);
	});
	it("identifies all five source families with recheck taking priority", () => {
		expect(inferKind(["小区名称（必填）", "水表位置（必填）"])).toBe("rooms");
		expect(inferKind(["井室类型（必填）", "街道名称（必填）"])).toBe("chambers");
		expect(
			inferKind(["户号（必填）", "井内其余水表口径及用途（必填）", "总户数（必填）"]),
		).toBe("recheck");
		expect(inferKind(["本次维护、检修内容（必填）", "检修时间（必填）"])).toBe("maintenance");
		expect(normalizeHeader("表间外拍照：（必填）")).toBe("表间外拍照");
	});
	it("distinguishes share pages from direct images without executing unsafe schemes", () => {
		const links = photoLinks({
			"井外照片（必填）": "https://drive.weixin.qq.com/s?k=test",
			井内照片: "https://example.org/a.jpg",
			其它: "https://example.org/x.jpg",
			拍照: "javascript:alert(1)",
		});
		expect(links).toHaveLength(2);
		expect(links[0].sharedPage).toBe(true);
		expect(links[1].sharedPage).toBe(false);
	});
});
