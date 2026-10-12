import AMapLoader from "@amap/amap-jsapi-loader";

export type GeocodeCandidate = {
	formattedAddress: string;
	province: string;
	city: string;
	district: string;
	adcode: string;
	street: string;
	number: string;
	level: string;
	longitude: number | null;
	latitude: number | null;
};
export type GeocodeResult = {
	status: string;
	info: string;
	resultCount: number;
	candidates: GeocodeCandidate[];
	rawResponse: unknown;
};
export type GeocodeEntry = {
	id: number;
	sourceAddress: string;
	queryAddress: string;
	decision: string;
	reason: string;
	actor: string;
	createdAt: string;
	current: boolean;
	result: GeocodeResult;
};
export type GeocodeDetail = {
	sourceAddress: string;
	queryAddress: string;
	city: string;
	blocked: string;
	history: GeocodeEntry[];
};
export const geocodeLabels: Record<string, string> = {
	address_matched: "地址匹配",
	review: "待核实",
	unavailable: "服务不可用",
};
const string = (value: unknown) => (typeof value === "string" ? value : "");
const coordinate = (value: unknown) =>
	value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))
		? Number(value)
		: null;

export function normalizeGeocodeResult(status: string, result: any): GeocodeResult {
	const input = Array.isArray(result?.geocodes) ? result.geocodes : [];
	const candidates = input
		.filter((item: unknown) => item && typeof item === "object")
		.map((item: any) => {
			const address = item.addressComponent || {};
			const longitude = coordinate(item.location?.lng),
				latitude = coordinate(item.location?.lat);
			return {
				formattedAddress: string(item.formattedAddress),
				province: string(address.province),
				city: string(address.city),
				district: string(address.district),
				adcode: string(item.adcode || address.adcode),
				street: string(address.street),
				number: string(address.streetNumber || address.number),
				level: string(item.level),
				longitude,
				latitude,
			};
		});
	const count = Number(result?.resultNum ?? input.length);
	return {
		status,
		info: string(result?.info) || string(result) || "未知响应",
		resultCount: Number.isInteger(count) && count >= 0 ? count : input.length,
		candidates,
		rawResponse: JSON.parse(JSON.stringify(result ?? null)),
	};
}

export function geocodeConfigurationError(): string {
	if (!import.meta.env.VITE_AMAP_KEY) return "地址查询未配置高德 Key";
	if (!import.meta.env.VITE_AMAP_SECURITY_CODE)
		return "地址查询未配置高德安全密钥 VITE_AMAP_SECURITY_CODE，当前暂停发送地址";
	return "";
}

export async function requestGeocode(address: string, city: string): Promise<GeocodeResult> {
	const configurationError = geocodeConfigurationError();
	if (configurationError) throw new Error(configurationError);
	const key = import.meta.env.VITE_AMAP_KEY;
	const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_CODE;
	(window as unknown as { _AMapSecurityConfig: object })._AMapSecurityConfig = {
		securityJsCode,
	};
	let loadTimer: ReturnType<typeof setTimeout> | undefined;
	const AMap = await Promise.race([
		AMapLoader.load({ key, version: "2.0", plugins: ["AMap.Geocoder"] }),
		new Promise<never>((_, reject) => {
			loadTimer = setTimeout(() => reject(new Error("定位组件加载超时，未发送地址")), 15000);
		}),
	]).finally(() => clearTimeout(loadTimer));
	const geocoder = new AMap.Geocoder({ city, batch: false });
	return new Promise((resolve) => {
		const timer = setTimeout(
			() =>
				resolve({
					status: "error",
					info: "请求超时，未自动重试",
					resultCount: 0,
					candidates: [],
					rawResponse: null,
				}),
			15000,
		);
		geocoder.getLocation(address, (status: string, result: unknown) => {
			clearTimeout(timer);
			resolve(normalizeGeocodeResult(status, result));
		});
	});
}
