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
					@keyup.enter="search()"
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
					<el-icon><Download /></el-icon>
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
						<el-button link type="primary"> 查看 </el-button>
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
			v-model="repairDialog"
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
				:disabled="repairSaving || repairLoading"
				v-model="addRepairText"
				placeholder="请输入维修记录"
			/>
			<el-date-picker
				:disabled="repairSaving || repairLoading"
				v-model="addRepairTime"
				type="date"
				placeholder="选择日期"
				:disabled-date="pickerOptions.disabledDate"
				:shortcuts="pickerOptions.shortcuts"
				style="width: 240px; margin-right: 12px"
			/>
			<el-input
				:disabled="repairSaving || repairLoading"
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
			v-model="waterMeterDialog"
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
					@keyup.enter="waterMeterSearch()"
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
			v-model="wallInfoDialog"
		>
		</el-dialog>
	</div>
</template>

<script lang="ts">
import { repairDateOptions } from "./date-options";

import { defineComponent } from "vue";

import dayjs from "dayjs";

import { nanoid } from "nanoid";

import { utils, writeFileXLSX } from "xlsx";

import Title from "../../components/title.vue";

import { calibers, wellChamberTypes } from "./info";

import { elOptionArray, objectArray, repairInfoArray } from "./types";
export default defineComponent({
	name: "SearchValueWell",
	components: {
		Title,
	},
	data() {
		return {
			pickerOptions: repairDateOptions(),
			searchTextBy: "filledBy" as string,
			searchText: "" as string,
			waterMeterInfoSearchBy: "accountNumber" as string,
			waterMeterInfoSearchText: "" as string,
			searchSelectBy: {
				caliber: [] as string[], // 口径
				wellChamberType: [] as string[], // 井室类型
				streetName: "" as string, // 街道，
				manufactor: [] as string[], // 厂家
			},
			options: [
				{
					value: "filledBy",
					label: "填写人",
				},
				{
					value: "accountIdentifier",
					label: "编号",
				},
			] as objectArray,
			waterMeterInfoSearchOptions: [
				{ value: "paymentNumber", label: "缴费号" },
				{ value: "accountNumber", label: "户号" },
				{ value: "accountName", label: "户名" },
			] as elOptionArray,
			calibers: calibers as elOptionArray,
			wellChamberTypes: wellChamberTypes as elOptionArray,
			searchRes: [] as objectArray,
			displayRes: [] as objectArray,
			formLabelWidth: "120px",
			exportLoading: false,
			searchLoading: false,
			tableLoading: false,
			repairDialog: false,
			repairId: 0,
			repairInfo: [] as repairInfoArray,
			addRepairText: "",
			addRepairTime: "",
			addRepairRemarks: "",
			waterMeterDialog: false,
			waterMeterDialogId: 0,
			waterMeterInfoArr: [],
			waterMeterForm: {
				paymentNumber: "", //缴费号
				accountNumber: "", //户号
				accountName: "", //户名
				nature: "", //状态
			},
			wallInfoDialog: false,
			wallInfoId: 0,
			pageSize: 30,
			currentPage: 1,
			repairSaving: false,
			repairLoading: false,
			repairRequestId: nanoid(),
		};
	},
	computed: {
		total(): number {
			return this.displayRes.length;
		},
		updateRepairDisabled(): boolean {
			return (
				this.repairSaving ||
				this.repairLoading ||
				this.addRepairText === "" ||
				this.addRepairTime === ""
			);
		},
		insertWaterMeterInfoDisabled(): boolean {
			return (
				this.waterMeterForm.paymentNumber === "" ||
				this.waterMeterForm.accountNumber === "" ||
				this.waterMeterForm.accountName === "" ||
				this.waterMeterForm.nature === ""
			);
		},
	},
	methods: {
		handleSizeChange(val: number): void {
			this.pageSize = val;
		},
		handleCurrentChange(val: number): void {
			this.currentPage = val;
		},
		async search(): Promise<void> {
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
		},
		waterMeterSearch() {
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
		},
		exportExcel(): void {
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
				const streetName = this.searchSelectBy.streetName
					? this.searchSelectBy.streetName
					: "";
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
		},
		async getRes(): Promise<void> {
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
		},
		async clearRes(): Promise<void> {
			this.searchRes = [];
			this.searchText = "";
			await this.getRes();
		},
		modify(info: any): void {
			void info;
		},
		async updateRepair(): Promise<void> {
			if (
				this.repairSaving ||
				this.repairLoading ||
				!this.addRepairText.trim() ||
				!this.addRepairTime
			)
				return;
			this.repairSaving = true;
			const original = Array.isArray(this.repairInfo) ? this.repairInfo : [];
			try {
				const res = await this.axios.post("ValueWell/updateValueWellRepairInfoWithId", {
					id: this.repairId,
					requestId: this.repairRequestId,
					expectedInfo: JSON.stringify(original),
					repairInfo: JSON.stringify([
						...original,
						{
							text: this.addRepairText,
							repairTime: this.addRepairTime,
							remarks: this.addRepairRemarks,
						},
					]),
				});
				if (res.data.code !== 0) throw new Error(res.data.msg);
				this.addRepairText = "";
				this.addRepairTime = "";
				this.addRepairRemarks = "";
				this.repairRequestId = nanoid();
				await this.getRepair(this.repairId);
				this.$message.success("维修记录已保存");
			} catch (error) {
				this.$message.error("未保存，请核对提示后重试");
			} finally {
				this.repairSaving = false;
			}
		},
		async openRepair(id: number): Promise<void> {
			if (this.repairSaving || this.repairLoading) return;
			if (
				this.addRepairText &&
				id !== this.repairId &&
				!window.confirm("切换设施会清除未保存的维修内容，继续？")
			)
				return;
			if (id !== this.repairId) {
				this.addRepairText = "";
				this.addRepairTime = "";
				this.addRepairRemarks = "";
				this.repairRequestId = nanoid();
			}
			this.repairLoading = true;
			this.repairInfo = [];
			this.repairDialog = true;
			this.repairId = id;
			try {
				await this.getRepair(id);
			} catch {
				this.repairDialog = false;
			} finally {
				this.repairLoading = false;
			}
		},
		async getRepair(id: number): Promise<void> {
			const res = await this["axios"].get(`ValueWell/getValueWellRepairInfoById`, {
				params: {
					id: id,
				},
			});
			this.$message.success(res.data.msg);
			if (res.data.data === null || res.data.data === undefined || res.data.data === "") {
				this.repairInfo = [];
			} else {
				const raw = res.data.data;
				try {
					const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
					this.repairInfo = Array.isArray(parsed) ? parsed : [];
				} catch {
					this.$message.error("维修记录格式错误");
					throw new Error("Invalid repair record");
				}
			}
		},
		async openWaterMeter(id: number): Promise<void> {
			this.waterMeterDialog = true;
			this.waterMeterDialogId = id;
			await this.getWaterMeterInfoById(id);
		},
		async getWaterMeterInfoById(wallId: number): Promise<void> {
			const res = await this["axios"].get(`ValueWell/getValueWellWaterMeterInfoByWallId`, {
				params: {
					wallId: wallId,
				},
			});

			this.$message.success(res.data.msg);
			this.waterMeterInfoArr = res.data.data;
		},
		async insertWaterMeterInfo(): Promise<void> {
			await this.sendWaterMeterInfo(this.waterMeterForm);
		},
		async sendWaterMeterInfo(waterMeterForm: {
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
		},
		async deleteWaterMeter(waterMeterId: string): Promise<void> {
			const confirmation = await this.$prompt("停用原因", "停用水表", {
				inputPattern: /\S+/,
				inputErrorMessage: "请填写原因",
			}).catch(() => null);
			if (!confirmation) return;
			const res = await this.axios.post("ValueWell/deleteWaterMeterInfoById", {
				waterMeterId,
				wallId: this.waterMeterDialogId,
				reason: confirmation.value,
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
		},
	},
	async mounted(): Promise<void> {
		await this.getRes();
	},
});
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
