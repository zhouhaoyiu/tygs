<template>
	<section class="location-page">
		<header class="location-heading">
			<h1>设施地图</h1>
			<el-button
				icon="Refresh"
				circle
				title="刷新"
				aria-label="刷新定位记录"
				@click="refresh"
			/>
		</header>
		<div class="location-counts">
			<div>
				<span>设施记录</span><strong>{{ summary.total.toLocaleString() }}</strong>
			</div>
			<div>
				<span>人工录入点</span><strong>{{ summary.located.toLocaleString() }}</strong>
			</div>
			<div>
				<span>地址参考点</span
				><strong>{{ summary.addressMatched.toLocaleString() }}</strong>
			</div>
			<div>
				<span>待定位 / 核实</span><strong>{{ summary.pending.toLocaleString() }}</strong>
			</div>
		</div>
		<div class="location-map-band">
			<div ref="mapElement" class="location-map" role="region" aria-label="设施地图" />
			<div v-if="mapError" class="location-map-status" role="status">
				<el-icon :size="28"><MapLocation /></el-icon><strong>{{ mapError }}</strong
				><el-button v-if="mapKey" icon="Refresh" :loading="mapLoading" @click="initMap"
					>重试底图</el-button
				>
			</div>
			<div v-else-if="mapLoading" class="location-map-status" role="status">正在加载底图</div>
			<div v-if="mapReady" class="location-map-caption">
				本页：人工 {{ pagePoints.manual }} · 地址参考 {{ pagePoints.address }} · GCJ-02
			</div>
		</div>
		<div class="location-legend">
			<span><i class="manual-point" />人工录入</span
			><span><i class="address-point" />地址参考点，非设施实测</span>
		</div>
		<form class="location-filters" @submit.prevent="search">
			<el-input
				v-model="query"
				aria-label="设施定位搜索"
				placeholder="名称、编号或地址"
				clearable
			/>
			<el-select v-model="state" aria-label="定位状态" @change="search"
				><el-option label="全部设施" value="all" /><el-option
					label="待定位"
					value="pending" /><el-option label="人工录入点" value="located" /><el-option
					label="地址参考点"
					value="matched" /><el-option label="试定位待核实" value="review"
			/></el-select>
			<el-button icon="Search" native-type="submit" :loading="loading">搜索</el-button>
		</form>
		<p v-if="error" class="location-error" role="alert">{{ error }}</p>
		<el-table
			:data="rows"
			stripe
			v-loading="loading"
			max-height="430"
			row-key="id"
			empty-text="没有匹配的设施记录"
		>
			<el-table-column label="设施" width="95"
				><template #default="scope">{{
					facilityNames[scope.row.targetTable]
				}}</template></el-table-column
			>
			<el-table-column prop="identifier" label="原编号" width="150" show-overflow-tooltip />
			<el-table-column
				prop="name"
				label="名称 / 街道"
				min-width="200"
				show-overflow-tooltip
			/>
			<el-table-column
				prop="address"
				label="原始地址 / 位置"
				min-width="260"
				show-overflow-tooltip
			/>
			<el-table-column label="可显示坐标" width="225"
				><template #default="scope">{{
					scope.row.location
						? `${scope.row.location.longitude}, ${scope.row.location.latitude}`
						: recordPosition(scope.row)?.join(", ") || "待核实"
				}}</template></el-table-column
			>
			<el-table-column label="坐标系" width="100"
				><template #default="scope">{{
					scope.row.location?.crs || (recordPosition(scope.row) ? "GCJ02" : "未指定")
				}}</template></el-table-column
			>
			<el-table-column label="定位状态" width="130"
				><template #default="scope">{{
					scope.row.location
						? "人工录入"
						: scope.row.geocode
							? geocodeLabels[scope.row.geocode.decision]
							: "尚未试定位"
				}}</template></el-table-column
			>
			<el-table-column label="操作" width="180" fixed="right"
				><template #default="scope">
					<el-button
						icon="Aim"
						circle
						:disabled="!recordPosition(scope.row) || !mapReady"
						title="查看点位"
						aria-label="查看点位"
						@click="focusPoint(scope.row)"
					/>
					<el-button
						icon="Edit"
						circle
						title="核对坐标"
						aria-label="核对坐标"
						@click="edit(scope.row)"
					/>
					<el-button
						icon="Position"
						circle
						:title="scope.row.geocode ? '查看地址匹配' : '地址试定位'"
						aria-label="地址试定位"
						@click="reviewAddress(scope.row)"
					/> </template
			></el-table-column>
		</el-table>
		<el-pagination
			v-model:current-page="page"
			:page-size="30"
			:total="total"
			:pager-count="5"
			layout="total, prev, pager, next"
			@current-change="loadRows"
		/>
		<el-dialog
			v-model="dialog"
			title="设施坐标"
			width="min(720px,95vw)"
			:close-on-click-modal="!saving"
			:close-on-press-escape="!saving"
			:show-close="!saving"
		>
			<template v-if="selected">
				<p>
					{{ facilityNames[selected.targetTable] }} · {{ selected.name }} ·
					{{ selected.identifier || "原编号缺失" }}
				</p>
				<p class="location-original">原始位置：{{ selected.address || "未填写" }}</p>
				<el-form label-position="top" @submit.prevent="save">
					<div class="location-coordinate-fields">
						<el-form-item label="经度" required
							><el-input-number
								v-model="draft.longitude"
								aria-label="经度"
								:min="-180"
								:max="180"
								:step="0.000001"
								:precision="8"
								:disabled="saving"
						/></el-form-item>
						<el-form-item label="纬度" required
							><el-input-number
								v-model="draft.latitude"
								aria-label="纬度"
								:min="-90"
								:max="90"
								:step="0.000001"
								:precision="8"
								:disabled="saving"
						/></el-form-item>
					</div>
					<el-form-item label="坐标系" required
						><el-select
							v-model="draft.crs"
							aria-label="坐标系"
							:disabled="saving"
							placeholder="请选择坐标系"
							><el-option label="WGS84（GPS）" value="WGS84" /><el-option
								label="GCJ-02（高德）"
								value="GCJ02" /></el-select
					></el-form-item>
					<el-form-item label="定位依据" required
						><el-input
							v-model="draft.evidence"
							aria-label="定位依据"
							type="textarea"
							:rows="3"
							maxlength="2000"
							:disabled="saving"
					/></el-form-item>
					<p v-if="saveError" class="location-error" role="alert">{{ saveError }}</p>
					<el-button type="primary" icon="Check" native-type="submit" :loading="saving"
						>保存坐标</el-button
					>
				</el-form>
				<section class="location-history">
					<h2>坐标修改记录</h2>
					<p v-if="historyError" class="location-error">{{ historyError }}</p>
					<p v-else-if="!history.length">暂无坐标修改</p>
					<el-table v-else :data="history" stripe max-height="240"
						><el-table-column prop="actor" label="录入人" width="110" /><el-table-column
							label="坐标"
							min-width="230"
							><template #default="scope"
								>{{ scope.row.after.longitude }}, {{ scope.row.after.latitude }} ·
								{{ scope.row.after.crs }}</template
							></el-table-column
						><el-table-column
							prop="after.evidence"
							label="定位依据"
							min-width="200" /><el-table-column
							prop="createdAt"
							label="时间"
							min-width="190"
					/></el-table>
				</section>
			</template>
		</el-dialog>
		<GeocodeReview v-model="geocodeOpen" :record="geocodeRecord" @saved="refresh" />
	</section>
</template>
<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, reactive, ref } from "vue";
import axios from "axios";
import AMapLoader from "@amap/amap-jsapi-loader";
import { ElMessage } from "element-plus";
import {
	recordPosition,
	validLocation,
	type LocatedRecord,
	type FacilityLocation,
} from "@/lib/locations";
import { requestError } from "@/lib/workspace";
import { geocodeLabels } from "@/lib/geocode";
import GeocodeReview from "@/components/GeocodeReview.vue";
const facilityNames: Record<string, string> = {
	watermeterwell: "表井",
	watermeterroom: "水表间",
	valuewell: "阀门井",
	firehydrant: "消防栓",
};
const summary = ref({ total: 0, located: 0, addressMatched: 0, review: 0, pending: 0 }),
	rows = ref<LocatedRecord[]>([]),
	total = ref(0),
	page = ref(1),
	query = ref(""),
	state = ref("all"),
	loading = ref(false),
	error = ref("");
const mapElement = ref<HTMLElement>(),
	mapReady = ref(false),
	mapLoading = ref(false),
	mapError = ref("");
const mapKey = import.meta.env.VITE_AMAP_KEY || "";
let map: any,
	AMap: any,
	markers: any[] = [];
let disposed = false,
	mapAttempt = 0,
	listAttempt = 0,
	historyAttempt = 0;
const pagePoints = computed(() => ({
	manual: rows.value.filter((row) => row.location).length,
	address: rows.value.filter((row) => !row.location && recordPosition(row)).length,
}));
const geocodeOpen = ref(false),
	geocodeRecord = ref<LocatedRecord>();
function reviewAddress(row: LocatedRecord) {
	geocodeRecord.value = row;
	geocodeOpen.value = true;
}
const dialog = ref(false),
	selected = ref<LocatedRecord>(),
	saving = ref(false),
	saveError = ref(""),
	historyError = ref("");
const history = ref<Array<{ actor: string; createdAt: string; after: FacilityLocation }>>([]);
const draft = reactive({
	longitude: undefined as number | undefined,
	latitude: undefined as number | undefined,
	crs: "",
	evidence: "",
	revision: 0,
});
function plotPage() {
	if (!map || !AMap || !mapReady.value) return;
	map.remove(markers);
	markers = rows.value
		.filter((row) => recordPosition(row))
		.map((row) => {
			const marker = row.location
				? new AMap.Marker({
						position: recordPosition(row),
						title: `${row.name} ${row.identifier || ""}`,
					})
				: new AMap.CircleMarker({
						center: recordPosition(row),
						radius: 8,
						fillColor: "#bd7625",
						fillOpacity: 0.9,
						strokeColor: "#ffffff",
						strokeWeight: 2,
					});
			marker.on("click", () => (row.location ? edit(row) : reviewAddress(row)));
			return marker;
		});
	if (markers.length) {
		map.add(markers);
		map.setFitView(markers, false, [45, 45, 45, 45], 17);
	}
}
function focusPoint(row: LocatedRecord) {
	const position = recordPosition(row);
	if (map && position) map.setZoomAndCenter(18, position);
}
async function initMap() {
	const attempt = ++mapAttempt;
	mapReady.value = false;
	mapError.value = "";
	if (!mapKey) {
		mapError.value = "地图服务未配置";
		return;
	}
	mapLoading.value = true;
	const code = import.meta.env.VITE_AMAP_SECURITY_CODE;
	if (code)
		(window as unknown as { _AMapSecurityConfig: object })._AMapSecurityConfig = {
			securityJsCode: code,
		};
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const api = await Promise.race([
			AMapLoader.load({
				key: mapKey,
				version: "2.0",
				plugins: ["AMap.Scale", "AMap.ToolBar"],
			}),
			new Promise((_, reject) => {
				timer = setTimeout(() => reject(new Error("底图加载超时")), 15000);
			}),
		]);
		if (timer) clearTimeout(timer);
		if (disposed || attempt !== mapAttempt) return;
		AMap = api;
		map?.destroy();
		map = new AMap.Map(mapElement.value, {
			zoom: 11,
			center: [112.55, 37.87],
			resizeEnable: true,
		});
		map.addControl(new AMap.Scale());
		map.addControl(new AMap.ToolBar());
		await new Promise<void>((resolve, reject) => {
			timer = setTimeout(
				() => reject(new Error("底图瓦片加载超时，请核对网络或地图授权")),
				15000,
			);
			map.on("complete", resolve);
		});
		if (disposed || attempt !== mapAttempt) return;
		mapReady.value = true;
		plotPage();
	} catch (e) {
		if (!disposed && attempt === mapAttempt)
			mapError.value = `底图不可用：${String(e instanceof Error ? e.message : e).slice(0, 150)}`;
	} finally {
		if (timer) clearTimeout(timer);
		if (attempt === mapAttempt) mapLoading.value = false;
	}
}
async function loadRows() {
	const attempt = ++listAttempt;
	loading.value = true;
	error.value = "";
	try {
		const { data } = await axios.get("/locations/records", {
			params: { q: query.value, state: state.value, page: page.value, size: 30 },
		});
		if (attempt === listAttempt) {
			rows.value = data.rows;
			total.value = data.total;
			plotPage();
		}
	} catch (e) {
		if (attempt === listAttempt) error.value = requestError(e);
	} finally {
		if (attempt === listAttempt) loading.value = false;
	}
}
async function refresh() {
	try {
		await Promise.all([
			axios.get("/locations/summary").then(({ data }) => {
				summary.value = { ...summary.value, ...data };
			}),
			loadRows(),
		]);
	} catch (e) {
		error.value = requestError(e);
	}
}
function search() {
	page.value = 1;
	loadRows();
}
async function edit(row: LocatedRecord) {
	const attempt = ++historyAttempt;
	selected.value = row;
	draft.longitude = row.location?.longitude;
	draft.latitude = row.location?.latitude;
	draft.crs = row.location?.crs || "";
	draft.evidence = row.location?.evidence || "";
	draft.revision = row.location?.revision || 0;
	saveError.value = "";
	history.value = [];
	historyError.value = "";
	dialog.value = true;
	try {
		const { data } = await axios.get(`/locations/${row.targetTable}/${row.targetId}/history`);
		if (attempt === historyAttempt) history.value = data;
	} catch (e) {
		if (attempt === historyAttempt) historyError.value = requestError(e);
	}
}
async function save() {
	if (!selected.value || saving.value) return;
	if (!validLocation(draft.longitude, draft.latitude) || !draft.crs || !draft.evidence.trim()) {
		saveError.value = "请核对经纬度、坐标系及定位依据";
		return;
	}
	saving.value = true;
	saveError.value = "";
	try {
		await axios.put(`/locations/${selected.value.targetTable}/${selected.value.targetId}`, {
			...draft,
		});
		dialog.value = false;
		ElMessage.success("坐标已保存");
		await refresh();
	} catch (e) {
		saveError.value = requestError(e);
	} finally {
		saving.value = false;
	}
}
onMounted(() => {
	refresh();
	initMap();
});
onBeforeUnmount(() => {
	disposed = true;
	++mapAttempt;
	++listAttempt;
	++historyAttempt;
	map?.destroy();
});
</script>
<style scoped>
.location-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
}
.location-heading h1 {
	font-size: 24px;
	margin: 0;
}
.location-counts {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 16px;
	border-top: 1px solid #dce5e8;
	border-bottom: 1px solid #dce5e8;
	padding: 20px 0;
	margin-bottom: 20px;
}
.location-counts span {
	color: #65767b;
}
.location-counts strong {
	display: block;
	font-size: 26px;
	margin-top: 8px;
}
.location-counts > div:nth-child(2) strong {
	color: #127c6a;
}
.location-counts > div:nth-child(3) strong {
	color: #996e24;
}
.location-map-band {
	position: relative;
	width: 100%;
	height: 420px;
	min-height: 300px;
	background: #eef2f3;
}
.location-map {
	height: 100%;
	width: 100%;
}
.location-map-status {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 16px;
	padding: 24px;
	text-align: center;
	color: #65767b;
	overflow-wrap: anywhere;
}
.location-map-status strong {
	font-weight: 500;
}
.location-map-caption {
	position: absolute;
	top: 12px;
	right: 12px;
	background: white;
	padding: 8px 12px;
	font-size: 13px;
	max-width: calc(100% - 24px);
	pointer-events: none;
}
.location-legend {
	display: flex;
	gap: 20px;
	flex-wrap: wrap;
	padding-top: 12px;
	color: #65767b;
	font-size: 13px;
}
.location-legend span {
	display: inline-flex;
	align-items: center;
	gap: 8px;
}
.location-legend i {
	display: inline-block;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	flex-shrink: 0;
}
.manual-point {
	background: #438ee9;
}
.address-point {
	background: #bd7625;
}
.location-filters {
	display: grid;
	grid-template-columns: minmax(180px, 1fr) 170px auto;
	gap: 12px;
	margin: 24px 0 18px;
}
.location-error {
	color: #a13843;
	overflow-wrap: anywhere;
}
.location-original {
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	color: #65767b;
}
.location-coordinate-fields {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
}
.location-coordinate-fields :deep(.el-input-number) {
	width: 100%;
}
.location-history {
	margin-top: 28px;
}
.location-history h2 {
	font-size: 18px;
}
.el-pagination {
	margin-top: 18px;
	max-width: 100%;
	overflow-x: auto;
}
@media (max-width: 650px) {
	.location-map-band {
		height: 320px;
	}
	.location-counts {
		gap: 8px;
	}
	.location-counts span {
		font-size: 12px;
	}
	.location-counts strong {
		font-size: 23px;
	}
	.location-filters {
		grid-template-columns: minmax(0, 1fr) auto;
	}
	.location-filters > .el-input {
		grid-column: 1/-1;
	}
	.location-coordinate-fields {
		grid-template-columns: minmax(0, 1fr);
	}
}
</style>
