<template>
	<div class="page">
		<Title>新增 表井(总表)</Title>
		<!-- <Buliding>Building...</Buliding> -->
		<el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
			<el-tab-pane label="文件导入" name="first">
				<label class="input-file-button" for="upload">请选择卡片文件</label>
				<input type="file" id="upload" ref="upload" accept=".xls,.xlsx" class="upButton" />
				<el-table border stripe :data="ExcelInfo" max-height="500px" style="margin-top: 20px; width: 97%">
					<el-table-column align="center" prop="accountName" label="户名（必填）">
					</el-table-column>
					<el-table-column align="center" prop="accountNumber" label="户号（必填）"></el-table-column>
					<el-table-column align="center" prop="address" label="地址（必填）"></el-table-column>
					<el-table-column align="center" prop="wellDepth" label="井深（必填）">
					</el-table-column>
				</el-table>
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
import { read, utils } from "xlsx";

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
	includedFacilities = "内含设施",
	waterMeterManufacturer = "水表厂家",
	accountIdentifier = "编号",
}

@Component({
	components: { Title, Buliding },
})
export default class AddWaterMeterWell extends Vue {
	public activeName = "first";
	public ExcelInfo: any[] = [];

	public jnpz: string[] = [];
	public jwpz: string[] = [];
	public txr: string[] = [];
	public hm: string[] = [];
	public hh: string[] = [];
	public dz: string[] = [];
	public zb: string[] = [];
	public kj: string[] = [];
	public yxzt: string[] = [];
	public ysxz: string[] = [];
	public js: string[] = [];
	public nhss: string[] = [];
	public sbcj: string[] = [];
	public bh: string[] = [];

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
		(this.$refs!.upload! as HTMLElement).addEventListener("change", (e: { target: any }) => {
			//绑定监听表格导入事件
			this.readExcel(e);
		});
	}

	public readExcel(e: { target: { files: any } }): void | boolean {
		this.ExcelInfo = [];
		const files = e.target.files;
		// 如果没有文件名
		if (files.length <= 0) {
			return false;
		} else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
			this.$message.error("上传格式不正确,请上传xls或者xlsx格式");
			return false;
		}

		const fileReader = new FileReader();
		fileReader.onload = (ev: ProgressEvent<EventTarget>) => {
			try {
				// 防止ts报错
				const data = (ev.target as FileReader).result;
				// 切换为新的调用方式
				const workbook = read(data, {
					type: "binary",
				});
				// 取第一张表
				const wsname = workbook.SheetNames[0];
				// 切换为新的调用方式 生成json表格内容
				const ws = utils.sheet_to_json(workbook.Sheets[wsname]);

				console.log(wsname);

				ws.forEach((item: any) => {
					// console.log(item);
					this.js.push(item["井深（必填）"] ? item["井深（必填）"] : "");
					this.nhss.push(item["内含设施（必填）"] ? item["内含设施（必填）"] : []);
					this.sbcj.push(item["水表厂家（必填）"] ? item["水表厂家（必填）"] : "");
					this.bh.push(item["编号"] ? item["编号"] : "");
					this.kj.push(item["口径"] ? item["口径"] : "");
					this.yxzt.push(item["运行状态（必填）"] ? item["运行状态（必填）"] : "");
					this.ysxz.push(item["用水性质（必填）"] ? item["用水性质（必填）"] : "");
					this.zb.push(item["坐标"] ? item["坐标"] : "");
					this.dz.push(item["街道地址"] ? item["街道地址"] : "");
					this.hh.push(item["户号"] ? item["户号"] : "");
					this.hm.push(item["户名"] ? item["户名"] : "");
					this.txr.push(item["填写人"] ? item["填写人"] : "");
					this.jnpz.push(item["井内拍照（必填）"] ? item["井内拍照（必填）"] : "");
					this.jwpz.push(item["井外拍照（必填）"] ? item["井外拍照（必填）"] : "");
				});
				for (let i = 0; i < ws.length; i++) {
					this.ExcelInfo.push({
						filledBy: this.txr[i],
						accountName: this.hm[i],
						accountNumber: this.hh[i],
						address: this.dz[i],
						coordinates: this.zb[i],
						caliber: this.kj[i],
						operatingStatus: this.yxzt[i],
						waterNature: this.ysxz[i],
						wellDepth: this.js[i],
						includedFacilities: this.nhss[i],
						waterMeterManufacturer: this.sbcj[i],
						accountIdentifier: this.bh[i],
					});
				}
				console.log(this.ExcelInfo);
			} catch (e) {
				this.$message.error("上传格式不正确,请上传xls或者xlsx格式");
				return false;
			}
		};
		fileReader.readAsBinaryString(files[0]);
	}

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
