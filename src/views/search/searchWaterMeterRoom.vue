<template>
	<div class="page">
		<Title>查询 水表间(户表)</Title>
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
			max-height="575px"
			class="table"
		>
			<el-table-column align="center" prop="filledBy" width="120px" label="填写人">
			</el-table-column>
			<el-table-column align="center" prop="accountIdentifier" width="150px" label="编号">
			</el-table-column>
			<el-table-column align="center" prop="communityName" width="200px" label="小区名称">
			</el-table-column>
			<el-table-column align="center" prop="detailedAddress" width="200px" label="详细地址">
			</el-table-column>
			<el-table-column align="center" width="150px" label="位置">
				<template v-slot="scope">
					<el-tooltip class="item" :content="scope.row.location" placement="bottom">
						<el-button type="text" style="color: #409eff"> 查看 </el-button>
					</el-tooltip>
				</template>
			</el-table-column>

			<el-table-column
				align="center"
				width="100px"
				prop="watermeterLocation"
				label="水表位置"
			>
			</el-table-column>
			<el-table-column align="center" prop="watermeterType" width="100px" label="水表类型">
			</el-table-column>
			<el-table-column align="center" prop="totalHouseholds" width="100px" label="总户数">
			</el-table-column>
			<el-table-column align="center" prop="numberHouseholds" label="居民户数" width="100px">
			</el-table-column>
			<el-table-column
				align="center"
				prop="numberNoHouseholds"
				width="100px"
				label="非居民户数"
			>
			</el-table-column>
			<el-table-column
				align="center"
				prop="numberHouseholdsWithSubitems"
				width="100px"
				label="带分项户数"
			>
			</el-table-column>
			<el-table-column align="center" prop="pipe" width="120px" label="管材">
			</el-table-column>
			<el-table-column
				align="center"
				prop="conditionOfWaterSeparator"
				width="120px"
				label="分水器情况"
			>
			</el-table-column>
			<el-table-column align="center" prop="troubleshooting" width="150px" label="排查情况">
			</el-table-column>
			<!-- <el-table-column
        align="center"
        prop="personLiable"
        width="150px"
        label="负责人"
      >
      </el-table-column> -->
			<!-- <el-table-column
        align="center"
        prop="wallOutSide"
        width="150px"
        label="表间外拍照"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="wallInside"
        width="150px"
        label="表间内拍照"
      >
      </el-table-column> -->
			<el-table-column align="center" label="操作" width="200px" fixed="right">
				<template v-slot="scope">
					<div style="display: flex; justify-content: center; align-items: center">
						<el-button size="small" @click="openWaterMeter(scope.row.id)">
							水表信息
						</el-button>
						<el-button size="small" disabled @click="modify(scope.row)" type="primary">
							修改信息
						</el-button>

						<!-- <el-button size="small" @click="openRepair(scope.row.id)" type="primary">
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
	</div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";
import { elOptionArray, objectArray, repairInfoArray } from "./types";
@Component({
	components: {
		Title,
	},
})
export default class SearchAll extends Vue {
	public pickerOptions = {};

	public searchTextBy: string = "accountIdentifier";
	public searchText: string = "";
	public waterMeterInfoSearchBy: string = "accountNumber";
	public waterMeterInfoSearchText: string = "";

	public searchSelectBy = {
		caliber: [] as string[], // 口径
		wellChamberType: [] as string[], // 井室类型
		streetName: "" as string, // 街道
	};

	public options: elOptionArray = [
		{ value: "accountIdentifier", label: "编号" },
		{ value: "communityName", label: "小区名称" },
		{ value: "detailedAddress", label: "详细地址" },
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

	public handleSizeChange(val: number) {
		this.pageSize = val;
	}
	public handleCurrentChange(val: number) {
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

	public waterMeterSearch() {
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
					return false;
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
		const res = await this["axios"].get("/WaterMeterRoom/getAllWaterMeterRoomInfo");
		this.searchRes = res.data;
		// .sort(
		//   (a: { filledBy: string }, b: { filledBy: string }) => {
		//     return a.filledBy.localeCompare(b.filledBy);
		//   }
		// );

		this.displayRes = this.searchRes;
		// .slice(0, 30);
		this.tableLoading = false;
	}

	public async clearRes(): Promise<void> {
		this.searchRes = [];
		this.searchText = "";
		await this.getRes();
	}

	public modify(info: any): void {
		void info;
	}

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
			`WaterMeterRoom/updateWaterMeterRoomRepairInfoWithId`,
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
		const res = await this["axios"].get(`WaterMeterRoom/getWaterMeterRoomRepairInfoById`, {
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
			`WaterMeterRoom/getWaterMeterRoomWaterMeterInfoByWallId`,
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
		const res = await this["axios"].post(`WaterMeterRoom/insertWaterMeterRoomWaterMeterInfo`, {
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
		const res = await this["axios"].get(`WaterMeterRoom/deleteWaterMeterInfoById`, {
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
}
</style>
