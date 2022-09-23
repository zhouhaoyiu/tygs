<template>
	<div class="page">
		<Title>查询 表井(总表)</Title>
		<div class="searchArea">
			<div class="searchInput">
				<el-select v-model="searchTextBy" style="margin-right: 15px">
					<el-option
						v-for="item in options"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					>
					</el-option>
				</el-select>
				<el-input
					@keyup.enter.native="search()"
					style="width: 400px"
					v-model="searchText"
					clearable
					placeholder="请输入搜索字段"
				>
				</el-input>
				<el-button
					:loading="searchLoading"
					@click="search()"
					style="margin-left: 30px"
					type="primary"
				>
					搜索
				</el-button>
				<el-button @click="clearRes()" style="margin-left: 15px"> 重置 </el-button>
				<!-- <el-button disabled type="success" round @click="exportExcel()" :loading="exportLoading">
          导出
          <i class="el-icon-download el-icon--right"></i>
        </el-button> -->
			</div>
		</div>
		<el-table
			border
			stripe
			v-loading="tableLoading"
			:data="displayRes.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
			max-height="560px"
			class="table"
		>
			<el-table-column align="center" prop="filledBy" width="100px" label="填写人">
			</el-table-column>
			<el-table-column align="center" prop="accountName" width="150px" label="户名">
			</el-table-column>
			<el-table-column align="center" prop="accountNumber" width="150px" label="户号">
			</el-table-column>
			<el-table-column align="center" prop="address" width="150px" label="地址  ">
			</el-table-column>
			<el-table-column align="center" width="100px" label="坐标">
				<template v-slot="scope">
					<el-tooltip class="item" :content="scope.row.coordinates" placement="bottom">
						<el-button type="text" style="color: #409eff"> 查看 </el-button>
					</el-tooltip>
				</template>
			</el-table-column>
			<el-table-column align="center" prop="caliber" width="110px" label="口径">
			</el-table-column>
			<el-table-column align="center" width="150px" prop="operatingStatus" label="运行状态">
			</el-table-column>
			<el-table-column align="center" width="140px" prop="waterNature" label="用水性质">
			</el-table-column>
			<el-table-column align="center" prop="wellDepth" width="100px" label="井深">
			</el-table-column>
			<el-table-column
				align="center"
				prop="includedFacilities"
				width="100px"
				label="内含设施"
			>
			</el-table-column>
			<el-table-column
				align="center"
				prop="waterMeterManufacturer"
				label="水表厂家"
				width="120px"
			>
			</el-table-column>
			<el-table-column align="center" prop="accountIdentifier" width="120px" label="编号">
			</el-table-column>
			<!-- <el-table-column align="center" prop="writtingTime" width="150px" label="填写时间">
      </el-table-column> -->
			<el-table-column align="center" label="操作" width="200px" fixed="right">
				<template v-slot="scope">
					<div style="display: flex; justify-content: center; align-items: center">
						<el-button size="small" @click="openWaterMeter(scope.row.id)">
							水表信息
						</el-button>
						<el-button size="small" @click="modify(scope.row)" type="primary">
							修改信息
						</el-button>
						<!-- <el-button
              size="small"
              @click="openRepair(scope.row.id)"
              type="primary"
            >
              维修记录
            </el-button> -->
						<!-- <el-button @click="seeDetail(scope.row)" type=""> 查看 </el-button> -->
					</div>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			background
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
			:current-page="currentPage"
			:page-size="30"
			layout="total, prev, pager, next, jumper"
			:total="total"
			class="pagination"
		>
		</el-pagination>
		<el-dialog
			center
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			title="维修记录"
			:visible.sync="repairDialog"
		>
			<div style="height: 400px">
				<div
					v-for="repairInfoSingle in repairInfo"
					:key="repairInfoSingle.time + Math.random()"
				>
					{{ repairInfoSingle }}
				</div>
			</div>
			<el-input
				style="width: 240px; margin-right: 24px"
				v-model="addRepairText"
				placeholder="请输入维修记录"
			/>
			<el-date-picker
				v-model="addRepairTime"
				type="date"
				placeholder="选择日期"
				:picker-options="pickerOptions"
				style="width: 240px; margin-right: 12px"
			/>
			<el-input
				v-model="addRepairRemarks"
				type="textarea"
				style="margin-top: 12px"
				placeholder="请输入维修备注"
			/>

			<el-button
				:disabled="updateRepairDisabled"
				style="margin-top: 12px"
				@click="updateRepair()"
			>
				添加
			</el-button>
		</el-dialog>
		<el-dialog
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			center
			title="水表信息"
			:visible.sync="waterMeterDialog"
		>
			<div style="display: flex; margin: auto; width: 100%; justify-content: center">
				<el-select v-model="waterMeterInfoSearchBy" style="margin-right: 20px">
					<el-option
						v-for="waterMeterInfoSearchOption in waterMeterInfoSearchOptions"
						:key="waterMeterInfoSearchOption.value"
						:label="waterMeterInfoSearchOption.label"
						:value="waterMeterInfoSearchOption.value"
					>
					</el-option>
				</el-select>
				<el-input
					@keyup.enter.native="waterMeterSearch()"
					clearable
					v-model="waterMeterInfoSearchText"
					style="width: 300px; margin-right: 20px"
					placeholder="水表搜索"
				/>
				<el-button @click="waterMeterSearch()" type="primary">搜索</el-button>
			</div>
			<el-table
				:data="waterMeterInfoArr"
				max-height="400px"
				style="margin-top: 10px; width: 1200px"
			>
				<!-- <el-table-column align="center" prop="id" label="id">
        </el-table-column> -->
				<el-table-column align="center" prop="paymentNumber" label="缴费号">
				</el-table-column>
				<el-table-column align="center" prop="accountNumber" label="户号">
				</el-table-column>
				<el-table-column align="center" prop="accountName" label="户名"> </el-table-column>
				<el-table-column align="center" prop="nature" label="用水性质"> </el-table-column>
				<el-table-column align="center" label="操作" width="100px" fixed="right">
					<template v-slot="scope">
						<div style="display: flex; justify-content: center; align-items: center">
							<el-button
								type="danger"
								@click="deleteWaterMeter(scope.row.waterMeterId)"
							>
								删除
							</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="waterMeterDialog">
				<el-input
					class="dialogInput"
					v-model="waterMeterForm.paymentNumber"
					placeholder="缴费号"
				>
				</el-input>
				<el-input
					class="dialogInput"
					v-model="waterMeterForm.accountNumber"
					placeholder="户号"
				>
				</el-input>
				<el-input
					class="dialogInput"
					v-model="waterMeterForm.accountName"
					placeholder="户名"
				>
				</el-input>
				<el-input
					class="dialogInput"
					v-model="waterMeterForm.nature"
					placeholder="用水性质"
				>
				</el-input>
				<el-button
					type="primary"
					:disabled="insertWaterMeterInfoDisabled"
					@click="insertWaterMeterInfo()"
				>
					新增水表信息
				</el-button>
			</div>
		</el-dialog>
		<el-dialog
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			title="表井信息"
			center
			:visible.sync="wallInfoDialog"
		>
			<el-form :model="wallInfoForm" label-width="100px" class="demo-ruleForm">
				<el-form-item label="户名" prop="accountName">
					<el-input v-model="wallInfoForm.accountName" placeholder="户名"></el-input>
				</el-form-item>
				<el-form-item label="户号" prop="accountNumber">
					<el-input v-model="wallInfoForm.accountNumber" placeholder="户号"></el-input>
				</el-form-item>
				<el-form-item label="坐标" prop="coordinates">
					<el-input v-model="wallInfoForm.coordinates" placeholder="坐标"></el-input>
				</el-form-item>
				<el-form-item label="口径" prop="caliber">
					<el-input v-model="wallInfoForm.caliber" placeholder="口径"></el-input>
				</el-form-item>
				<el-form-item label="运行状态" prop="operatingStatus">
					<el-input
						v-model="wallInfoForm.operatingStatus"
						placeholder="运行状态"
					></el-input>
				</el-form-item>
				<el-form-item label="用水性质" prop="waterNature">
					<el-input v-model="wallInfoForm.waterNature" placeholder="用水性质"></el-input>
				</el-form-item>
				<el-form-item label="井深" prop="wellDepth">
					<el-input v-model="wallInfoForm.wellDepth" placeholder="井深"></el-input>
				</el-form-item>
				<el-form-item label="内含设施" prop="includedFacilities">
					<el-input
						v-model="wallInfoForm.includedFacilities"
						placeholder="内含设施"
					></el-input>
				</el-form-item>
				<el-form-item label="水表厂家" prop="waterMeterManufacturer">
					<el-input
						v-model="wallInfoForm.waterMeterManufacturer"
						placeholder="水表厂家"
					></el-input>
				</el-form-item>
				<el-table-column align="center" prop="accountIdentifier" width="150px" label="编号">
				</el-table-column>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="wallInfoDialog = false">取 消</el-button>
				<el-button type="primary" @click="wallInfoDialog = false">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script lang="ts">
import _ from "lodash";
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { calibers } from "./info";
import { elOptionArray, objectArray, repairInfoArray } from "./types";
@Component({
	components: {
		Title,
	},
})
export default class SearchAll extends Vue {
	public pickerOptions = {};

	public searchTextBy: string = "accountNumber";
	public searchText: string = "";
	public waterMeterInfoSearchBy: string = "accountNumber";
	public waterMeterInfoSearchText: string = "";

	public searchSelectBy = {
		accountIdentifier: [] as string[], //编号
		accountNumber: [] as string[], // 户号
		address: "" as string, // 地址
	};

	public options: elOptionArray = [
		{ value: "accountIdentifier", label: "编号" },
		{ value: "accountNumber", label: "户号" },
		{ value: "address", label: " 地址" },
	];

	public waterMeterInfoSearchOptions: elOptionArray = [
		{ value: "paymentNumber", label: "缴费号" },
		{ value: "accountNumber", label: "户号" },
		{ value: "accountName", label: "户名" },
	];

	public searchRes: objectArray = [];
	public displayRes: objectArray = [];

	public static formLabelWidth = "120px";

	public exportLoading = false;
	public searchLoading = false;
	public tableLoading = false;

	public repairDialog = false;
	public repairId = 0;
	public repairInfo: repairInfoArray = [];
	public addRepairText = ""; // 新增的维修记录
	public addRepairTime = ""; // 新增的维修时间
	public addRepairRemarks = ""; // 新增的维修备注

	public waterMeterDialog = false;
	public waterMeterDialogId = 0;
	public waterMeterInfoArr = [];
	public waterMeterForm = {
		paymentNumber: "", //缴费号
		accountNumber: "", //户号
		accountName: "", //户名
		nature: "", //状态
	};

	public wallInfoDialog = false;
	public wallInfoId = 0;

	public wallInfoForm = {
		accountName: "", //户名
		accountNumber: "", //户号
		coordinates: "", //坐标
		caliber: "", //口径
		operatingStatus: "", //运行状态
		waterNature: "", //用水性质
		wellDepth: "", //井深
		includedFacilities: "", //内含设施
		waterMeterManufacturer: "", //水表厂家
	};

	public calibers: { value: string | null; label: string }[] = calibers;

	public handleSizeChange(val: number): void {
		this.pageSize = val;
	}
	public handleCurrentChange(val: number): void {
		this.currentPage = val;
	}
	public pageSize = 30;
	public currentPage = 1;

	// 计算属性获取displayRes的长度
	public get total(): number {
		return this.displayRes.length;
	}

	public get updateRepairDisabled(): boolean {
		return this.addRepairText === "" || this.addRepairTime === "";
	}

	public get insertWaterMeterInfoDisabled(): boolean {
		return (
			this.waterMeterForm.paymentNumber === "" ||
			this.waterMeterForm.accountNumber === "" ||
			this.waterMeterForm.accountName === "" ||
			this.waterMeterForm.nature === ""
		);
	}

	public async search(): Promise<void> {
		this.searchLoading = true;
		this.tableLoading = true;
		this.displayRes = this.searchRes.filter((item) => {
			if (item) {
				if (typeof item[this.searchTextBy] === "string") {
					return (
						(item[this.searchTextBy] as string)
							.toLowerCase()
							.indexOf(this.searchText.trim().toLowerCase()) > -1
					);
				} else if (typeof item[this.searchTextBy] === "number") {
					return (
						(item[this.searchTextBy] as unknown as number) === Number(this.searchText)
					);
				} else {
					return false;
				}
			}
		});
		this.searchLoading = false;
		this.tableLoading = false;

		await this.$nextTick();
	}

	public waterMeterSearch(): void {
		this.waterMeterInfoArr = this.waterMeterInfoArr.filter((item) => {
			if (item) {
				if (typeof item[this.waterMeterInfoSearchBy] === "string") {
					return (
						(item[this.waterMeterInfoSearchBy] as string)
							.toLowerCase()
							.indexOf(this.waterMeterInfoSearchText.trim().toLowerCase()) > -1
					);
				} else if (typeof item[this.waterMeterInfoSearchBy] === "number") {
					return (
						(item[this.waterMeterInfoSearchBy] as unknown as number) ===
						Number(this.waterMeterInfoSearchText)
					);
				} else {
					throw new Error("搜索字段类型错误");
				}
			}
		});
	}

	public async mounted(): Promise<void> {
		this.pickerOptions = {
			disabledDate(time: { getTime: () => number }) {
				return time.getTime() > Date.now();
			},
			shortcuts: [
				{
					text: "今天",
					onClick(picker: { $emit: (arg0: string, arg1: Date) => void }) {
						picker.$emit("pick", new Date());
					},
				},
				{
					text: "昨天",
					onClick(picker: { $emit: (arg0: string, arg1: Date) => void }) {
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24);
						picker.$emit("pick", date);
					},
				},
				{
					text: "一周前",
					onClick(picker: { $emit: (arg0: string, arg1: Date) => void }) {
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
						picker.$emit("pick", date);
					},
				},
			],
		};
		await this.getRes();
	}

	public async getRes(): Promise<void> {
		this.tableLoading = true;
		const res = await this["axios"].get("/WaterMeterWell/getAllWaterMeterWellInfo");
		this.searchRes = res.data;
		// .sort(
		//   (a: { filledBy: string }, b: { filledBy: string }) => {
		//     return a.filledBy.localeCompare(b.filledBy);
		//   }
		// );
		// 结果前100条
		this.displayRes = this.searchRes;

		this.tableLoading = false;
	}

	public async clearRes(): Promise<void> {
		this.searchRes = [];
		this.searchText = "";
		await this.getRes();
	}

	public modify(info: any): void {
		this.wallInfoDialog = true;
		this.wallInfoId = info.id;
		this.wallInfoForm = _.cloneDeep(info);
	}

	public seeDetail(): void {}

	public async updateRepair(): Promise<void> {
		let repairInfo: string | repairInfoArray = this.repairInfo;

		if (
			this.repairInfo.length === 0 ||
			this.repairInfo === null ||
			this.repairInfo === undefined
		) {
			repairInfo = [
				{
					text: this.addRepairText,
					repairTime: this.addRepairTime,
					remarks: this.addRepairRemarks,
					time: new Date().toLocaleString(),
				},
			];
		} else {
			const repairInfoArr = this.repairInfo;
			repairInfoArr.push({
				text: this.addRepairText,
				repairTime: this.addRepairTime,
				remarks: this.addRepairRemarks,
				time: new Date().toLocaleString(),
			});
		}
		const res = await this["axios"].post(
			`WaterMeterWell/updateWaterMeterWellRepairInfoWithId`,
			{
				id: this.repairId,
				repairInfo: JSON.stringify(repairInfo),
			},
		);
		if (res.data.code === 0) {
			this.$message.success(res.data.msg);
			this.addRepairText = "";
			this.addRepairTime = "";
			this.addRepairRemarks = "";
		}
		await this.getRepair(this.repairId);
	}

	public async openRepair(id: number): Promise<void> {
		this.repairDialog = true;
		this.repairId = id;
		await this.getRepair(id);
	}

	public async getRepair(id: number): Promise<void> {
		const res = await this["axios"].get(`WaterMeterWell/getWaterMeterWellRepairInfoById`, {
			params: {
				id: id,
			},
		});
		this.$message.success(res.data.msg);
		if (res.data.data === null || res.data.data === undefined || res.data.data === "") {
			this.repairInfo = [];
		} else {
			this.repairInfo = res.data.data;
		}
	}

	// 打开水表信息编辑弹窗
	public async openWaterMeter(id: number): Promise<void> {
		this.waterMeterDialog = true;
		this.waterMeterDialogId = id;
		await this.getWaterMeterInfoById(id);
	}

	// 根据id获取水表信息
	public async getWaterMeterInfoById(wallId: number): Promise<void> {
		const res = await this["axios"].get(
			`WaterMeterWell/getWaterMeterWellWaterMeterInfoByWallId`,
			{
				params: {
					wallId: wallId,
				},
			},
		);
		this.$message.success(res.data.msg);
		this.waterMeterInfoArr = res.data.data;
	}

	// 更新水表信息
	public async insertWaterMeterInfo(): Promise<void> {
		await this.sendWaterMeterInfo(this.waterMeterForm);
	}

	public async sendWaterMeterInfo(waterMeterForm: {
		paymentNumber: string; //缴费号
		accountNumber: string; //户号
		accountName: string; //户名
		nature: string;
	}): Promise<void> {
		const res = await this["axios"].post(`WaterMeterWell/insertWaterMeterWellWaterMeterInfo`, {
			wallId: this.waterMeterDialogId,
			waterMeterId: nanoid(),
			updateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
			...waterMeterForm,
		});
		if (res.data.code === 0) {
			this.waterMeterForm = {
				paymentNumber: "", //缴费号
				accountNumber: "", //户号
				accountName: "", //户名
				nature: "", //状态
			};
			await this.getWaterMeterInfoById(this.waterMeterDialogId);
		}
	}

	public async deleteWaterMeter(waterMeterId: string): Promise<void> {
		const res = await this["axios"].get(`WaterMeterWell/deleteWaterMeterInfoById`, {
			params: {
				waterMeterId: waterMeterId,
			},
		});
		if (res.data.code === 0) {
			this.$message.success(res.data.msg);
			await this.getWaterMeterInfoById(this.waterMeterDialogId);
		} else {
			this.$message.error(res.data.msg);
		}
		// this.waterMeterInfoArr = this.waterMeterInfoArr.filter((item: { waterMeterId: string }) => {
		// 	return item.waterMeterId !== waterMeterId;
		// });
	}
}
</script>

<style lang="scss" scoped>
.page {
	.searchInput {
		background: transparent;
	}

	.searchSelects {
		margin-bottom: 15px;
		font-weight: bold;

		.searchSelect {
			margin-right: 20px;
		}
	}

	.table {
		margin-top: 20px;
		width: 1600px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	}
	.pagination {
		// 居中
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 15px;
	}

	.waterMeterDialog {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		align-items: center;
		margin-top: 40px;
	}

	.dialogInput {
		width: 20%;
		// margin: 10px;
	}

	.repairDialog {
		border-radius: 10px;
	}
}
</style>
