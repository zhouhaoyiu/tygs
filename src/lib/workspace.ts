import axios from "axios";
import { ref } from "vue";
import type { SourceRow } from "./workbook";

export type ModuleField = {
	key: string;
	label: string;
	required: boolean;
	type?: string;
	options?: string[] | null;
};
export type ModuleSchema = {
	key: string;
	title: string;
	managed: boolean;
	fields: ModuleField[];
	returnPath?: string;
	ledgerKind?: string;
};
export type ModuleRecord = {
	id: number;
	values: Record<string, string>;
	revision: string;
	archived: boolean;
};
export type ModuleDetail = ModuleRecord & {
	history: Array<{
		action: string;
		actor: string;
		createdAt: string;
		before: Partial<ModuleRecord>;
		after: ModuleRecord;
	}>;
	sources: Array<{
		sha256: string;
		fileName: string;
		sheetName: string;
		rowNumber: number;
		raw: SourceRow;
	}>;
};
export function requestError(error: unknown): string {
	return axios.isAxiosError(error)
		? error.response?.data?.message ||
				(error.response?.status === 404 ? "当前服务未启用此模块" : error.message)
		: error instanceof Error
			? error.message
			: String(error);
}
export function blankValues(schema: ModuleSchema): Record<string, string> {
	return Object.fromEntries(schema.fields.map((field) => [field.key, ""]));
}
export function useRecordSave() {
	const saving = ref(false),
		saveError = ref("");
	let requestId = "",
		lastPayload = "";
	function resetSubmission() {
		requestId = "";
		lastPayload = "";
		saveError.value = "";
	}
	async function save(
		schema: ModuleSchema,
		values: Record<string, string>,
		record?: ModuleRecord,
	): Promise<ModuleRecord | undefined> {
		if (saving.value) return;
		saving.value = true;
		saveError.value = "";
		const payload = JSON.stringify([schema.key, values]);
		if (!requestId || payload !== lastPayload) {
			requestId = crypto.randomUUID();
			lastPayload = payload;
		}
		try {
			const url = `/workspace/${schema.key}/records`;
			const body = { values, requestId, revision: record?.revision };
			return (
				record ? await axios.put(`${url}/${record.id}`, body) : await axios.post(url, body)
			).data;
		} catch (error) {
			saveError.value = requestError(error);
		} finally {
			saving.value = false;
		}
	}
	return { saving, saveError, resetSubmission, save };
}
