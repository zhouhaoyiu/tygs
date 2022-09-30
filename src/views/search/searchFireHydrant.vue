<template>
	<div class="page">
		<Title>查询 消火栓</Title>
		<div class="searchArea">
			<div class="searchSelects">
				<span>街道名称: </span>
				<el-input
					v-model="searchSelectBy.streetName"
					style="width: 200px"
					class="searchSelect"
				></el-input>
				<span>厂家: </span>
				<el-input
					v-model="searchSelectBy.manufactor"
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
				<el-button
					:loading="searchLoading"
					@click="search()"
					style="margin-left: 20px"
					type="primary"
				>
					搜索
				</el-button>
				<el-button @click="clearRes()" style="margin-left: 15px"> 重置 </el-button>
			</div>
			<div></div>
		</div>
		<el-table
			border
			stripe
			v-loading="tableLoading"
			:data="displayRes.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
			max-height="580px"
			class="table"
		>
			<el-table-column align="center" prop="filledBy" width="100px" label="填写人">
			</el-table-column>

			<el-table-column align="center" prop="accountIdentifier" width="130px" label="编号">
			</el-table-column>
			<el-table-column align="center" prop="streetName" width="100px" label="街道名称">
			</el-table-column>
			<el-table-column align="center" width="120px" prop="wellChamberType" label="井室类型">
			</el-table-column>
			<el-table-column align="center" width="150px" prop="caliber" label="口径">
			</el-table-column>
			<el-table-column align="center" prop="runningState" width="120px" label="运行状态">
			</el-table-column>
			<el-table-column align="center" prop="quantity" width="100px" label="数量">
			</el-table-column>
			<el-table-column align="center" prop="wellDepth" label="井深" width="100px">
			</el-table-column>
			<el-table-column align="center" width="100px" label="定位坐标">
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
      </el-table-column>-->
			<el-table-column align="center" prop="manufactor" width="120px" label="厂家">
			</el-table-column>
			<el-table-column align="center" prop="personLiable" width="120px" label="责任人">
			</el-table-column>
			<el-table-column
				align="center"
				prop="troubleshootingTime"
				width="150px"
				label="排查时间"
			>
			</el-table-column>
			<el-table-column align="center" prop="runTime" width="150px" label="运行时间">
			</el-table-column>
			<el-table-column align="center" prop="repairTime" width="150px" label="修复时间">
			</el-table-column>

			<el-table-column align="center" label="操作" width="200px" fixed="right">
				<template v-slot="scope">
					<div style="display: flex; justify-content: center; align-items: center">
						<!-- <el-button size="small" @click="openWaterMeter(scope.row.id)">
							水表信息
						</el-button> -->
						<el-button size="small" @click="modify(scope.row)" type="primary">
							修改信息
						</el-button>
						<el-button
							size="small"
							disabled
							@click="deleteWell(scope.row)"
							type="danger"
						>
							删除
						</el-button>
						<!-- <el-button size="small" @click="openRepair(scope.row.id)" type="primary">
              维修记录
            </el-button> -->
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
			{{ repairInfo }}
			<el-input v-model="addRepairText" />
			<el-button @click="updateRepair()">添加</el-button>
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
interface FireHydrant {}
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";
import { calibers } from "./info";
import { elOptionArray, objectArray, repairInfoArray } from "./types";
@Component({
	components: {
		Title,
	},
})
export default class SearchAll extends Vue {
	public pickerOptions = {};

	public searchTextBy = "streetName";
	public searchText = "";

	public searchSelectBy = {
		streetName: "" as string, // 街道名称
		manufactor: "" as string, // 水表厂家
		caliber: [] as string[], // 口径
	};

	public waterMeterInfoSearchBy: string = "accountNumber";
	public waterMeterInfoSearchText: string = "";

	public options: elOptionArray = [
		{ value: "streetName", label: "街道名称" },
		{ value: "manufactor", label: "厂家" },
		// { value: "detailedAddress", label: "详细地址" },
	];

	public waterMeterInfoSearchOptions: elOptionArray = [
		{ value: "paymentNumber", label: "缴费号" },
		{ value: "accountNumber", label: "户号" },
		{ value: "accountName", label: "户名" },
	];

	public calibers: elOptionArray = calibers;

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

		const searchText: Record<string, any> = {
			caliber: this.searchSelectBy.caliber as string[],
			manufactor: this.searchSelectBy.manufactor,
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

	public modify(info: any): void {
		void info;
	}

	public async getRes(): Promise<void> {
		this.tableLoading = true;
		const res = await this["axios"].get("/FireHydrant/getAllFireHydrantInfo");
		this.searchRes = res.data;
		// .sort(
		//   (a: { filledBy: string }, b: { filledBy: string }) => {
		//     return a.filledBy.localeCompare(b.filledBy);
		//   }
		// );
		// 结果前100条
		this.displayRes = this.searchRes;
		// .slice(0, 100);
		this.tableLoading = false;
	}

	public async clearRes(): Promise<void> {
		this.searchRes = [];
		this.searchText = "";
		await this.getRes();
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
		const res = await this["axios"].post(`FireHydrant/updateFireHydrantRepairInfoWithId`, {
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
		const res = await this["axios"].get(`FireHydrant/getFireHydrantRepairInfoById`, {
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

	public deleteWell(id: number): void {
		void id;
	}

	// 根据id获取水表信息
	public async getWaterMeterInfoById(wallId: number): Promise<void> {
		const res = await this["axios"].get(`FireHydrant/getFireHydrantWaterMeterInfoByWallId`, {
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
		const res = await this["axios"].post(`FireHydrant/insertFireHydrantWaterMeterInfo`, {
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
		const res = await this["axios"].get(`FireHydrant/deleteWaterMeterInfoById`, {
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

<style lang="scss">
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
		margin-top: 0.5%;
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
