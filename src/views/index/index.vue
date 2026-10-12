<template>
	<section>
		<header class="facility-page-heading">
			<div>
				<p>城北营销 · 设施管理</p>
				<h1>工作台</h1>
			</div>
			<el-button
				icon="Refresh"
				circle
				title="刷新统计"
				aria-label="刷新统计"
				:loading="loading"
				@click="load"
			/>
		</header>
		<div v-if="error" class="facility-error">{{ error }}</div>
		<div class="facility-metrics">
			<router-link v-for="item in facilities" :key="item.key" :to="'/home/' + item.path"
				><span>{{ item.name }}</span
				><strong>{{
					loading ? "…" : counts[item.key] === undefined ? "—" : counts[item.key]
				}}</strong
				><small
					>查看台账 <el-icon><ArrowRight /></el-icon></small
			></router-link>
		</div>
		<h2>设施业务</h2>
		<div class="facility-links">
			<router-link v-for="item in facilities" :key="item.key" :to="'/home/' + item.path"
				><el-icon><component :is="item.icon" /></el-icon><span>{{ item.name }}查询</span
				><el-icon><ArrowRight /></el-icon></router-link
			><router-link to="/home/addWaterMeterWell"
				><el-icon><CirclePlus /></el-icon><span>新增表井</span
				><el-icon><ArrowRight /></el-icon></router-link
			><router-link to="/home/InputInfor"
				><el-icon><Edit /></el-icon><span>表卡录入</span><el-icon><ArrowRight /></el-icon
			></router-link>
		</div>
		<h2>小区资料</h2>
		<div class="facility-links">
			<router-link to="/home/threeSupply"
				><el-icon><School /></el-icon><span>三供一业</span
				><el-icon><ArrowRight /></el-icon></router-link
			><router-link to="/home/hubiaohuguan"
				><el-icon><House /></el-icon><span>户表户管</span
				><el-icon><ArrowRight /></el-icon></router-link
			><router-link to="/home/hubiaozongguan"
				><el-icon><House /></el-icon><span>户表总管</span
				><el-icon><ArrowRight /></el-icon></router-link
			><router-link to="/home/weihuzongguan"
				><el-icon><House /></el-icon><span>维护总管</span><el-icon><ArrowRight /></el-icon
			></router-link>
		</div>
	</section>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "Overview",
	data() {
		return {
			loading: false,
			error: "",
			counts: {} as Record<string, number>,
			facilities: [
				{
					key: "waterMeterWellCount",
					name: "表井",
					path: "searchWaterMeterWell",
					icon: "Menu",
				},
				{
					key: "waterMeterRoomCount",
					name: "水表间",
					path: "searchWaterMeterRoom",
					icon: "OfficeBuilding",
				},
				{
					key: "fireHydrant",
					name: "消防栓",
					path: "searchFireHydrant",
					icon: "FirstAidKit",
				},
				{ key: "valueWellCount", name: "阀门井", path: "searchValueWell", icon: "SetUp" },
			],
		};
	},
	computed: {},
	methods: {
		async load(): Promise<void> {
			this.loading = true;
			this.error = "";
			try {
				this.counts = (await this.axios.get("/Tygs/getWaterMeterCount")).data;
			} catch {
				this.error = "统计读取失败，请重试";
			} finally {
				this.loading = false;
			}
		},
	},
	mounted() {
		this.load();
	},
});
</script>
