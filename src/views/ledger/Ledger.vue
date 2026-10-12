<template>
	<section class="ledger-page">
		<div class="ledger-heading">
			<h1>采集台账</h1>
			<el-button icon="Upload" type="primary" @click="importDialog = true"
				>导入工作簿</el-button
			>
		</div>
		<div class="ledger-totals">
			<div>
				<span>原始采集记录</span><strong>{{ summary.total.toLocaleString() }}</strong>
			</div>
			<div>
				<span>来源文件</span><strong>{{ summary.sources.length }}</strong>
			</div>
			<div>
				<span>未关联记录</span><strong>{{ unlinked.toLocaleString() }}</strong>
			</div>
			<div>
				<span>井室分类待核实</span><strong>{{ pending.toLocaleString() }}</strong>
			</div>
		</div>
		<el-tabs v-model="view">
			<el-tab-pane label="台账记录" name="records">
				<form class="ledger-filters" @submit.prevent="search">
					<el-select
						v-model="kind"
						aria-label="台账类型"
						placeholder="全部台账"
						@change="search"
					>
						<el-option label="全部台账" value="" />
						<el-option
							v-for="(label, key) in ledgerNames"
							:key="key"
							:label="label"
							:value="key"
						/>
					</el-select>
					<el-select
						v-model="status"
						aria-label="关联状态"
						placeholder="全部状态"
						@change="search"
					>
						<el-option label="全部状态" value="" />
						<el-option label="未关联" value="unlinked" />
						<el-option label="分类待核实" value="classification_pending" />
						<el-option label="已建立来源台账" value="source_record" />
					</el-select>
					<el-input
						v-model="query"
						placeholder="编号、户号、名称或地址"
						clearable
						aria-label="台账搜索"
					/>
					<el-button native-type="submit" icon="Search" :loading="loading"
						>搜索</el-button
					>
					<el-button
						icon="Refresh"
						circle
						title="刷新"
						aria-label="刷新"
						@click="refresh"
					/>
				</form>
				<p v-if="error" role="alert" class="ledger-error">{{ error }}</p>
				<el-table :data="rows" v-loading="loading" stripe row-key="id" max-height="560">
					<el-table-column label="台账" width="125"
						><template #default="scope">{{
							ledgerNames[scope.row.kind as LedgerKind]
						}}</template></el-table-column
					>
					<el-table-column
						prop="identifier"
						label="原编号"
						width="125"
						show-overflow-tooltip
					/>
					<el-table-column
						prop="name"
						label="名称 / 街道"
						min-width="180"
						show-overflow-tooltip
					/>
					<el-table-column
						prop="accountNumber"
						label="户号"
						width="140"
						show-overflow-tooltip
					/>
					<el-table-column
						prop="address"
						label="原始地址 / 位置"
						min-width="230"
						show-overflow-tooltip
					/>
					<el-table-column label="状态" width="155" show-overflow-tooltip
						><template #default="scope"
							><span
								:class="{
									'ledger-warning': scope.row.linkStatus !== 'source_record',
								}"
								>{{ statusNames[scope.row.linkStatus] }}</span
							></template
						></el-table-column
					>
					<el-table-column prop="rowNumber" label="来源行" width="85" />
					<el-table-column label="详情" width="75" fixed="right"
						><template #default="scope"
							><el-button
								icon="View"
								circle
								title="查看原始记录"
								aria-label="查看原始记录"
								@click="openDetail(scope.row.id)" /></template
					></el-table-column>
				</el-table>
				<el-pagination
					v-model:current-page="page"
					:page-size="30"
					:total="total"
					layout="total, prev, pager, next"
					@current-change="loadRows"
				/>
			</el-tab-pane>
			<el-tab-pane label="跨表候选" name="relations">
				<el-table :data="relations" stripe>
					<el-table-column label="来源台账" min-width="130"
						><template #default="scope">{{
							ledgerNames[scope.row.from as LedgerKind]
						}}</template></el-table-column
					>
					<el-table-column label="目标台账" min-width="130"
						><template #default="scope">{{
							ledgerNames[scope.row.to as LedgerKind]
						}}</template></el-table-column
					>
					<el-table-column prop="rule" label="核对字段" min-width="150" />
					<el-table-column prop="total" label="来源记录" width="100" />
					<el-table-column prop="unmatched" label="无候选或缺键" width="130" />
					<el-table-column
						prop="uniqueCandidates"
						label="单一候选（未确认）"
						width="180"
					/>
					<el-table-column prop="ambiguous" label="多个候选" width="100" />
					<el-table-column prop="confirmed" label="已确认关联" width="110" />
				</el-table>
			</el-tab-pane>
			<el-tab-pane label="来源文件" name="sources">
				<el-table :data="summary.sources" stripe>
					<el-table-column prop="fileName" label="文件" min-width="250" />
					<el-table-column prop="importedRows" label="已保存" width="110" />
					<el-table-column prop="expectedRows" label="文件记录数" width="120" />
					<el-table-column label="导入状态" width="120"
						><template #default="scope">{{
							scope.row.importedRows === scope.row.expectedRows ? "完整" : "尚未完成"
						}}</template></el-table-column
					>
					<el-table-column
						prop="sha256"
						label="SHA-256"
						min-width="400"
						show-overflow-tooltip
					/>
				</el-table>
			</el-tab-pane>
		</el-tabs>
		<el-dialog
			v-model="importDialog"
			title="导入采集台账"
			width="min(1000px, 95vw)"
			:close-on-click-modal="!importing"
			:show-close="!importing"
			:close-on-press-escape="!importing"
		>
			<input
				type="file"
				accept=".xlsx,.xls"
				aria-label="选择采集台账工作簿"
				:disabled="importing || parsing"
				@change="selectFile"
			/>
			<p v-if="parsing">正在读取工作簿…</p>
			<p v-if="importError" class="ledger-error" role="alert">{{ importError }}</p>
			<template v-if="selected">
				<p>
					{{ selected.fileName }} · {{ ledgerNames[selected.kind] }} ·
					{{ selected.expectedRows.toLocaleString() }} 条
				</p>
				<el-table :data="selected.rows.slice(0, 8)" max-height="300" stripe>
					<el-table-column prop="rowNumber" label="来源行" width="85" />
					<el-table-column
						v-for="column in previewColumns"
						:key="column"
						:label="column"
						min-width="160"
						show-overflow-tooltip
						><template #default="scope">{{
							scope.row.values[column]
						}}</template></el-table-column
					>
				</el-table>
				<el-progress
					v-if="processed > 0"
					:percentage="Math.round((processed / selected.expectedRows) * 100)"
				/>
				<p v-if="importResult" role="status">{{ importResult }}</p>
			</template>
			<template #footer
				><el-button
					type="primary"
					icon="Upload"
					:disabled="!selected || parsing"
					:loading="importing"
					@click="saveImport"
					>导入</el-button
				></template
			>
		</el-dialog>
		<el-drawer
			v-model="detailOpen"
			title="采集记录"
			size="min(850px, 96vw)"
			:destroy-on-close="true"
		>
			<div v-if="detailLoading" v-loading="true" style="height: 180px" />
			<p v-else-if="detailError" class="ledger-error" role="alert">{{ detailError }}</p>
			<template v-else-if="detail">
				<dl class="ledger-provenance">
					<dt>来源</dt>
					<dd>{{ detail.fileName }}</dd>
					<dt>位置</dt>
					<dd>{{ detail.sheetName }} · 第 {{ detail.rowNumber }} 行</dd>
					<dt>状态</dt>
					<dd>{{ statusNames[detail.linkStatus] }}</dd>
					<dt>台账主键</dt>
					<dd>
						{{
							detail.targetTable
								? `${detail.targetTable} / ${detail.targetId}`
								: "尚未绑定设施"
						}}
					</dd>
				</dl>
				<h2>现场照片</h2>
				<div v-if="photos.length" class="ledger-photos">
					<div
						v-for="(photo, index) in photos"
						:key="photo.url + index"
						class="ledger-photo"
					>
						<el-icon v-if="photo.sharedPage" :size="28"><Picture /></el-icon>
						<el-image
							v-else
							:src="photo.url"
							:preview-src-list="[photo.url]"
							fit="contain"
							lazy
							referrerpolicy="no-referrer"
							><template #error><span>图片无法加载</span></template></el-image
						>
						<strong>{{ photo.label }}</strong>
						<span v-if="photo.sharedPage">外部分享页，尚无图片直链</span>
						<a
							:href="photo.url"
							target="_blank"
							rel="noopener noreferrer"
							referrerpolicy="no-referrer"
							>打开原始链接 <el-icon><TopRight /></el-icon
						></a>
					</div>
				</div>
				<p v-else>原始记录没有有效图片链接</p>
				<h2>关联候选（未确认，各台账最多 100 条）</h2>
				<el-table
					v-if="detail.candidates.length"
					:data="detail.candidates"
					stripe
					max-height="280"
				>
					<el-table-column label="台账" min-width="120"
						><template #default="scope">{{
							ledgerNames[scope.row.kind as LedgerKind]
						}}</template></el-table-column
					>
					<el-table-column prop="name" label="名称 / 街道" min-width="130" />
					<el-table-column prop="identifier" label="原编号" width="110" />
					<el-table-column label="核对结果" min-width="180"
						><template #default="scope">{{
							scope.row.reasons.join("；")
						}}</template></el-table-column
					>
					<el-table-column prop="rowNumber" label="来源行" width="85" />
				</el-table>
				<p v-else>没有找到候选</p>
				<h2>原始字段</h2>
				<dl class="ledger-fields">
					<template v-for="(value, label) in detail.raw.values" :key="label"
						><dt>{{ label }}</dt>
						<dd>{{ value === "" ? "（空）" : value }}</dd></template
					>
				</dl>
			</template>
		</el-drawer>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import {
	ledgerNames,
	parseWorkbook,
	photoLinks,
	type LedgerKind,
	type ParsedWorkbook,
	type SourceRow,
} from "@/lib/workbook";

type LedgerRow = {
	id: number;
	kind: LedgerKind;
	fileName: string;
	sheetName: string;
	rowNumber: number;
	linkStatus: string;
	targetTable: string | null;
	targetId: number | null;
	identifier: string;
	name: string;
	accountNumber: string;
	address: string;
};
type Detail = LedgerRow & {
	raw: SourceRow;
	mapped: Record<string, string>;
	candidates: Array<LedgerRow & { reasons: string[] }>;
};
type Source = { fileName: string; sha256: string; importedRows: number; expectedRows: number };
type Relation = {
	from: LedgerKind;
	to: LedgerKind;
	rule: string;
	total: number;
	unmatched: number;
	uniqueCandidates: number;
	ambiguous: number;
	confirmed: number;
};
const route = useRoute();
const summary = ref<{
	total: number;
	sources: Source[];
	kinds: Array<{ kind: LedgerKind; total: number; unlinked: number; pending: number }>;
}>({ total: 0, sources: [], kinds: [] });
const rows = ref<LedgerRow[]>([]),
	relations = ref<Relation[]>([]);
const kind = ref(String(route.query.kind || "")),
	status = ref(""),
	query = ref("");
const page = ref(1),
	total = ref(0),
	view = ref("records"),
	loading = ref(false),
	error = ref("");
const statusNames: Record<string, string> = {
	source_record: "已建立来源台账",
	unlinked: "未关联",
	classification_pending: "分类待核实",
};
const unlinked = computed(() => summary.value.kinds.reduce((sum, item) => sum + item.unlinked, 0));
const pending = computed(() => summary.value.kinds.reduce((sum, item) => sum + item.pending, 0));
const importDialog = ref(route.query.import === "1"),
	selected = ref<ParsedWorkbook | null>(null),
	parsing = ref(false),
	importing = ref(false);
const importError = ref(""),
	importResult = ref(""),
	processed = ref(0);
const previewColumns = computed(() => Object.keys(selected.value?.rows[0]?.values || {}));
const detailOpen = ref(false),
	detailLoading = ref(false),
	detailError = ref(""),
	detail = ref<Detail | null>(null);
const photos = computed(() => photoLinks(detail.value?.raw.values || {}));
function message(error: unknown): string {
	return axios.isAxiosError(error)
		? error.response?.data?.message || error.message
		: error instanceof Error
			? error.message
			: "请求未完成";
}
let listRequest = 0;
async function loadRows() {
	const request = ++listRequest;
	loading.value = true;
	error.value = "";
	try {
		const { data } = await axios.get("/ledger/records", {
			params: {
				kind: kind.value,
				status: status.value,
				q: query.value,
				page: page.value,
				size: 30,
			},
		});
		if (request === listRequest) {
			rows.value = data.rows;
			total.value = data.total;
		}
	} catch (e) {
		if (request === listRequest) error.value = message(e);
	} finally {
		if (request === listRequest) loading.value = false;
	}
}
function search() {
	page.value = 1;
	void loadRows();
}
async function refresh() {
	try {
		summary.value = (await axios.get("/ledger/summary")).data;
		await loadRows();
		relations.value = (await axios.get("/ledger/relations", { timeout: 120000 })).data;
	} catch (e) {
		error.value = message(e);
	}
}
async function selectFile(event: Event) {
	selected.value = null;
	importError.value = "";
	importResult.value = "";
	processed.value = 0;
	const file = (event.target as HTMLInputElement).files?.[0];
	if (!file) return;
	parsing.value = true;
	try {
		selected.value = await parseWorkbook(await file.arrayBuffer(), file.name);
	} catch (e) {
		importError.value = message(e);
	} finally {
		parsing.value = false;
	}
}
async function saveImport() {
	if (!selected.value || importing.value) return;
	importing.value = true;
	importError.value = "";
	importResult.value = "";
	processed.value = 0;
	const workbook = selected.value;
	let inserted = 0,
		skipped = 0;
	try {
		for (let start = 0; start < workbook.rows.length; start += 250) {
			const { data } = await axios.post(
				"/ledger/import",
				{ ...workbook, rows: workbook.rows.slice(start, start + 250) },
				{ timeout: 120000 },
			);
			inserted += data.inserted;
			skipped += data.skipped;
			processed.value = Math.min(start + 250, workbook.rows.length);
		}
		importResult.value = `已保存 ${inserted} 条，相同来源已存在 ${skipped} 条`;
		await refresh();
	} catch (e) {
		importError.value = `${message(e)}。已完成 ${processed.value} 行；重试不会重复写入相同来源行。`;
	} finally {
		importing.value = false;
	}
}
let detailRequest = 0;
async function openDetail(id: number) {
	const request = ++detailRequest;
	detailOpen.value = true;
	detailLoading.value = true;
	detailError.value = "";
	detail.value = null;
	try {
		const { data } = await axios.get(`/ledger/records/${id}`);
		if (request === detailRequest) detail.value = data;
	} catch (e) {
		if (request === detailRequest) detailError.value = message(e);
	} finally {
		if (request === detailRequest) detailLoading.value = false;
	}
}
onMounted(refresh);
</script>

<style scoped>
.ledger-heading {
	display: flex;
	justify-content: space-between;
	gap: 16px;
	align-items: center;
	margin-bottom: 24px;
}
.ledger-totals {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	border-block: 1px solid #dbe4e7;
	margin-bottom: 24px;
}
.ledger-totals > div {
	padding: 20px 12px;
}
.ledger-totals span {
	color: #63757d;
}
.ledger-totals strong {
	display: block;
	font-size: 28px;
	margin-top: 8px;
	font-variant-numeric: tabular-nums;
}
.ledger-totals > div:nth-child(3) strong {
	color: #987024;
}
.ledger-totals > div:nth-child(4) strong {
	color: #9b4854;
}
.ledger-filters {
	display: grid;
	grid-template-columns: 170px 180px minmax(160px, 1fr) auto auto;
	gap: 12px;
	margin: 8px 0 20px;
}
.el-pagination {
	margin-top: 20px;
	max-width: 100%;
	overflow-x: auto;
}
.ledger-error {
	color: #aa3f42;
	overflow-wrap: anywhere;
}
.ledger-warning {
	color: #946422;
}
.ledger-provenance,
.ledger-fields {
	display: grid;
	grid-template-columns: minmax(110px, 1fr) minmax(0, 2fr);
	margin: 0;
}
.ledger-provenance dt,
.ledger-fields dt {
	color: #61757d;
}
.ledger-provenance dt,
.ledger-provenance dd,
.ledger-fields dt,
.ledger-fields dd {
	padding: 10px 8px;
	margin: 0;
	border-bottom: 1px solid #e5ebed;
	overflow-wrap: anywhere;
	white-space: pre-wrap;
}
.ledger-photos {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
}
.ledger-photo {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 12px;
	padding: 16px;
	border: 1px solid #dbe4e7;
	border-radius: 4px;
	overflow-wrap: anywhere;
}
.ledger-photo .el-image {
	height: 180px;
	width: 100%;
}
.ledger-photo > span {
	color: #61757d;
	font-size: 13px;
}
.ledger-photo > a {
	display: inline-flex;
	align-items: center;
	gap: 6px;
}
@media (max-width: 760px) {
	.ledger-heading {
		flex-wrap: wrap;
	}
	.ledger-totals {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.ledger-filters {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}
	.ledger-filters > .el-input {
		grid-column: 1 / -1;
	}
	.ledger-filters .el-button {
		margin: 0;
		justify-self: start;
	}
	.ledger-photos {
		grid-template-columns: minmax(0, 1fr);
	}
}
</style>
