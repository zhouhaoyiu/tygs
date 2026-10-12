import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import axios from "axios";
import { utils, write, type WorkSheet } from "xlsx";
import RecordForm from "../src/components/RecordForm.vue";
import { parseModuleWorkbook } from "../src/lib/module-workbook";
import { useRecordSave, type ModuleSchema } from "../src/lib/workspace";
import { mapPosition, validLocation, type FacilityLocation } from "../src/lib/locations";

const cards: ModuleSchema = {
	key: "cards",
	title: "表卡",
	managed: true,
	fields: [
		{ key: "ssmc", label: "设施名称", required: true },
		{ key: "ssgx", label: "所属管线", required: true },
		{ key: "jsbh", label: "井室编号", required: true },
		{ key: "js", label: "井深", required: false },
		{ key: "remarks", label: "备注", required: false },
	],
};
function workbook(sheets: unknown[][][], edit?: (sheet: WorkSheet) => void) {
	const book = utils.book_new();
	sheets.forEach((rows, i) => {
		const sheet = utils.aoa_to_sheet(rows);
		if (i === 0) edit?.(sheet);
		utils.book_append_sheet(book, sheet, `表${i + 1}`);
	});
	return write(book, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}
const headers = ["设施名称", "所属管线", "井室编号", "井深", "未知列"];
describe("module workbook", () => {
	it("retains source cells, zero, formatted identifiers and unknown columns across sheets", async () => {
		const result = await parseModuleWorkbook(
			workbook(
				[
					[headers, ["测试设施", "测试管线", 12, 0, "原文"]],
					[headers, ["测试2", "管线2", "0002"]],
				],
				(sheet) => {
					sheet.C2.z = "000000";
				},
			),
			"test.xlsx",
			cards,
		);
		expect(result.rows).toHaveLength(2);
		expect(result.rows[0].values).toMatchObject({ jsbh: "000012", js: "0" });
		expect(result.rows[0].raw.cells.C2).toMatchObject({ value: 12, format: "000000" });
		expect(result.rows[0].raw.values["未知列"]).toBe("原文");
		expect(result.unmapped).toEqual(["未知列"]);
		expect(result.rows[1].raw.sheet).toBe("表2");
	});
	it("parses printed cards starting on the first row without parallel-array drift", async () => {
		const result = await parseModuleWorkbook(
			workbook([
				[
					["设施名称", "测试1", "所属管线", "线1", "井室编号", "0001"],
					["井深", 0, "备注", "第一张"],
					[],
					["设施名称", "测试2"],
					["所属管线", "线2", "井室编号", "0002"],
				],
			]),
			"printed.xlsx",
			cards,
			"printed-card",
		);
		expect(result.rows.map((r) => r.raw.rowNumber)).toEqual([1, 4]);
		expect(result.rows[0].values).toMatchObject({
			ssmc: "测试1",
			jsbh: "0001",
			js: "0",
			remarks: "第一张",
		});
		expect(result.rows[1].values).toMatchObject({
			ssmc: "测试2",
			jsbh: "0002",
			js: "",
			remarks: "",
		});
		expect(result.rows[0].raw.cells.B2.value).toBe(0);
	});
	it("rejects incomplete printed blocks rather than borrowing later fields", async () => {
		await expect(
			parseModuleWorkbook(
				workbook([
					[
						["设施名称", "缺管线", "井室编号", "1"],
						["设施名称", "完整", "所属管线", "线2", "井室编号", "2"],
					],
				]),
				"bad.xlsx",
				cards,
				"printed-card",
			),
		).rejects.toThrow("缺少所属管线");
	});
	it("rejects duplicate aliases and duplicate fields inside a printed block", async () => {
		await expect(
			parseModuleWorkbook(
				workbook([[headers.concat("jsbh"), ["n", "l", "1", 0, "", "2"]]]),
				"bad.xlsx",
				cards,
			),
		).rejects.toThrow("重复映射");
		await expect(
			parseModuleWorkbook(
				workbook([
					[
						["设施名称", "n", "所属管线", "l", "井室编号", "1"],
						["井室编号", "2"],
					],
				]),
				"bad.xlsx",
				cards,
				"printed-card",
			),
		).rejects.toThrow("字段重复");
	});
	it("rejects error cells and formulas without cached values", async () => {
		for (const cell of [
			{ t: "e", v: 7 },
			{ t: "n", f: "1+1" },
		]) {
			await expect(
				parseModuleWorkbook(
					workbook([[headers, ["n", "l", "1"]]], (s) => {
						s.D2 = cell;
					}),
					"bad.xlsx",
					cards,
				),
			).rejects.toThrow("错误单元格或未计算公式");
		}
	});
	it("does not accumulate records when the same file is selected twice", async () => {
		const bytes = workbook([[headers, ["n", "l", "1"]]]);
		const first = await parseModuleWorkbook(bytes, "a.xlsx", cards);
		expect(await parseModuleWorkbook(bytes, "a.xlsx", cards)).toEqual(first);
	});
});
describe("module saving and forms", () => {
	beforeEach(() => vi.restoreAllMocks());
	it("reuses the request ID on a failed create retry and resets it for changed data", async () => {
		const post = vi
			.spyOn(axios, "post")
			.mockRejectedValueOnce(new Error("断线"))
			.mockResolvedValue({ data: { id: 1 } });
		const saver = useRecordSave();
		const values = { ssmc: "测试" };
		expect(await saver.save(cards, values)).toBeUndefined();
		expect(saver.saveError.value).toBe("断线");
		await saver.save(cards, values);
		const requestId = (index: number) =>
			(post.mock.calls[index][1] as { requestId: string }).requestId;
		expect(requestId(0)).toBe(requestId(1));
		await saver.save(cards, { ssmc: "另一条" });
		expect(requestId(2)).not.toBe(requestId(1));
	});
	it("validates required values and resets to the original record", async () => {
		const wrapper = mount(RecordForm, {
			props: {
				schema: cards,
				busy: false,
				error: "",
				initial: { ssmc: "原名", ssgx: "原线", jsbh: "0001" },
			},
			global: { plugins: [ElementPlus] },
		});
		const name = wrapper.get('input[aria-label="设施名称"]');
		await name.setValue("");
		await wrapper.get("form").trigger("submit");
		expect(wrapper.text()).toContain("请填写设施名称");
		expect(wrapper.emitted("save")).toBeUndefined();
		await wrapper
			.findAll("button")
			.find((b) => b.text() === "重置")!
			.trigger("click");
		expect((name.element as HTMLInputElement).value).toBe("原名");
		await wrapper.get("form").trigger("submit");
		expect(wrapper.emitted("save")?.[0][0]).toMatchObject({ jsbh: "0001", ssmc: "原名" });
		wrapper.unmount();
	});
});
describe("coordinate boundary", () => {
	const location: FacilityLocation = {
		longitude: 112.55,
		latitude: 37.87,
		crs: "WGS84",
		evidence: "仅测试",
		actor: "qa",
		updatedAt: "",
		revision: 1,
	};
	it("checks finite numeric bounds and never changes stored WGS84 values", () => {
		expect(validLocation(180, -90)).toBe(true);
		for (const value of [NaN, Infinity, "112.5", 181, undefined])
			expect(validLocation(value, 37)).toBe(false);
		const before = { ...location };
		const converted = mapPosition(location);
		expect(location).toEqual(before);
		expect(converted[0]).not.toBe(location.longitude);
		expect(converted[0]).toBeCloseTo(112.55, 1);
	});
	it("keeps GCJ02 coordinates unchanged", () => {
		expect(mapPosition({ ...location, crs: "GCJ02" })).toEqual([112.55, 37.87]);
	});
});
