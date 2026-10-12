import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import ElementPlus, { ElDialog } from "element-plus";
import type { App } from "vue";
import { read, utils, write } from "xlsx";
import Login from "../src/views/Login.vue";
import WaterMeterWell from "../src/views/search/searchWaterMeterWell.vue";
import WaterMeterRoom from "../src/views/search/searchWaterMeterRoom.vue";
import ValueWell from "../src/views/search/searchValueWell.vue";
import FireHydrant from "../src/views/search/searchFireHydrant.vue";
import { repairDateOptions } from "../src/views/search/date-options";

const mounted: VueWrapper[] = [];
const api = { get: vi.fn(), post: vi.fn() };
const message = { error: vi.fn(), success: vi.fn() };
const navigate = vi.fn();
const prompt = vi.fn();
const global = {
	plugins: [ElementPlus, { install(app: App) { Object.assign(app.config.globalProperties, {
		axios: api,
		$message: message,
		$router: { replace: navigate },
		$store: { commit: vi.fn() },
		$prompt: prompt,
	}); } }],
};
beforeEach(() => {
	vi.resetAllMocks();
	sessionStorage.clear();
	api.get.mockResolvedValue({ data: [] });
	api.post.mockResolvedValue({ data: { code: 0, msg: "完成" } });
});
afterEach(() => {
	for (const wrapper of mounted.splice(0)) wrapper.unmount();
	document.body.innerHTML = "";
});

it("submits credentials once and opens the authenticated workspace", async () => {
	let resolve!: (value: unknown) => void;
	api.post.mockReturnValue(
		new Promise((r) => {
			resolve = r;
		}),
	);
	const wrapper = mount(Login, { global });
	mounted.push(wrapper);
	await wrapper.find('input[autocomplete="username"]').setValue("operator");
	await wrapper.find('input[autocomplete="current-password"]').setValue("test-password");
	await wrapper.find("form").trigger("submit");
	await wrapper.find("form").trigger("submit");
	expect(api.post).toHaveBeenCalledTimes(1);
	expect(api.post).toHaveBeenCalledWith("/admin/adminLogin", {
		userName: "operator",
		passWord: "test-password",
	});
	resolve({ data: { token: "test-session", data: { userName: "operator", adminRole: 1 } } });
	await flushPromises();
	expect(sessionStorage.getItem("facilityToken")).toBe("test-session");
	expect(navigate).toHaveBeenCalledWith("/home/index");
});

it("does not persist a session after a failed login", async () => {
	api.post.mockRejectedValue(new Error("Unauthorized"));
	const wrapper = mount(Login, { global });
	mounted.push(wrapper);
	await wrapper.setData({ username: "operator", password: "wrong" });
	await wrapper.vm.login();
	expect(sessionStorage.getItem("facilityToken")).toBeNull();
	expect(navigate).not.toHaveBeenCalled();
	expect(wrapper.vm.busy).toBe(false);
});

describe.each([
	["WaterMeterWell", WaterMeterWell],
	["WaterMeterRoom", WaterMeterRoom],
	["ValueWell", ValueWell],
	["FireHydrant", FireHydrant],
] as const)("%s", (kind, component) => {
	it("opens and closes the repair dialog using the Vue 3 model binding", async () => {
		const wrapper = mount(component, { global, attachTo: document.body });
		mounted.push(wrapper);
		await flushPromises();
		await wrapper.vm.openRepair(42);
		await flushPromises();
		expect(wrapper.vm.repairId).toBe(42);
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		expect(api.get).toHaveBeenCalledWith(`${kind}/get${kind}RepairInfoById`, {
			params: { id: 42 },
		});
		wrapper.findAllComponents(ElDialog).find(dialog => dialog.props("title") === "维修记录")!.vm.$emit("update:modelValue", false);
		await flushPromises();
		expect(wrapper.vm.repairDialog).toBe(false);
	});

	it("retains the request identity and draft when saving fails", async () => {
		const wrapper = mount(component, { global });
		mounted.push(wrapper);
		await flushPromises();
		await wrapper.vm.openRepair(42);
		const requestId = wrapper.vm.repairRequestId;
		await wrapper.setData({
			addRepairText: "更换垫片",
			addRepairTime: "2026-10-12",
			addRepairRemarks: "复查",
		});
		api.post.mockRejectedValue(new Error("offline"));
		await wrapper.vm.updateRepair();
		const payload = api.post.mock.calls[0][1];
		expect(payload.id).toBe(42);
		expect(payload.requestId).toBe(requestId);
		expect(JSON.parse(payload.expectedInfo)).toEqual([]);
		expect(JSON.parse(payload.repairInfo)).toHaveLength(1);
		expect(wrapper.vm.repairInfo).toEqual([]);
		expect(wrapper.vm.repairRequestId).toBe(requestId);
		expect(wrapper.vm.addRepairText).toBe("更换垫片");
		expect(wrapper.vm.repairSaving).toBe(false);
	});

	it("passes the selected facility and operator reason to meter deactivation", async () => {
		const wrapper = mount(component, { global });
		mounted.push(wrapper);
		await flushPromises();
		await wrapper.setData({ waterMeterDialogId: 42 });
		prompt.mockResolvedValue({ value: "换表", action: "confirm" });
		await wrapper.vm.deleteWaterMeter("meter-7");
		expect(api.post).toHaveBeenCalledWith(`${kind}/deleteWaterMeterInfoById`, {
			wallId: 42,
			waterMeterId: "meter-7",
			reason: "换表",
		});
	});
});

it("provides Element Plus date shortcuts and rejects future dates", () => {
	const options = repairDateOptions();
	expect(options.disabledDate(new Date(Date.now() + 86400000))).toBe(true);
	expect(options.shortcuts.every((item) => item.value() instanceof Date)).toBe(true);
});

it("renders the facility edit form without mounting a table column outside a table", async () => {
	const wrapper = mount(WaterMeterWell, { global, attachTo: document.body });
	mounted.push(wrapper);
	await flushPromises();
	const original = { id: 42, accountIdentifier: "CB-042", accountNumber: "001234", accountName: "测试户" };
	wrapper.vm.modify(original);
	await flushPromises();
	expect(wrapper.vm.wallInfoDialog).toBe(true);
	const input = document.querySelector<HTMLInputElement>('input[placeholder="编号"]');
	expect(input?.value).toBe("CB-042");
	wrapper.vm.wallInfoForm.accountIdentifier = "CB-043";
	expect(original.accountIdentifier).toBe("CB-042");
});

it("round-trips spreadsheet text identifiers without changing the source records", () => {
	const records = [{ 户号: "001234", 水表: "000056", 读数: 0 }];
	const snapshot = structuredClone(records);
	const book = utils.book_new();
	utils.book_append_sheet(book, utils.json_to_sheet(records), "台账");
	const bytes = write(book, { bookType: "xlsx", type: "array" });
	const imported = read(bytes, { type: "array" });
	expect(utils.sheet_to_json(imported.Sheets["台账"])).toEqual(snapshot);
	expect(records).toEqual(snapshot);
});
