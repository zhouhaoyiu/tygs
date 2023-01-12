<template>
	<div class="page">
		<Title>查询 阀门井</Title>
		<div class="searchArea">
			<div class="searchSelects">
				<span>街道名称: </span>
				<el-input
					v-model="searchSelectBy.streetName"
					style="width: 200px"
					class="searchSelect"
				></el-input>
				<span>口径: </span>
				<el-select multiple v-model="searchSelectBy.caliber" class="searchSelect">
					<el-option
						v-for="item in calibers"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					>
					</el-option>
				</el-select>
				<span>类型: </span>
				<el-select multiple v-model="searchSelectBy.wellChamberType" class="searchSelect">
					<el-option
						v-for="item in wellChamberTypes"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					>
					</el-option>
				</el-select>
				<!-- <span>厂家: </span>
				<el-select multiple v-model="searchSelectBy.manufactor" class="searchSelect">
					<el-option
						v-for="item in wellChamberTypes"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					>
					</el-option>
				</el-select> -->
			</div>
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
				<el-button
					disabled
					type="success"
					round
					@click="exportExcel()"
					:loading="exportLoading"
				>
					导出
					<i class="el-icon-download el-icon--right"></i>
				</el-button>
			</div>
		</div>
		<el-table
			border
			stripe
			v-loading="tableLoading"
			:data="displayRes.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
			max-height="530px"
			class="table"
		>
			<el-table-column align="center" prop="filledBy" width="100px" label="填写人">
			</el-table-column>
			<el-table-column align="center" prop="accountIdentifier" width="150px" label="编号">
			</el-table-column>
			<el-table-column align="center" prop="streetName" width="100px" label="街道名称">
			</el-table-column>
			<el-table-column align="center" prop="wellChamberType" width="150px" label="井室类型">
			</el-table-column>
			<el-table-column align="center" prop="caliber" width="150px" label="口径">
			</el-table-column>
			<el-table-column align="center" prop="runningState" width="150px" label="运行状态">
			</el-table-column>
			<el-table-column align="center" prop="quantity" width="150px" label="数量">
			</el-table-column>
			<el-table-column align="center" prop="wellDepth" width="150px" label="井深">
			</el-table-column>
			<el-table-column align="center" width="150px" label="定位坐标">
				<template v-slot="scope">
					<el-tooltip
						class="item"
						:content="scope.row.positioningCoordinates"
						placement="bottom"
					>
						<el-button type="text" style="color: #409eff"> 查看 </el-button>
					</el-tooltip>
				</template>
			</el-table-column>
			<!-- <el-table-column
        align="center"
        prop="photosInTheWell"
        width="150px"
        label="井内照片"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="photosOutsideTheWell"
        width="150px"
        label="井外照片"
      >
      </el-table-column> -->
			<el-table-column align="center" prop="manufactor" label="厂家">
				<!--          -->
			</el-table-column>

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
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			center
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
			center
			title="表井信息"
			:visible.sync="wallInfoDialog"
		>
		</el-dialog>
	</div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import Vue from "vue";
import Component from "vue-class-component";
import { utils, writeFileXLSX } from "xlsx";
import Title from "../../components/title.vue";
import { calibers, wellChamberTypes } from "./info";
import { elOptionArray, objectArray, repairInfoArray } from "./types";
@Component({
	components: {
		Title,
	},
})
export default class SearchValueWell extends Vue {
	public pickerOptions = {};

	public searchTextBy: string = "filledBy";
	public searchText: string = "";
	public waterMeterInfoSearchBy: string = "accountNumber";
	public waterMeterInfoSearchText: string = "";

	public searchSelectBy = {
		caliber: [] as string[], // 口径
		wellChamberType: [] as string[], // 井室类型
		streetName: "" as string, // 街道，
		manufactor: [] as string[], // 厂家
	};

	public options: objectArray = [
		{
			value: "filledBy",
			label: "填写人",
		},
		{
			value: "accountIdentifier",
			label: "编号",
		},
	];

	public waterMeterInfoSearchOptions: elOptionArray = [
		{ value: "paymentNumber", label: "缴费号" },
		{ value: "accountNumber", label: "户号" },
		{ value: "accountName", label: "户名" },
	];

	public calibers: elOptionArray = calibers;
	public wellChamberTypes: elOptionArray = wellChamberTypes;

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

		const searchText = {
			[this.searchTextBy]: this.searchText,
			caliber: this.searchSelectBy.caliber as string[],
			wellChamberType: this.searchSelectBy.wellChamberType as string[],
			streetName: this.searchSelectBy.streetName,
		};

		for (const key in searchText) {
			if (searchText[key] === "" || searchText[key].length === 0) {
				delete searchText[key];
			}
		}
		// 按照searchText的属性进行筛选，只要内容包含searchText的属性值就可以
		// searchText的属性值可以是数组，包含数组中的任意一个值就可以
		const promise = new Promise<void>((resolve, _) => {
			this.displayRes = this.searchRes.filter((item) => {
				for (const key in searchText) {
					if (Array.isArray(searchText[key])) {
						if (!searchText[key].includes(item[key])) {
							return false;
						}
					} else {
						if (!String(item[key]).includes(searchText[key] as string)) {
							return false;
						}
					}
				}
				return true;
			});
			resolve();
		});
		await promise;

		this.searchLoading = false;
		this.tableLoading = false;

		// 解决视图不更新的问题
		await this.$nextTick();
	}

	public waterMeterSearch() {
		this.waterMeterInfoArr = this.waterMeterInfoArr.filter((item) => {
			if (item) {
				if (typeof item[this.waterMeterInfoSearchBy] === "string") {
					return (
						(item[this.waterMeterInfoSearchBy] as string)
							.trim()
							.toLowerCase()
							.indexOf(this.waterMeterInfoSearchText.trim().toLowerCase()) > -1
					);
				} else if (typeof item[this.waterMeterInfoSearchBy] === "number") {
					return (
						(item[this.waterMeterInfoSearchBy] as unknown as Number) ===
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

	public exportExcel(): void {
		this.exportLoading = true;

		const promise = new Promise<void>((resolve, _) => {
			const data = this.displayRes;
			const ws = utils.json_to_sheet(data);
			const wb = utils.book_new();

			// 根据搜索条件+时间生成文件名
			const searchText = this.searchText ? this.searchText : "空";
			const searchTextBy = this.searchTextBy === "filledBy" ? "填写人" : "";
			const caliber = this.searchSelectBy.caliber
				? this.searchSelectBy.caliber.join(",")
				: "";
			const wellChamberType = this.searchSelectBy.wellChamberType
				? this.searchSelectBy.wellChamberType.join(",")
				: "";
			const streetName = this.searchSelectBy.streetName ? this.searchSelectBy.streetName : "";
			// 详细到时分秒
			const time = "+" + dayjs().format("YYYY-MM-DD HH:mm:ss");
			const fileName = `${searchTextBy}+${searchText}+${caliber}+${wellChamberType}+${streetName}+${time}`;

			utils.book_append_sheet(wb, ws, "SheetJS");
			writeFileXLSX(wb, fileName);
			resolve();
		});
		promise.then(() => {
			this.$message({
				message: "导出成功",
				type: "success",
			});
			this.exportLoading = false;
		});
	}

	public async getRes(): Promise<void> {
		this.tableLoading = true;
		const res = await this["axios"].get("/ValueWell/getAllValueWellInfo");
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

		const res = await this["axios"].post(`ValueWell/updateValueWellRepairInfoWithId`, {
			id: this.repairId,
			repairInfo: JSON.stringify(repairInfo),
		});
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
		const res = await this["axios"].get(`ValueWell/getValueWellRepairInfoById`, {
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
		const res = await this["axios"].get(`ValueWell/getValueWellWaterMeterInfoByWallId`, {
			params: {
				wallId: wallId,
			},
		});

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
		const res = await this["axios"].post(`ValueWell/insertValueWellWaterMeterInfo`, {
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
		const res = await this["axios"].get(`ValueWell/deleteWaterMeterInfoById`, {
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
