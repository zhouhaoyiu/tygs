import axios from "axios";
import { onBeforeUnmount, ref, shallowRef } from "vue";
import { requestError } from "./workspace";

export type FacilityKind = "rooms" | "meters" | "hydrants" | "valves";
export type FacilityFilters = {
	field?: string;
	q?: string;
	streetName?: string;
	manufactor?: string;
	caliber?: string[];
	wellChamberType?: string[];
};
export type FacilityRow = Record<string, any> & { id: number };
export type FacilityPage = { rows: FacilityRow[]; total: number; page: number; size: number };

export async function fetchFacilityPage(
	kind: FacilityKind,
	filters: FacilityFilters,
	page: number,
	size: number,
	signal?: AbortSignal,
): Promise<FacilityPage> {
	const params = new URLSearchParams({ page: String(page), size: String(size) });
	for (const [key, value] of Object.entries(filters)) {
		for (const item of Array.isArray(value) ? value : [value])
			if (item !== undefined && item !== "") params.append(key, item);
	}
	return (await axios.get(`/facilities/${kind}/records`, { params, signal })).data;
}

export function useFacilityQuery(kind: FacilityKind) {
	const rows = shallowRef<FacilityRow[]>([]),
		total = ref(0),
		page = ref(1),
		size = ref(30);
	const loading = ref(false),
		error = ref("");
	let applied: FacilityFilters = {},
		generation = 0,
		controller: AbortController | undefined;
	async function load() {
		const request = ++generation;
		controller?.abort();
		controller = new AbortController();
		loading.value = true;
		error.value = "";
		rows.value = [];
		try {
			const result = await fetchFacilityPage(
				kind,
				applied,
				page.value,
				size.value,
				controller.signal,
			);
			if (request !== generation) return;
			rows.value = result.rows;
			total.value = result.total;
		} catch (e) {
			if (request === generation && !axios.isCancel(e)) error.value = requestError(e);
		} finally {
			if (request === generation) loading.value = false;
		}
	}
	async function search(filters: FacilityFilters = {}) {
		applied = Object.fromEntries(
			Object.entries(filters).map(([key, value]) => [
				key,
				Array.isArray(value) ? [...value] : value,
			]),
		);
		page.value = 1;
		await load();
	}
	async function changePage(value: number) {
		if (page.value === value) return;
		page.value = value;
		await load();
	}
	async function changeSize(value: number) {
		if (size.value === value) return;
		size.value = value;
		page.value = 1;
		await load();
	}
	async function exportRows() {
		const filters = structuredClone(applied),
			result: FacilityRow[] = [];
		let expected: number | undefined;
		for (let current = 1; ; current++) {
			const data = await fetchFacilityPage(kind, filters, current, 500);
			if (data.total > 100000) throw new Error("导出超过100,000条，请缩小筛选范围");
			if (expected !== undefined && expected !== data.total)
				throw new Error("数据条数已变化，请重新导出");
			expected = data.total;
			result.push(...data.rows);
			if (result.length >= expected) break;
			if (!data.rows.length) throw new Error("导出结果不完整，请重试");
		}
		if (new Set(result.map((row) => row.id)).size !== result.length)
			throw new Error("导出出现重复记录，请重试");
		return result;
	}
	onBeforeUnmount(() => {
		++generation;
		controller?.abort();
	});
	return {
		rows,
		total,
		page,
		size,
		loading,
		error,
		load,
		search,
		changePage,
		changeSize,
		exportRows,
	};
}
