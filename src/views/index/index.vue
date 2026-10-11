<template>
	<section>
		<header class="facility-page-heading">
			<div>
				<p>城北营销 · 设施管理</p>
				<h1>工作台</h1>
			</div>
			<el-button
				icon="el-icon-refresh"
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
				><small>查看台账 <i class="el-icon-arrow-right" /></small
			></router-link>
		</div>
		<h2>设施业务</h2>
		<div class="facility-links">
			<router-link v-for="item in facilities" :key="item.key" :to="'/home/' + item.path"
				><i :class="item.icon" /><span>{{ item.name }}查询</span
				><i class="el-icon-arrow-right" /></router-link
			><router-link to="/home/addWaterMeterWell"
				><i class="el-icon-circle-plus-outline" /><span>新增表井</span
				><i class="el-icon-arrow-right" /></router-link
			><router-link to="/home/InputInfor"
				><i class="el-icon-edit-outline" /><span>表卡录入</span
				><i class="el-icon-arrow-right"
			/></router-link>
		</div>
		<h2>小区资料</h2>
		<div class="facility-links">
			<router-link to="/home/threeSupply"
				><i class="el-icon-school" /><span>三供一业</span
				><i class="el-icon-arrow-right" /></router-link
			><router-link to="/home/hubiaohuguan"
				><i class="el-icon-house" /><span>户表户管</span
				><i class="el-icon-arrow-right" /></router-link
			><router-link to="/home/hubiaozongguan"
				><i class="el-icon-house" /><span>户表总管</span
				><i class="el-icon-arrow-right" /></router-link
			><router-link to="/home/weihuzongguan"
				><i class="el-icon-house" /><span>维护总管</span><i class="el-icon-arrow-right"
			/></router-link>
		</div>
	</section>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component
export default class Overview extends Vue {
	public loading = false;
	public error = "";
	public counts: Record<string, number> = {};
	public facilities = [
		{
			key: "waterMeterWellCount",
			name: "表井",
			path: "searchWaterMeterWell",
			icon: "el-icon-menu",
		},
		{
			key: "waterMeterRoomCount",
			name: "水表间",
			path: "searchWaterMeterRoom",
			icon: "el-icon-office-building",
		},
		{
			key: "fireHydrant",
			name: "消防栓",
			path: "searchFireHydrant",
			icon: "el-icon-first-aid-kit",
		},
		{ key: "valueWellCount", name: "阀门井", path: "searchValueWell", icon: "el-icon-set-up" },
	];
	public async load(): Promise<void> {
		this.loading = true;
		this.error = "";
		try {
			this.counts = (await this.axios.get("/Tygs/getWaterMeterCount")).data;
		} catch {
			this.error = "统计读取失败，请重试";
		} finally {
			this.loading = false;
		}
	}
	mounted() {
		this.load();
	}
}
</script>
