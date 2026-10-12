<template>
	<div class="facility-workspace">
		<header class="facility-header">
			<img src="../assets/tygs.png" alt="太原供水" /><strong>供水设施台账</strong
			><span>{{ userName }}</span
			><el-button
				icon="SwitchButton"
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
					><el-icon><component :is="item[2]" /></el-icon>{{ item[1] }}</router-link
				>
			</nav>
			<main class="facility-main"><router-view /></main>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "Home",
	data() {
		return {
			userName: sessionStorage.getItem("facilityName") || "",
			navigation: [
				["index", "工作台", "HomeFilled"],
				...(import.meta.env.VITE_LOCAL_LEDGER === "1"
					? [["ledger", "采集台账", "Collection"]]
					: []),
				["searchWaterMeterWell", "表井", "Menu"],
				["searchWaterMeterRoom", "水表间", "OfficeBuilding"],
				["searchFireHydrant", "消防栓", "FirstAidKit"],
				["searchValueWell", "阀门井", "SetUp"],
				...(import.meta.env.VITE_LOCAL_LEDGER === "1"
					? [["searchWell", "户表信息", "Tickets"]]
					: []),
				["card", "表卡查询", "Document"],
				["InputInfor", "表卡录入", "Edit"],
				["threeSupply", "三供一业", "School"],
				["hubiaohuguan", "户表户管", "House"],
				["hubiaozongguan", "户表总管", "House"],
				["weihuzongguan", "维护总管", "House"],
				["map", "设施地图", "MapLocation"],
			],
		};
	},
	computed: {},
	methods: {
		async logout(): Promise<void> {
			try {
				await this.axios.post("/admin/logout");
			} finally {
				sessionStorage.removeItem("facilityToken");
				sessionStorage.removeItem("facilityName");
				sessionStorage.removeItem("facilityRole");
				this.$store.commit("setAdminInfo", {});
				this.$router.replace("/login");
			}
		},
	},
});
</script>
