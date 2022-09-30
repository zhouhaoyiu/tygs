<template>
	<div class="page">
		<Title>新增 表井(总表)</Title>
		<!-- <Buliding>Building...</Buliding> -->
		<el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
			<el-tab-pane label="文件导入" name="first">
				<input type="file" ref="upload" accept=".xls,.xlsx" class="upButton" />
			</el-tab-pane>
			<el-tab-pane label="手动输入" name="second">
				<el-form size="small" ref="form" :model="form" label-width="80px">
					<el-form-item label="填写人">
						<el-input v-model="form.filledBy"></el-input>
					</el-form-item>
					<el-form-item label="户名">
						<el-input v-model="form.accountName"></el-input>
					</el-form-item>
					<el-form-item label="户号">
						<el-input v-model="form.accountNumber"></el-input>
					</el-form-item>
				</el-form>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script lang="ts">
import Buliding from "@/components/Buiding.vue";
import Title from "@/components/title.vue";
import Vue from "vue";
import Component from "vue-class-component";

@Component({
	components: { Title, Buliding },
})
export default class AddWaterMeterWell extends Vue {
	public activeName = "first";

	public form: Record<any, any> = {
		filledBy: "",
	};
	public handleClick(tab: any, event: any) {
		console.log(tab, event);
	}
	public mounted(): void {
		console.log("addWaterMeterWell");
	}
}
</script>

<style lang="scss" scoped>
.page {
	.upButton {
		background: transparent;
	}
}
</style>
