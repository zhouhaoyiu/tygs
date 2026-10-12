import { afterEach, describe, expect, it, vi } from "vitest";
import AMapLoader from "@amap/amap-jsapi-loader";
import { geocodeConfigurationError, requestGeocode } from "../src/lib/geocode";

vi.mock("@amap/amap-jsapi-loader", () => ({ default: { load: vi.fn() } }));
afterEach(() => {
	vi.unstubAllEnvs();
	vi.clearAllMocks();
	vi.useRealTimers();
});

describe("explicit address query", () => {
	it("does not load or transmit an address when security configuration is missing", async () => {
		vi.stubEnv("VITE_AMAP_KEY", "test-key");
		vi.stubEnv("VITE_AMAP_SECURITY_CODE", "");
		expect(geocodeConfigurationError()).toContain("VITE_AMAP_SECURITY_CODE");
		await expect(requestGeocode("测试路12号", "太原市")).rejects.toThrow("暂停发送地址");
		expect(AMapLoader.load).not.toHaveBeenCalled();
	});
	it("bounds component loading and does not query after a late load", async () => {
		vi.useFakeTimers();
		vi.stubEnv("VITE_AMAP_KEY", "test-key");
		vi.stubEnv("VITE_AMAP_SECURITY_CODE", "test-security");
		let finish!: (value: any) => void;
		vi.mocked(AMapLoader.load).mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		const Geocoder = vi.fn();
		const failure = expect(requestGeocode("测试路12号", "太原市")).rejects.toThrow(
			"未发送地址",
		);
		await vi.advanceTimersByTimeAsync(15000);
		await failure;
		finish({ Geocoder });
		await Promise.resolve();
		expect(Geocoder).not.toHaveBeenCalled();
	});
	it("makes one address request and never retries a provider timeout", async () => {
		vi.useFakeTimers();
		vi.stubEnv("VITE_AMAP_KEY", "test-key");
		vi.stubEnv("VITE_AMAP_SECURITY_CODE", "test-security");
		const getLocation = vi.fn();
		vi.mocked(AMapLoader.load).mockResolvedValue({
			Geocoder: class {
				getLocation = getLocation;
			},
		});
		const result = requestGeocode("测试路12号", "太原市");
		await vi.advanceTimersByTimeAsync(15000);
		expect(await result).toMatchObject({ status: "error", candidates: [] });
		expect(getLocation).toHaveBeenCalledTimes(1);
		expect(getLocation.mock.calls[0][0]).toBe("测试路12号");
		await vi.advanceTimersByTimeAsync(60000);
		expect(getLocation).toHaveBeenCalledTimes(1);
	});
});
