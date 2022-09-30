<template>
	<div class="page">
		<Title>数据录入</Title>
		<el-radio-group v-model="inputType">
			<el-radio-button label="表卡输入"></el-radio-button>
			<el-radio-button label="信息录入"></el-radio-button>
			<!-- <el-radio-button label="广州"></el-radio-button> -->
			<!-- <el-radio-button label="深圳"></el-radio-button> -->
		</el-radio-group>
		<div class="inputCard" v-show="inputType === '表卡输入'">
			<input type="file" ref="upload" accept=".xls,.xlsx" class="outputlist_upload" />
			<div>
				<el-table border stripe :data="ExcelInfo" max-height="500px" style="margin-top: 20px; width: 97%">
					<el-table-column align="center" prop="ssmc" label="设施名称"> </el-table-column>
					<el-table-column align="center" prop="ggxh" label="规格型号"> </el-table-column>
					<el-table-column align="center" prop="syzt" label="使用状态"> </el-table-column>
					<el-table-column align="center" prop="ssgx" label="所属管线"> </el-table-column>
					<el-table-column align="center" prop="jsbh" label="井室编号"> </el-table-column>
					<el-table-column align="center" prop="jslx" label="井室类型"> </el-table-column>
					<el-table-column align="center" prop="jszb" label="井室坐标"> </el-table-column>
					<el-table-column align="center" prop="yxzt" label="运行状态"> </el-table-column>
					<el-table-column align="center" prop="jsqk" label="井室情况"> </el-table-column>
					<el-table-column align="center" prop="kgfx" label="开关方向"> </el-table-column>
					<el-table-column align="center" prop="xdwz" label="相对位置"> </el-table-column>
					<el-table-column align="center" prop="js" label="井  深"> </el-table-column>
					<el-table-column align="center" prop="sccj" label="生产厂家"> </el-table-column
					><el-table-column align="center" prop="azsj" label="安装时间">
					</el-table-column>
				</el-table>
				<!-- {{ ExcelInfo }} -->
				<!-- {{ ggxh }} -->
			</div>
			<div class="submit">
				<el-button type="primary">提交</el-button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { read, utils } from "xlsx";
import Title from "../../components/title.vue";
@Component({
	components: {
		Title,
	},
})
export default class InputInfor extends Vue {
	public outputs = [];

	public ssmc: string[] = [];
	public ggxh: string[] = [];
	public syzt: string[] = [];
	public ssgx: string[] = [];
	public jsbh: string[] = [];
	public jslx: string[] = [];
	public jszb: string[] = [];
	public yxzt: string[] = [];
	public jsqk: string[] = [];
	public kgfx: string[] = [];
	public xdwz: string[] = [];
	public js: string[] = [];
	public sccj: string[] = [];
	public azsj: string[] = [];

	public ExcelInfo: any[] = [];
	public inputType: string = "表卡输入";

	public mounted(): void {
		(this.$refs!.upload! as HTMLElement).addEventListener("change", (e: { target: any }) => {
			//绑定监听表格导入事件
			this.readExcel(e);
		});
	}

	public readExcel(e: { target: { files: any } }) {
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
		fileReader.onload = (ev) => {
			try {
				const data = ev!.target!.result;
				// 切换为新的调用方式
				const workbook = read(data, {
					type: "binary",
				});
				// 取第一张表
				const wsname = workbook.SheetNames[0];
				// 切换为新的调用方式 生成json表格内容
				const ws = utils.sheet_to_json(workbook.Sheets[wsname]);

				ws.forEach((item: any) => {
					console.log(item);
					if (item["__EMPTY"] === "设施名称") {
						this.ssmc.push(item["__EMPTY_1"]);
					}
					if (item["__EMPTY"] === "井室情况") {
						this.jsqk.push(item["__EMPTY_1"]);
					}
					if (item["__EMPTY"] === "规格型号") {
						this.ggxh.push(item["__EMPTY_1"]);
					}
					if (item["__EMPTY"] === "生产厂家") {
						this.sccj.push(item["__EMPTY_1"]);
					}
					if (item["__EMPTY_2"] === "使用状态") {
						this.syzt.push(item["__EMPTY_3"]);
					}
					if (item["__EMPTY_2"] === "井室类型") {
						this.jslx.push(item["__EMPTY_3"]);
					}
					if (item["__EMPTY_2"] === "开关方向") {
						this.kgfx.push(item["__EMPTY_3"]);
					}
					if (item["__EMPTY_2"] === "安装时间") {
						this.azsj.push(item["__EMPTY_3"]);
					}
					if (item["__EMPTY_4"] === "所属管线") {
						this.ssgx.push(item["__EMPTY_5"]);
					}
					if (item["__EMPTY_4"] === "井室坐标") {
						this.jszb.push(item["__EMPTY_5"]);
					}
					if (item["__EMPTY_4"] === "相对位置") {
						this.xdwz.push(item["__EMPTY_5"]);
					}
					if (item["__EMPTY_9"] === "井室编号") {
						this.jsbh.push(item["__EMPTY_10"]);
					}
					if (item["__EMPTY_9"] === "运行状态") {
						this.yxzt.push(item["__EMPTY_10"]);
					}
					if (item["__EMPTY_9"] === "井  深") {
						this.js.push(item["__EMPTY_10"]);
					}
				});
				for (let i = 0; i < this.ssmc.length; i++) {
					this.ExcelInfo.push({
						ssmc: this.ssmc[i],
						ggxh: this.ggxh[i],
						syzt: this.syzt[i],
						ssgx: this.ssgx[i],
						jsbh: this.jsbh[i],
						jslx: this.jslx[i],
						jszb: this.jszb[i],
						yxzt: this.yxzt[i],
						jsqk: this.jsqk[i],
						kgfx: this.kgfx[i],
						xdwz: this.xdwz[i],
						js: this.js[i],
						sccj: this.sccj[i],
						// excel的时间格式是数字，需要转换 例如：41183转化为2012-10-1
						azsj: this.azsj[i] ? this.excelDateToJSDate(this.azsj[i]) : "",
					});
				}
				// 后续为自己对ws数据的处理
			} catch (e: any) {
				return false;
			}
		};
		fileReader.readAsBinaryString(files[0]);
	}

	// excel的时间格式是数字，需要转换 例如：41183转化为2012-10-1
	public excelDateToJSDate(serial: any) {
		const utc_days = Math.floor(serial - 25569);
		const utc_value = utc_days * 86400;
		const date_info = new Date(utc_value * 1000);
		return (
			date_info.getFullYear() +
			"-" +
			("0" + (date_info.getMonth() + 1)).slice(-2) +
			"-" +
			("0" + date_info.getDate()).slice(-2)
		);
	}
}
</script>

<style lang="scss" scoped>
.page {
	.outputlist_upload {
		border: none;
	}
	input[type="button"] {
		background: red;
	}
	.submit {
		margin-top: 20px;
	}
	.inputCard {
		margin-top: 15px;
	}
}
</style>
