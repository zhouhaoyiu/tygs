<template>
	<section>
		<h1>新增表井（总表）</h1>
		<el-tabs v-model="active" class="meter-tabs">
			<el-tab-pane v-if="localLedger" label="文件导入" name="file">
				<el-button
					icon="Upload"
					type="primary"
					@click="$router.push('/home/ledger?kind=meters&import=1')"
					>导入总表工作簿</el-button
				>
			</el-tab-pane>
			<el-tab-pane label="手动输入" name="manual">
				<el-form
					:model="form"
					label-width="110px"
					class="meter-form"
					@submit.prevent="save"
				>
					<el-form-item v-for="(label, field) in fields" :key="field" :label="label">
						<el-input v-model="form[field]" :disabled="busy" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" native-type="submit" icon="Check" :loading="busy"
							>保存</el-button
						>
						<el-button icon="RefreshLeft" :disabled="busy" @click="reset"
							>重置</el-button
						>
					</el-form-item>
				</el-form>
				<p v-if="error" role="alert">{{ error }}</p>
			</el-tab-pane>
		</el-tabs>
	</section>
</template>
<script setup lang="ts">
import { reactive, ref } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
const fields = {
	filledBy: "填写人",
	accountName: "户名",
	accountNumber: "户号",
	address: "地址",
	coordinates: "位置原文",
	caliber: "口径",
	operatingStatus: "运行状态",
	waterNature: "用水性质",
	wellDepth: "井深",
	includedFacilities: "内含设施",
	waterMeterManufacturer: "水表厂家",
	accountIdentifier: "编号",
};
const form = reactive(
	Object.fromEntries(Object.keys(fields).map((key) => [key, ""])) as Record<
		keyof typeof fields,
		string
	>,
);
const localLedger = import.meta.env.VITE_LOCAL_LEDGER === "1";
const active = ref(localLedger ? "file" : "manual"),
	busy = ref(false),
	error = ref("");
function reset() {
	for (const field of Object.keys(fields) as Array<keyof typeof fields>) form[field] = "";
	error.value = "";
}
async function save() {
	if (busy.value) return;
	if (!form.accountName.trim() || !form.accountNumber.trim()) {
		error.value = "请填写户名和户号";
		return;
	}
	busy.value = true;
	error.value = "";
	try {
		const { data } = await axios.post("/WaterMeterWell/addWaterMeterWell", {
			...form,
			writtingTime: new Date().toISOString(),
		});
		if (Number(data.code) !== 0) throw new Error(data.msg || "未保存");
		reset();
		ElMessage.success("表井已保存");
	} catch (e) {
		error.value = axios.isAxiosError(e) ? e.response?.data?.message || e.message : String(e);
	} finally {
		busy.value = false;
	}
}
</script>
<style scoped>
.meter-tabs {
	margin-top: 24px;
}
.meter-form {
	max-width: 650px;
}
[role="alert"] {
	color: #aa3f42;
}
</style>
