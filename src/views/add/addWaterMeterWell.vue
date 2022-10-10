<template>
	<div class="page">
		<Title>新增 表井(总表)</Title>
		<!-- <Buliding>Building...</Buliding> -->
		<el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
			<el-tab-pane label="文件导入" name="first">
				<label class="input-file-button" for="upload">请选择XLS文件</label>
				<input type="file" ref="upload" id="upload" accept=".xls,.xlsx" class="upButton" />
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
					<el-form-item label="地址">
						<el-input v-model="form.address"></el-input>
					</el-form-item>
					<el-form-item label="坐标">
						<el-input v-model="form.coordinates"></el-input>
					</el-form-item>
					<el-form-item label="口径">
						<el-input v-model="form.caliber"></el-input>
					</el-form-item>
					<el-form-item label="运行状态">
						<el-input v-model="form.operatingStatus"></el-input>
					</el-form-item>
					<el-form-item label="用水性质">
						<el-input v-model="form.waterNature"></el-input>
					</el-form-item>
					<el-form-item label="井深">
						<el-input v-model="form.wellDepth"></el-input>
					</el-form-item>
					<el-form-item label="包含设施">
						<el-input v-model="form.includedFacilities"></el-input>
					</el-form-item>
					<el-form-item label="表具厂家">
						<el-input v-model="form.waterMeterManufacturer"></el-input>
					</el-form-item>
					<el-form-item label="编号">
						<el-input v-model="form.accountIdentifier"></el-input>
					</el-form-item>
					<!-- <el-form-item label="井外照片">
						<el-input v-model="form.waterMeterType"></el-input>
					</el-form-item>
					<el-form-item label="井内照片">
						<el-input v-model="form.waterMeterCaliber"></el-input>
					</el-form-item> -->
				</el-form>
				<el-button @click="reset()" style="margin-left: auto" size="mini">重置</el-button>
				<el-button size="mini" type="primary">提交</el-button>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script lang="ts">
import Buliding from "@/components/Buiding.vue";
import Title from "@/components/title.vue";
import Vue from "vue";
import Component from "vue-class-component";
import { Component as VueComponent } from "vue/types/umd";

type WaterMeterWellForm = {
	filledBy: string; // 填写人
	accountName: string; // 户名
	accountNumber: string; // 户号
	address: string; // 地址
	coordinates: string; // 坐标
	caliber: string | string[]; // 口径
	operatingStatus: string | string[]; // 运行状态
	waterNature: string | string[]; // 用水性质
	wellDepth: string | string[]; // 井深
	includedFacilities: string | string[]; // 包含设施
	waterMeterManufacturer: string | string[]; // 表具厂家
	accountIdentifier: string; // 编号
};

enum WaterMeterWellFormKey {
	filledBy = "填写人",
	accountName = "户名",
	accountNumber = "户号",
	address = "地址",
	coordinates = "坐标",
	caliber = "口径",
	operatingStatus = "运行状态",
	waterNature = "用水性质",
	wellDepth = "井深",
	includedFacilities = "包含设施",
	waterMeterManufacturer = "水表厂家",
	accountIdentifier = "编号",
}

@Component({
	components: { Title, Buliding },
})
export default class AddWaterMeterWell extends Vue {
	public activeName = "first";

	public excelArrs = {
		filledBy: [], // 填写人
		accountName: [],
		accountNunmr: [],
		address: [],
		coordinates: [],
		caliber: [],
		operatingStatus: [],
		waterNature: [],
		wellDepth: [],
		includedFacilities: [],
		waterMeterManufacturer: [],
		accountIdentifier: [],
	};

	public form: WaterMeterWellForm = {
		filledBy: "",
		accountName: "",
		accountNumber: "",
		address: "",
		coordinates: "",
		caliber: "",
		operatingStatus: "",
		waterNature: "",
		wellDepth: "",
		includedFacilities: "",
		waterMeterManufacturer: "",
		accountIdentifier: "",
	};

	public handleClick(tab: VueComponent, event: PointerEvent): void {
		console.log(tab, event);
	}

	public mounted(): void {
		console.log("addWaterMeterWell");
	}

	public readExcel(): void {}

	public async sendAddWaterMeterWell(): Promise<void> {
		let res = await this.axios.post(
			"/WaterMeterWell/addWaterMeterWell",
			//向this.form中添加数据writtingTime
			{ ...this.form, writtingTime: new Date().toLocaleString() },
		);

		console.log(res);
	}

	public reset(): void {
		this.form = {
			filledBy: "",
			accountName: "",
			accountNumber: "",
			address: "",
			coordinates: "",
			caliber: "",
			operatingStatus: "",
			waterNature: "",
			wellDepth: "",
			includedFacilities: "",
			waterMeterManufacturer: "",
			accountIdentifier: "",
		};
	}
}
</script>

<style lang="scss" scoped>
.page {
	.upButton {
		display: none;
	}
	.input-file-button {
		padding: 6px 15px;
		background: #2b5cab;
		border-radius: 24px;
		color: white;
		cursor: pointer;
		font-size: 12px;
		box-shadow: 0 0 2px #2b5cab;
	}
}
</style>
