<template>
	<div class="facility-workspace">
		<header class="facility-header">
			<img src="../assets/tygs.png" alt="太原供水" /><strong>供水设施台账</strong
			><span>{{ userName }}</span
			><el-button
				icon="el-icon-switch-button"
				circle
				aria-label="退出登录"
				title="退出登录"
				@click="logout"
			/>
		</header>
		<div class="facility-body">
			<nav class="facility-nav">
				<p>设施管理</p>
				<router-link v-for="item in navigation" :key="item[0]" :to="'/home/' + item[0]"
					><i :class="item[2]" />{{ item[1] }}</router-link
				>
			</nav>
			<main class="facility-main"><router-view /></main>
		</div>
	</div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component
export default class Home extends Vue {
	public userName = sessionStorage.getItem("facilityName") || "";
	public navigation = [
		["index", "工作台", "el-icon-s-home"],
		["searchWaterMeterWell", "表井", "el-icon-menu"],
		["searchWaterMeterRoom", "水表间", "el-icon-office-building"],
		["searchFireHydrant", "消防栓", "el-icon-first-aid-kit"],
		["searchValueWell", "阀门井", "el-icon-set-up"],
		["card", "表卡查询", "el-icon-document"],
		["InputInfor", "表卡录入", "el-icon-edit-outline"],
		["threeSupply", "三供一业", "el-icon-school"],
		["hubiaohuguan", "户表户管", "el-icon-house"],
		["hubiaozongguan", "户表总管", "el-icon-house"],
		["weihuzongguan", "维护总管", "el-icon-house"],
		["map", "设施地图", "el-icon-map-location"],
	];
	public async logout(): Promise<void> {
		try {
			await this.axios.post("/admin/logout");
		} finally {
			sessionStorage.removeItem("facilityToken");
			sessionStorage.removeItem("facilityName");
			sessionStorage.removeItem("facilityRole");
			this.$store.commit("setAdminInfo", {});
			this.$router.replace("/login");
		}
	}
}
</script>
