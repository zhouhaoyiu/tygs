<template>
	<section class="module-page">
		<header class="module-heading">
			<h1>{{ schema?.title || "业务资料" }}</h1>
			<div v-if="schema" class="module-commands">
				<el-button icon="Download" :loading="exporting" :disabled="!total" @click="download"
					>导出</el-button
				>
				<el-button v-if="admin" icon="Upload" @click="importOpen = true">导入</el-button>
				<el-button type="primary" icon="Plus" @click="create">新增</el-button>
			</div>
		</header>
		<div v-if="schema">
			<form class="module-filters" @submit.prevent="search">
				<el-select v-model="field" aria-label="查询字段" placeholder="全部字段"
					><el-option label="全部字段" value="" /><el-option
						v-for="item in schema.fields"
						:key="item.key"
						:label="item.label"
						:value="item.key"
				/></el-select>
				<el-input
					v-model="q"
					aria-label="查询关键词"
					placeholder="名称、编号或地址"
					clearable
				/>
				<el-select v-model="state" aria-label="记录状态" @change="search"
					><el-option label="有效记录" value="active" /><el-option
						label="已归档"
						value="archived" /><el-option label="全部记录" value="all"
				/></el-select>
				<el-button icon="Search" native-type="submit" :loading="loading">搜索</el-button>
				<el-button
					icon="RefreshLeft"
					circle
					title="重置筛选"
					aria-label="重置筛选"
					@click="resetSearch"
				/>
			</form>
		</div>
		<p v-if="error" role="alert" class="module-error">
			{{ error }} <el-button icon="Refresh" size="small" @click="load">重试</el-button>
		</p>
		<el-table
			v-if="schema"
			:data="rows"
			stripe
			v-loading="loading"
			max-height="590"
			row-key="id"
			:empty-text="emptyText"
		>
			<el-table-column prop="id" label="记录 ID" width="95" />
			<el-table-column
				v-for="item in schema.fields"
				:key="item.key"
				:label="item.label"
				:min-width="item.type === 'textarea' ? 230 : 160"
				show-overflow-tooltip
				><template #default="scope">{{
					scope.row.values[item.key]
				}}</template></el-table-column
			>
			<el-table-column label="状态" width="85"
				><template #default="scope">{{
					scope.row.archived ? "已归档" : "有效"
				}}</template></el-table-column
			>
			<el-table-column label="操作" width="135" fixed="right"
				><template #default="scope">
					<el-button
						icon="View"
						circle
						title="查看记录"
						aria-label="查看记录"
						@click="open(scope.row.id, 'view')"
					/>
					<el-button
						v-if="!scope.row.archived"
						icon="Edit"
						circle
						title="编辑记录"
						aria-label="编辑记录"
						@click="open(scope.row.id, 'edit')"
					/> </template
			></el-table-column>
		</el-table>
		<div v-else-if="loading" v-loading="true" class="module-loading" />
		<el-pagination
			v-if="schema"
			v-model:current-page="page"
			:page-size="30"
			:total="total"
			layout="total, prev, pager, next"
			:pager-count="5"
			@current-change="loadRows"
		/>
		<el-drawer
			v-if="schema"
			v-model="drawer"
			:title="
				mode === 'create'
					? `新增${schema.title}`
					: mode === 'edit'
						? '编辑记录'
						: '记录详情'
			"
			size="min(900px,96vw)"
			:close-on-click-modal="!saving && !archiving"
			:close-on-press-escape="!saving && !archiving"
			:show-close="!saving && !archiving"
			:destroy-on-close="true"
		>
			<div v-if="detailLoading" v-loading="true" class="module-loading" />
			<p v-else-if="detailError" role="alert" class="module-error">{{ detailError }}</p>
			<RecordForm
				v-else-if="mode === 'create' || (mode === 'edit' && detail)"
				:schema="schema"
				:initial="mode === 'edit' ? detail?.values : undefined"
				:busy="saving"
				:error="saveError"
				@save="submit"
			/>
			<template v-else-if="detail">
				<div class="module-detail-tools">
					<span>记录 ID {{ detail.id }} · {{ detail.archived ? "已归档" : "有效" }}</span>
					<el-button
						v-if="!detail.archived"
						icon="Edit"
						@click="
							mode = 'edit';
							resetSubmission();
						"
						>编辑</el-button
					>
					<el-button
						v-if="admin"
						:icon="detail.archived ? 'RefreshLeft' : 'FolderDelete'"
						:loading="archiving"
						@click="archive"
						>{{ detail.archived ? "恢复" : "归档" }}</el-button
					>
				</div>
				<p v-if="actionError" role="alert" class="module-error">{{ actionError }}</p>
				<dl class="module-values">
					<template v-for="item in schema.fields" :key="item.key"
						><dt>{{ item.label }}</dt>
						<dd>{{ detail.values[item.key] || "未填写" }}</dd></template
					>
				</dl>
				<section v-if="detail.sources.length" class="module-section">
					<h2>原始来源</h2>
					<div v-for="source in detail.sources" :key="source.sha256 + source.rowNumber">
						<p>
							{{ source.fileName }} · {{ source.sheetName }} · 第{{
								source.rowNumber
							}}行
						</p>
						<p class="module-hash">SHA-256 {{ source.sha256 }}</p>
						<el-collapse
							><el-collapse-item title="原始字段"
								><dl class="module-values">
									<template
										v-for="(value, label) in source.raw.values"
										:key="label"
										><dt>{{ label }}</dt>
										<dd>{{ value || "空" }}</dd></template
									>
								</dl></el-collapse-item
							></el-collapse
						>
					</div>
				</section>
				<section class="module-section">
					<h2>操作记录</h2>
					<p v-if="!detail.history.length">暂无操作记录</p>
					<el-collapse v-else
						><el-collapse-item
							v-for="(entry, index) in detail.history"
							:key="index"
							:title="`${actionNames[entry.action] || entry.action} · ${entry.actor} · ${formatTime(entry.createdAt)}`"
						>
							<el-table :data="changedFields(entry)" stripe
								><el-table-column
									prop="label"
									label="字段"
									min-width="140" /><el-table-column
									prop="before"
									label="修改前"
									min-width="160" /><el-table-column
									prop="after"
									label="修改后"
									min-width="160"
							/></el-table> </el-collapse-item
					></el-collapse>
				</section>
			</template>
		</el-drawer>
		<ModuleImport
			v-if="schema && admin && importOpen"
			v-model="importOpen"
			:schema="schema"
			@done="search"
		/>
	</section>
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import RecordForm from "./RecordForm.vue";
const ModuleImport = defineAsyncComponent(() => import("./ModuleImport.vue"));
import {
	requestError,
	useRecordSave,
	type ModuleSchema,
	type ModuleRecord,
	type ModuleDetail,
} from "@/lib/workspace";
const props = defineProps<{ moduleKey: string }>();
const route = useRoute(),
	schema = ref<ModuleSchema>(),
	rows = ref<ModuleRecord[]>([]),
	loading = ref(false),
	error = ref(""),
	total = ref(0),
	page = ref(1),
	q = ref(""),
	field = ref(""),
	state = ref("active"),
	exporting = ref(false);
const drawer = ref(false),
	mode = ref<"view" | "edit" | "create">("view"),
	detail = ref<ModuleDetail>(),
	detailLoading = ref(false),
	detailError = ref(""),
	actionError = ref(""),
	archiving = ref(false),
	importOpen = ref(false);
const admin = sessionStorage.getItem("facilityRole") === "0";
const { saving, saveError, resetSubmission, save } = useRecordSave();
let listRequest = 0,
	detailRequest = 0;
const actionNames: Record<string, string> = {
	create: "新增",
	update: "编辑",
	import: "导入",
	archive: "归档",
	restore: "恢复",
};
const emptyText = computed(() =>
	q.value.trim()
		? "没有匹配记录"
		: state.value === "archived"
			? "暂无归档记录"
			: "暂无已录入数据",
);
function params() {
	return { q: q.value, field: field.value, state: state.value };
}
async function loadRows() {
	const current = ++listRequest;
	loading.value = true;
	error.value = "";
	try {
		const { data } = await axios.get(`/workspace/${props.moduleKey}/records`, {
			params: { ...params(), page: page.value, size: 30 },
		});
		if (current === listRequest) {
			rows.value = data.rows;
			total.value = data.total;
		}
	} catch (e) {
		if (current === listRequest) error.value = requestError(e);
	} finally {
		if (current === listRequest) loading.value = false;
	}
}
async function load() {
	loading.value = true;
	error.value = "";
	try {
		schema.value = (await axios.get(`/workspace/${props.moduleKey}/schema`)).data;
		await loadRows();
	} catch (e) {
		error.value = requestError(e);
		loading.value = false;
	}
}
function search() {
	page.value = 1;
	loadRows();
}
function resetSearch() {
	q.value = "";
	field.value = "";
	state.value = "active";
	search();
}
function create() {
	++detailRequest;
	detailLoading.value = false;
	detail.value = undefined;
	detailError.value = "";
	actionError.value = "";
	resetSubmission();
	mode.value = "create";
	drawer.value = true;
}
async function open(id: number, next: "view" | "edit") {
	const current = ++detailRequest;
	detailLoading.value = true;
	detail.value = undefined;
	detailError.value = "";
	actionError.value = "";
	resetSubmission();
	mode.value = next;
	drawer.value = true;
	try {
		const { data } = await axios.get(`/workspace/${props.moduleKey}/records/${id}`);
		if (current === detailRequest) detail.value = data;
	} catch (e) {
		if (current === detailRequest) detailError.value = requestError(e);
	} finally {
		if (current === detailRequest) detailLoading.value = false;
	}
}
async function submit(values: Record<string, string>) {
	if (!schema.value) return;
	const saved = await save(
		schema.value,
		values,
		mode.value === "edit" ? detail.value : undefined,
	);
	if (saved) {
		ElMessage.success("记录已保存");
		await open(saved.id, "view");
		await loadRows();
	}
}
async function archive() {
	if (!detail.value || archiving.value) return;
	const record = detail.value;
	try {
		await ElMessageBox.confirm(
			record.archived
				? "恢复此记录到有效记录？"
				: "归档此记录？原内容保留，可在已归档记录中恢复。",
			record.archived ? "恢复记录" : "归档记录",
			{
				confirmButtonText: record.archived ? "恢复" : "归档",
				cancelButtonText: "取消",
				type: "warning",
			},
		);
	} catch {
		return;
	}
	archiving.value = true;
	actionError.value = "";
	try {
		await axios.post(`/workspace/${props.moduleKey}/records/${record.id}/archive`, {
			revision: record.revision,
			archived: !record.archived,
		});
		await open(record.id, "view");
		await loadRows();
	} catch (e) {
		actionError.value = requestError(e);
	} finally {
		archiving.value = false;
	}
}
function formatTime(value: string) {
	return new Date(value).toLocaleString("zh-CN", { hour12: false });
}
function changedFields(entry: ModuleDetail["history"][number]) {
	const fields =
		schema.value?.fields.filter(
			(f) => (entry.before.values?.[f.key] || "") !== (entry.after.values[f.key] || ""),
		) || [];
	const changes = fields.map((f) => ({
		label: f.label,
		before: entry.before.values?.[f.key] || "空",
		after: entry.after.values[f.key] || "空",
	}));
	if (entry.before.archived !== undefined && entry.before.archived !== entry.after.archived)
		changes.push({
			label: "归档状态",
			before: entry.before.archived ? "已归档" : "有效",
			after: entry.after.archived ? "已归档" : "有效",
		});
	return changes;
}
async function download() {
	if (!schema.value || exporting.value) return;
	exporting.value = true;
	error.value = "";
	const filter = params(),
		result: ModuleRecord[] = [];
	try {
		for (let p = 1; ; p++) {
			const { data } = await axios.get(`/workspace/${props.moduleKey}/records`, {
				params: { ...filter, page: p, size: 500 },
			});
			if (data.total > 100000) throw new Error("导出超过100,000条，请缩小筛选范围");
			result.push(...data.rows);
			if (result.length >= data.total || !data.rows.length) break;
		}
		const { exportModuleRows } = await import("@/lib/module-workbook");
		exportModuleRows(schema.value, result);
	} catch (e) {
		error.value = requestError(e);
	} finally {
		exporting.value = false;
	}
}
watch(
	() => props.moduleKey,
	async () => {
		drawer.value = false;
		schema.value = undefined;
		rows.value = [];
		total.value = 0;
		page.value = 1;
		q.value = "";
		field.value = "";
		state.value = "active";
		await load();
		if (route.query.record && /^\d+$/.test(String(route.query.record)))
			open(Number(route.query.record), "view");
	},
	{ immediate: true },
);
</script>
<style scoped>
.module-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
	margin-bottom: 24px;
}
.module-heading h1 {
	font-size: 24px;
	margin: 0;
}
.module-commands {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}
.module-commands .el-button {
	margin: 0;
}
.module-filters {
	display: grid;
	grid-template-columns: 160px minmax(170px, 1fr) 140px auto auto;
	gap: 12px;
	margin-bottom: 20px;
}
.module-filters .el-button {
	margin: 0;
}
.module-error {
	color: #a13843;
	overflow-wrap: anywhere;
}
.module-loading {
	height: 220px;
}
.el-pagination {
	margin-top: 20px;
	max-width: 100%;
	overflow-x: auto;
}
.module-detail-tools {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
	margin-bottom: 20px;
}
.module-detail-tools span {
	margin-right: auto;
}
.module-detail-tools .el-button {
	margin: 0;
}
.module-values {
	display: grid;
	grid-template-columns: minmax(110px, 1fr) minmax(0, 2fr);
	margin: 0;
}
.module-values dt,
.module-values dd {
	margin: 0;
	padding: 11px 8px;
	border-bottom: 1px solid #e0e7e9;
	overflow-wrap: anywhere;
	white-space: pre-wrap;
}
.module-values dt {
	color: #65767b;
}
.module-section {
	margin-top: 28px;
}
.module-section h2 {
	font-size: 18px;
}
.module-hash {
	font-size: 12px;
	color: #65767b;
	overflow-wrap: anywhere;
}
.module-section :deep(.el-collapse-item__header) {
	height: auto;
	min-height: 48px;
	line-height: 22px;
	padding: 10px 0;
}
@media (max-width: 700px) {
	.module-filters {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}
	.module-filters > .el-input {
		grid-row: 2;
		grid-column: 1/-1;
	}
	.module-filters .el-button {
		justify-self: start;
	}
	.module-commands {
		width: 100%;
	}
	.module-heading h1 {
		font-size: 22px;
	}
}
</style>
