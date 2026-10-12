<template>
	<section class="module-create">
		<header class="module-heading">
			<h1>{{ schema ? `新增${schema.title}` : "新增记录" }}</h1>
			<el-button icon="Back" @click="back">返回查询</el-button>
		</header>
		<div v-if="loading" v-loading="true" class="module-loading" />
		<div v-else-if="loadError" role="alert">
			<p class="module-error">{{ loadError }}</p>
			<el-button icon="Refresh" @click="load">重试</el-button>
		</div>
		<template v-else-if="schema">
			<div v-if="saved" class="module-saved" role="status">
				<h2>记录已保存</h2>
				<p>{{ schema.title }} · 记录 ID {{ saved.id }}</p>
				<dl>
					<template
						v-for="field in schema.fields.filter((f) => f.required)"
						:key="field.key"
						><dt>{{ field.label }}</dt>
						<dd>{{ saved.values[field.key] }}</dd></template
					>
				</dl>
				<el-button type="primary" icon="Plus" @click="newRecord">继续新增</el-button
				><el-button icon="List" @click="back">返回查询</el-button>
			</div>
			<template v-else>
				<div class="module-mode-actions">
					<el-button
						v-if="schema.ledgerKind"
						icon="Upload"
						@click="$router.push(`/home/ledger?kind=${schema.ledgerKind}&import=1`)"
						>导入采集工作簿</el-button
					>
					<el-button
						v-else-if="schema.managed && admin"
						icon="Upload"
						@click="importOpen = true"
						>导入工作簿</el-button
					>
				</div>
				<RecordForm
					:schema="schema"
					:initial="initial"
					:busy="saving"
					:error="saveError"
					@save="submit"
				/>
			</template>
			<ModuleImport
				v-if="schema.managed && admin && importOpen"
				v-model="importOpen"
				:schema="schema"
			/>
		</template>
	</section>
</template>
<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import RecordForm from "./RecordForm.vue";
const ModuleImport = defineAsyncComponent(() => import("./ModuleImport.vue"));
import { requestError, useRecordSave, type ModuleSchema, type ModuleRecord } from "@/lib/workspace";
const props = defineProps<{ moduleKey: string; returnPath?: string }>();
const router = useRouter(),
	schema = ref<ModuleSchema>(),
	loading = ref(false),
	loadError = ref(""),
	saved = ref<ModuleRecord>(),
	initial = ref<Record<string, string>>({}),
	importOpen = ref(false);
const admin = sessionStorage.getItem("facilityRole") === "0";
const { saving, saveError, resetSubmission, save } = useRecordSave();
async function load() {
	loading.value = true;
	loadError.value = "";
	try {
		schema.value = (await axios.get(`/workspace/${props.moduleKey}/schema`)).data;
	} catch (e) {
		loadError.value = requestError(e);
	} finally {
		loading.value = false;
	}
}
function newRecord() {
	saved.value = undefined;
	initial.value = {};
	resetSubmission();
}
function back() {
	router.push(`/home/${props.returnPath || schema.value?.returnPath || "index"}`);
}
async function submit(values: Record<string, string>) {
	if (schema.value) saved.value = await save(schema.value, values);
}
watch(
	() => props.moduleKey,
	() => {
		newRecord();
		load();
	},
	{ immediate: true },
);
</script>
<style scoped>
.module-create {
	width: 100%;
	min-width: 0;
}
.module-heading {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
	margin-bottom: 24px;
	flex-wrap: wrap;
}
.module-heading h1 {
	font-size: 24px;
	margin: 0;
}
.module-loading {
	min-height: 240px;
}
.module-error {
	color: #a13843;
	overflow-wrap: anywhere;
}
.module-mode-actions {
	margin-bottom: 20px;
}
.module-saved {
	padding: 24px 0;
	border-top: 1px solid #dce5e8;
}
.module-saved h2 {
	font-size: 20px;
}
.module-saved dl {
	display: grid;
	grid-template-columns: 130px minmax(0, 1fr);
	margin: 24px 0;
}
.module-saved dt,
.module-saved dd {
	padding: 10px 0;
	margin: 0;
	overflow-wrap: anywhere;
}
.module-saved dt {
	color: #65767b;
}
</style>
