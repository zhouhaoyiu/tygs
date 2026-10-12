import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import axios from "axios";
import { fetchFacilityPage, useFacilityQuery } from "../src/lib/facility-query";

afterEach(() => vi.restoreAllMocks());
function setup() {
	let query!: ReturnType<typeof useFacilityQuery>;
	const wrapper = mount(defineComponent({ setup() { query = useFacilityQuery("rooms"); return () => null; } }));
	return { query, wrapper };
}
const response = (id: number, total = 65) => ({ data: { rows: [{ id }], total, page: 1, size: 30 } });
describe("bounded facility queries", () => {
	it("sends a page and repeated filter parameters, not a full-table request", async () => {
		const get = vi.spyOn(axios, "get").mockResolvedValue(response(1));
		await fetchFacilityPage("valves", { caliber: ["50", "100"], streetName: "测试街" }, 2, 30);
		expect(get.mock.calls[0][0]).toBe("/facilities/valves/records");
		const params = get.mock.calls[0][1]!.params as URLSearchParams;
		expect(params.getAll("caliber")).toEqual(["50", "100"]);
		expect(params.get("page")).toBe("2");
		expect(params.get("size")).toBe("30");
	});
	it("keeps applied filters on paging and resets to page one for a new search", async () => {
		const get = vi.spyOn(axios, "get").mockResolvedValue(response(1));
		const { query, wrapper } = setup();
		await query.search({ field: "communityName", q: "first" });
		await query.changePage(2);
		expect((get.mock.calls.at(-1)![1]!.params as URLSearchParams).get("q")).toBe("first");
		await query.search({ field: "communityName", q: "second" });
		expect(query.page.value).toBe(1);
		expect(query.rows.value).toHaveLength(1);
		wrapper.unmount();
	});
	it("aborts old requests and ignores their late responses", async () => {
		let finish!: (value: any) => void;
		const get = vi.spyOn(axios, "get").mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValue(response(2));
		const { query, wrapper } = setup();
		const first = query.search({ q: "old", field: "communityName" });
		await query.search({ q: "new", field: "communityName" });
		expect(get.mock.calls[0][1]!.signal!.aborted).toBe(true);
		finish(response(1)); await first;
		expect(query.rows.value[0].id).toBe(2);
		expect(query.loading.value).toBe(false);
		wrapper.unmount();
	});
	it("exports every filtered page and rejects an incomplete or changing result", async () => {
		const get = vi.spyOn(axios, "get").mockResolvedValueOnce(response(1, 2)).mockResolvedValueOnce(response(2, 2));
		const { query, wrapper } = setup();
		expect(await query.exportRows()).toEqual([{ id: 1 }, { id: 2 }]);
		expect((get.mock.calls[1][1]!.params as URLSearchParams).get("page")).toBe("2");
		get.mockResolvedValueOnce(response(1, 2)).mockResolvedValueOnce(response(2, 3));
		await expect(query.exportRows()).rejects.toThrow("数据条数已变化");
		wrapper.unmount();
	});
});
