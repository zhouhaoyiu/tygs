import gcoord from "gcoord";

export type FacilityLocation = {
	longitude: number;
	latitude: number;
	crs: "WGS84" | "GCJ02";
	evidence: string;
	actor: string;
	updatedAt: string;
	revision: number;
};
export type LocatedRecord = {
	id: string;
	name: string;
	identifier: string;
	address: string;
	targetTable: string;
	targetId: number;
	location: FacilityLocation | null;
	geocode?: {
		id: number;
		decision: string;
		reason: string;
		longitude: number | null;
		latitude: number | null;
		createdAt: string;
	} | null;
};
export function validLocation(longitude: unknown, latitude: unknown): boolean {
	return (
		typeof longitude === "number" &&
		Number.isFinite(longitude) &&
		Math.abs(longitude) <= 180 &&
		typeof latitude === "number" &&
		Number.isFinite(latitude) &&
		Math.abs(latitude) <= 90
	);
}
export function recordPosition(record: LocatedRecord): [number, number] | undefined {
	if (record.location) return mapPosition(record.location);
	const result = record.geocode;
	if (result?.decision === "address_matched" && validLocation(result.longitude, result.latitude))
		return [result.longitude!, result.latitude!];
}
export function mapPosition(location: FacilityLocation): [number, number] {
	if (!validLocation(location.longitude, location.latitude)) throw new Error("经纬度超出范围");
	const position: [number, number] = [location.longitude, location.latitude];
	if (location.crs === "GCJ02") return position;
	if (location.crs !== "WGS84") throw new Error("未知坐标系");
	return gcoord.transform(position, gcoord.WGS84, gcoord.GCJ02) as [number, number];
}
