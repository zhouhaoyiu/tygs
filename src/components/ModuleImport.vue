<template>
	<el-dialog
		v-model="opened"
		:title="`导入${schema.title}`"
		width="min(1000px,95vw)"
		:close-on-click-modal="!busy"
		:close-on-press-escape="!busy"
		:show-close="!busy"
	>
		<div class="import-tools">
			<el-radio-group
				v-if="schema.key === 'cards'"
				v-model="format"
				:disabled="busy || parsing"
				aria-label="工作簿格式"
			>
				<el-radio-button value="table">横向表格</el-radio-button>
				<el-radio-button value="printed-card">打印表卡</el-radio-button>
			</el-radio-group>
			<input
				:key="format"
				type="file"
				accept=".xlsx,.xls"
				aria-label="选择模块工作簿"
				:disabled="busy || parsing"
				@change="selectFile"
			/>
			<el-button icon="Download" :disabled="busy" @click="downloadModuleTemplate(schema)"
				>下载模板</el-button
			>
		</div>
		<p v-if="parsing" role="status">正在读取工作簿</p>
		<p v-if="error" role="alert" class="import-error">{{ error }}</p>
		<template v-if="selected">
			<p>{{ selected.fileName }} · {{ selected.rows.length.toLocaleString() }} 条</p>
			<p v-if="selected.unmapped.length" class="import-warning">
				未映射字段：{{ selected.unmapped.join("、") }}
			</p>
			<el-table :data="selected.rows.slice(0, 8)" stripe max-height="310">
				<el-table-column label="工作表" prop="raw.sheet" width="130" />
				<el-table-column label="来源行" prop="raw.rowNumber" width="85" />
				<el-table-column
					v-for="field in schema.fields"
					:key="field.key"
					:label="field.label"
					min-width="160"
					show-overflow-tooltip
				>
					<template #default="scope">{{ scope.row.values[field.key] }}</template>
				</el-table-column>
			</el-table>
			<el-progress
				v-if="processed"
				:percentage="Math.round((processed / selected.rows.length) * 100)"
			/>
			<p v-if="result" role="status">{{ result }}</p>
		</template>
		<template #footer
			><el-button
				type="primary"
				icon="Upload"
				:loading="busy"
				:disabled="!selected || parsing"
				@click="runImport"
				>导入</el-button
			></template
		>
	</el-dialog>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import axios from "axios";
import {
	parseModuleWorkbook,
	downloadModuleTemplate,
	type ModuleWorkbook,
} from "@/lib/module-workbook";
import { requestError, type ModuleSchema } from "@/lib/workspace";
const props = defineProps<{ schema: ModuleSchema }>();
const opened = defineModel<boolean>({ required: true });
const emit = defineEmits<{ done: [] }>();
const selected = ref<ModuleWorkbook>(),
	parsing = ref(false),
	busy = ref(false),
	error = ref(""),
	result = ref(""),
	processed = ref(0);
const format = ref<"table" | "printed-card">("table");
watch(format, () => {
	selected.value = undefined;
	error.value = "";
	result.value = "";
	processed.value = 0;
});
watch(
	() => props.schema.key,
	() => {
		selected.value = undefined;
		error.value = "";
		result.value = "";
		processed.value = 0;
	},
);
async function selectFile(event: Event) {
	selected.value = undefined;
	error.value = "";
	result.value = "";
	processed.value = 0;
	const file = (event.target as HTMLInputElement).files?.[0];
	if (!file) return;
	parsing.value = true;
	try {
		selected.value = await parseModuleWorkbook(
			await file.arrayBuffer(),
			file.name,
			props.schema,
			format.value,
		);
	} catch (e) {
		error.value = requestError(e);
	} finally {
		parsing.value = false;
	}
}
async function runImport() {
	if (!selected.value || busy.value) return;
	busy.value = true;
	error.value = "";
	result.value = "";
	processed.value = 0;
	let inserted = 0,
		skipped = 0;
	try {
		const file = selected.value;
		for (let start = 0; start < file.rows.length; start += 100) {
			const { data } = await axios.post(
				`/workspace/${props.schema.key}/import`,
				{
					sha256: file.sha256,
					fileName: file.fileName,
					rows: file.rows.slice(start, start + 100),
				},
				{ timeout: 60000 },
			);
			inserted += data.inserted;
			skipped += data.skipped;
			processed.value = Math.min(start + 100, file.rows.length);
			result.value = `已保存 ${inserted} 条，同源已存在 ${skipped} 条`;
		}
		emit("done");
	} catch (e) {
		error.value = `${requestError(e)}；已完成批次保留，可用同一文件重试。`;
		emit("done");
	} finally {
		busy.value = false;
	}
}
</script>
<style scoped>
.import-tools {
	display: flex;
	align-items: center;
	gap: 16px;
	flex-wrap: wrap;
}
.import-tools input {
	max-width: 100%;
	min-width: 0;
}
.import-error {
	color: #a13843;
	overflow-wrap: anywhere;
}
.import-warning {
	color: #8f6924;
	overflow-wrap: anywhere;
}
.el-progress {
	margin-top: 20px;
}
</style>
