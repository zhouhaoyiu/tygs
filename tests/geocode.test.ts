import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import axios from "axios";
import GeocodeReview from "../src/components/GeocodeReview.vue";
import { normalizeGeocodeResult, requestGeocode, type GeocodeDetail } from "../src/lib/geocode";
import { recordPosition, type LocatedRecord } from "../src/lib/locations";
vi.mock("../src/lib/geocode", async (importOriginal) => ({
	...(await importOriginal<typeof import("../src/lib/geocode")>()),
	requestGeocode: vi.fn(),
	geocodeConfigurationError: vi.fn(() => ""),
}));
afterEach(() => {
	vi.restoreAllMocks();
	vi.clearAllMocks();
	sessionStorage.clear();
	document.body.innerHTML = "";
});
const record: LocatedRecord = {
	id: "watermeterroom/1",
	name: "测试",
	identifier: "QA",
	address: "测试路12号",
	targetTable: "watermeterroom",
	targetId: 1,
	location: null,
};
describe("geocode evidence boundary", () => {
	it("preserves missing coordinates instead of coercing null to zero", () => {
		const result = normalizeGeocodeResult("complete", {
			info: "OK",
			resultNum: 1,
			geocodes: [
				{
					formattedAddress: "测试",
					level: "道路",
					location: { lng: null, lat: "" },
					addressComponent: { city: [], streetNumber: "12号" },
				},
			],
		});
		expect(result.candidates[0]).toMatchObject({
			longitude: null,
			latitude: null,
			city: "",
			number: "12号",
		});
		expect(result.rawResponse).toMatchObject({ resultNum: 1 });
	});
	it("normalizes coordinates and keeps the full provider response", () => {
		const response = {
			info: "OK",
			resultNum: 1,
			geocodes: [
				{
					location: { lng: "112.5", lat: 37.8 },
					adcode: "140106",
					addressComponent: { city: "太原市", street: "测试路", streetNumber: "12号" },
				},
			],
		};
		const result = normalizeGeocodeResult("complete", response);
		expect(result.candidates[0]).toMatchObject({
			longitude: 112.5,
			latitude: 37.8,
			adcode: "140106",
			city: "太原市",
		});
		expect(result.rawResponse).toEqual(response);
	});
	it("never plots a review candidate and gives manual coordinates precedence", () => {
		const geocode = {
			id: 1,
			decision: "review",
			reason: "低精度",
			longitude: 112.5,
			latitude: 37.8,
			createdAt: "",
		};
		expect(recordPosition({ ...record, geocode })).toBeUndefined();
		expect(
			recordPosition({ ...record, geocode: { ...geocode, decision: "address_matched" } }),
		).toEqual([112.5, 37.8]);
		expect(
			recordPosition({
				...record,
				geocode: { ...geocode, decision: "address_matched" },
				location: {
					longitude: 112.6,
					latitude: 37.9,
					crs: "GCJ02",
					evidence: "测试人工依据",
					actor: "qa",
					updatedAt: "",
					revision: 1,
				},
			}),
		).toEqual([112.6, 37.9]);
	});
	it("does not query externally on opening and retries only local persistence after save failure", async () => {
		sessionStorage.setItem("facilityRole", "0");
		const detail: GeocodeDetail = {
			sourceAddress: "测试路12号",
			queryAddress: "测试路12号",
			city: "太原市",
			blocked: "",
			history: [],
		};
		vi.spyOn(axios, "get").mockResolvedValue({ data: detail });
		const post = vi
			.spyOn(axios, "post")
			.mockRejectedValueOnce(new Error("断线"))
			.mockResolvedValue({ data: detail });
		vi.mocked(requestGeocode).mockResolvedValue({
			status: "complete",
			info: "OK",
			resultCount: 0,
			candidates: [],
			rawResponse: { info: "OK" },
		});
		const wrapper = mount(GeocodeReview, {
			attachTo: document.body,
			props: { modelValue: false, record },
			global: { plugins: [ElementPlus], stubs: { teleport: true } },
		});
		await wrapper.setProps({ modelValue: true });
		await flushPromises();
		expect(requestGeocode).not.toHaveBeenCalled();
		await wrapper
			.findAll("button")
			.find((b) => b.text() === "查询此地址")!
			.trigger("click");
		await flushPromises();
		expect(wrapper.text()).toContain("重试保存结果");
		await wrapper
			.findAll("button")
			.find((b) => b.text() === "重试保存结果")!
			.trigger("click");
		await flushPromises();
		expect(requestGeocode).toHaveBeenCalledTimes(1);
		expect(requestGeocode).toHaveBeenCalledWith("测试路12号", "太原市");
		expect(post.mock.calls[0][1]).toEqual(post.mock.calls[1][1]);
		wrapper.unmount();
	});
});
