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
					:loading="facilityQuery.loading"
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
		<p v-if="facilityQuery.error" class="facility-error" role="alert">
			{{ facilityQuery.error }}
			<el-button icon="Refresh" size="small" @click="getRes">重试</el-button>
		</p>
		<el-table
			border
			stripe
			v-loading="facilityQuery.loading"
			:data="facilityQuery.rows"
			max-height="580px"
			class="table"
		>
			<el-table-column align="center" prop="filledBy" width="100px" label="填写人">
			</el-table-column>

			<el-table-column align="center" prop="accountIdentifier" width="130px" label="编号">
			</el-table-column>
			<el-table-column align="center" prop="streetName" min-width="180" label="街道名称">
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
			:current-page="facilityQuery.page"
			:page-size="facilityQuery.size"
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
			{{ repairInfo }}
			<el-input :disabled="repairSaving || repairLoading" v-model="addRepairText" />
			<el-button @click="updateRepair()">添加</el-button>
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
	</div>
</template>

<script lang="ts">
import { repairDateOptions } from "./date-options";

import { defineComponent, reactive } from "vue";
import { useFacilityQuery } from "@/lib/facility-query";

interface FireHydrant {}

import dayjs from "dayjs";

import { nanoid } from "nanoid";

import Title from "../../components/title.vue";

import { calibers } from "./info";

import { elOptionArray, objectArray, repairInfoArray } from "./types";
export default defineComponent({
	setup() {
		return { facilityQuery: reactive(useFacilityQuery("hydrants")) };
	},
	name: "SearchAll",
	components: {
		Title,
	},
	data() {
		return {
			pickerOptions: repairDateOptions(),
			searchTextBy: "streetName",
			searchText: "",
			searchSelectBy: {
				streetName: "" as string, // 街道名称
				manufactor: "" as string, // 水表厂家
				caliber: [] as string[], // 口径
			},
			waterMeterInfoSearchBy: "accountNumber" as string,
			waterMeterInfoSearchText: "" as string,
			options: [
				{ value: "streetName", label: "街道名称" },
				{ value: "manufactor", label: "厂家" },
				// { value: "detailedAddress", label: "详细地址" },
			] as elOptionArray,
			waterMeterInfoSearchOptions: [
				{ value: "paymentNumber", label: "缴费号" },
				{ value: "accountNumber", label: "户号" },
				{ value: "accountName", label: "户名" },
			] as elOptionArray,
			calibers: calibers as elOptionArray,
			formLabelWidth: "120px",
			exportLoading: false,
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
			repairSaving: false,
			repairLoading: false,
			repairRequestId: nanoid(),
		};
	},
	computed: {
		total(): number {
			return this.facilityQuery.total;
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
			void this.facilityQuery.changeSize(val);
		},
		handleCurrentChange(val: number): void {
			void this.facilityQuery.changePage(val);
		},
		async search(): Promise<void> {
			await this.facilityQuery.search({ ...this.searchSelectBy });
		},
		waterMeterSearch(): void {
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
		},
		modify(info: any): void {
			void info;
		},
		async getRes(): Promise<void> {
			await this.facilityQuery.load();
		},
		async clearRes(): Promise<void> {
			this.searchText = "";
			this.searchSelectBy = { streetName: "", manufactor: "", caliber: [] };
			await this.facilityQuery.search();
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
				const res = await this.axios.post("FireHydrant/updateFireHydrantRepairInfoWithId", {
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
			const res = await this["axios"].get(`FireHydrant/getFireHydrantRepairInfoById`, {
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
		deleteWell(id: number): void {
			void id;
		},
		async getWaterMeterInfoById(wallId: number): Promise<void> {
			const res = await this["axios"].get(
				`FireHydrant/getFireHydrantWaterMeterInfoByWallId`,
				{
					params: {
						wallId: wallId,
					},
				},
			);

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
		},
		async deleteWaterMeter(waterMeterId: string): Promise<void> {
			const confirmation = await this.$prompt("停用原因", "停用水表", {
				inputPattern: /\S+/,
				inputErrorMessage: "请填写原因",
			}).catch(() => null);
			if (!confirmation) return;
			const res = await this.axios.post("FireHydrant/deleteWaterMeterInfoById", {
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
		width: 100%;
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
