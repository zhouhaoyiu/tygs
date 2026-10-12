<template>
	<el-dialog
		v-model="opened"
		title="地址匹配核对"
		width="min(1100px,96vw)"
		:close-on-click-modal="!busy"
		:close-on-press-escape="!busy"
		:show-close="!busy"
	>
		<p v-if="error" class="geocode-error" role="alert">{{ error }}</p>
		<div v-if="loading" v-loading="true" class="geocode-loading" />
		<template v-else-if="detail">
			<dl class="geocode-source">
				<dt>原始地址</dt>
				<dd>{{ detail.sourceAddress || "未填写" }}</dd>
				<dt>发送地址</dt>
				<dd>{{ detail.queryAddress || "不可发送" }}</dd>
				<dt>限定城市</dt>
				<dd>{{ detail.city }}</dd>
				<dt>接收服务</dt>
				<dd>高德地理编码 · 仅发送地址与城市</dd>
			</dl>
			<p v-if="detail.blocked" class="geocode-error" role="alert">{{ detail.blocked }}</p>
			<p v-if="configurationError" class="geocode-error" role="alert">
				{{ configurationError }}
			</p>
			<div v-if="admin" class="geocode-actions">
				<el-button
					type="primary"
					icon="Position"
					:loading="busy"
					:disabled="!!detail.blocked || !!configurationError || !!unsaved"
					@click="run"
					>{{ latest ? "重新查询此地址" : "查询此地址" }}</el-button
				>
				<el-button v-if="unsaved" icon="Check" :loading="busy" @click="persist"
					>重试保存结果</el-button
				>
			</div>
			<section v-for="entry in detail.history" :key="entry.id" class="geocode-entry">
				<header>
					<el-tag :type="entry.decision === 'address_matched' ? 'success' : 'warning'">{{
						geocodeLabels[entry.decision] || entry.decision
					}}</el-tag
					><el-tag v-if="!entry.current" type="info">地址已变更</el-tag
					><span
						>{{ new Date(entry.createdAt).toLocaleString() }} · {{ entry.actor }}</span
					>
				</header>
				<p>{{ entry.reason }}</p>
				<p v-if="!entry.current">匹配时地址：{{ entry.sourceAddress }}</p>
				<el-table :data="entry.result.candidates" stripe empty-text="没有可用候选">
					<el-table-column prop="formattedAddress" label="返回地址" min-width="280" />
					<el-table-column prop="level" label="返回精度" width="100" />
					<el-table-column prop="district" label="区县" width="110" />
					<el-table-column label="候选坐标（GCJ-02）" min-width="220"
						><template #default="scope"
							>{{ scope.row.longitude }}, {{ scope.row.latitude }}</template
						></el-table-column
					>
				</el-table>
				<p class="geocode-precision">地址参考点不等同于井室、消防栓或水表的实测位置。</p>
			</section>
			<p v-if="!detail.history.length" class="geocode-empty">尚未查询外部定位服务</p>
		</template>
	</el-dialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import axios from "axios";
import { requestError } from "@/lib/workspace";
import {
	requestGeocode,
	geocodeConfigurationError,
	geocodeLabels,
	type GeocodeDetail,
	type GeocodeResult,
} from "@/lib/geocode";
import type { LocatedRecord } from "@/lib/locations";
const props = defineProps<{ record?: LocatedRecord }>();
const opened = defineModel<boolean>({ required: true });
const emit = defineEmits<{ saved: [] }>();
const admin = sessionStorage.getItem("facilityRole") === "0";
const configurationError = geocodeConfigurationError();
const detail = ref<GeocodeDetail>(),
	loading = ref(false),
	busy = ref(false),
	error = ref("");
const unsaved = ref<{
	route: string;
	body: { requestId: string; sourceAddress: string; result: GeocodeResult };
}>();
const latest = computed(() => detail.value?.history.find((entry) => entry.current));
let attempt = 0;
watch(
	() => [opened.value, props.record?.id],
	async () => {
		if (!opened.value || !props.record) return;
		const current = ++attempt;
		detail.value = undefined;
		error.value = "";
		unsaved.value = undefined;
		loading.value = true;
		try {
			const { data } = await axios.get(
				`/locations/${props.record.targetTable}/${props.record.targetId}/geocode`,
			);
			if (current === attempt) detail.value = data;
		} catch (e) {
			if (current === attempt) error.value = requestError(e);
		} finally {
			if (current === attempt) loading.value = false;
		}
	},
);
async function persist() {
	if (!unsaved.value) return;
	busy.value = true;
	error.value = "";
	try {
		detail.value = (await axios.post(unsaved.value.route, unsaved.value.body)).data;
		unsaved.value = undefined;
		emit("saved");
	} catch (e) {
		error.value = `${requestError(e)}；结果尚未保存。重试保存不会再次发送地址。`;
	} finally {
		busy.value = false;
	}
}
async function run() {
	if (
		!props.record ||
		!detail.value ||
		busy.value ||
		detail.value.blocked ||
		configurationError ||
		unsaved.value
	)
		return;
	const source = detail.value,
		record = props.record;
	busy.value = true;
	error.value = "";
	try {
		const result = await requestGeocode(source.queryAddress, source.city);
		unsaved.value = {
			route: `/locations/${record.targetTable}/${record.targetId}/geocode`,
			body: { requestId: crypto.randomUUID(), sourceAddress: source.sourceAddress, result },
		};
		await persist();
	} catch (e) {
		error.value = requestError(e);
	} finally {
		busy.value = false;
	}
}
</script>
<style scoped>
.geocode-source {
	display: grid;
	grid-template-columns: 90px minmax(0, 1fr);
	gap: 12px;
	margin: 0 0 20px;
}
.geocode-source dt {
	color: #6b7b83;
}
.geocode-source dd {
	margin: 0;
	overflow-wrap: anywhere;
	white-space: pre-wrap;
}
.geocode-actions {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}
.geocode-entry {
	border-top: 1px solid #dce5e8;
	margin-top: 24px;
	padding-top: 20px;
}
.geocode-entry header {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}
.geocode-entry p {
	overflow-wrap: anywhere;
}
.geocode-entry header span,
.geocode-precision,
.geocode-empty {
	color: #65767b;
}
.geocode-error {
	color: #a13843;
	overflow-wrap: anywhere;
}
.geocode-loading {
	min-height: 200px;
}
@media (max-width: 600px) {
	.geocode-source {
		grid-template-columns: 1fr;
		gap: 6px;
	}
	.geocode-source dd {
		margin-bottom: 12px;
	}
}
</style>
