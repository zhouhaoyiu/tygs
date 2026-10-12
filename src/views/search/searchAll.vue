<template>
	<div class="page">
		<Title>查询 全部</Title>
		<div>
			<div>
				<el-select v-model="searchBy" style="margin-right: 15px">
					<el-option
						v-for="item in options"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					>
					</el-option>
				</el-select>
				<el-input
					@keyup.enter="searchFilled()"
					style="width: 400px"
					v-model="searchText"
					clearable
					placeholder="请输入搜索字段"
				>
				</el-input>
				<el-button @click="searchFilled()" style="margin-left: 30px" type="primary">
					搜索
				</el-button>
				<el-button @click="clearRes()" style="margin-left: 15px"> 重置 </el-button>
			</div>
			<!-- <div>
        <el-select>
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-select>
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-select>
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div> -->
		</div>
		<!-- <div v-for="(people, peopleIndex) in searchRes" :key="peopleIndex">
      {{ people.FilledBy }}
    </div> -->
		<el-table :data="displayRes" max-height="550px" style="margin-top: 20px; width: 1600px">
			<el-table-column align="center" prop="filledBy" width="120px" label="填写人">
			</el-table-column>
			<el-table-column align="center" prop="department" width="150px" label="所在部门">
			</el-table-column>

			<el-table-column align="center" prop="accountName" width="150px" label="户名">
			</el-table-column>
			<el-table-column align="center" prop="accountNumber" width="150px" label="户号">
			</el-table-column>
			<el-table-column align="center" prop="coordinates" width="250px" label="坐标">
			</el-table-column>
			<el-table-column align="center" prop="caliber" width="100px" label="口径">
			</el-table-column>
			<el-table-column align="center" width="150px" prop="operatingStatus" label="运行状态">
			</el-table-column>
			<el-table-column align="center" width="150px" prop="waterNature" label="用水性质">
			</el-table-column>
			<el-table-column align="center" prop="wellDepth" width="150px" label="井深">
			</el-table-column>
			<el-table-column
				align="center"
				prop="includedFacilities"
				width="150px"
				label="内含设施"
			>
			</el-table-column>
			<el-table-column
				align="center"
				prop="waterMeterManufacturer"
				label="水表厂家"
				width="150px"
			>
			</el-table-column>
			<el-table-column align="center" prop="accountIdentifier" width="150px" label="编号">
			</el-table-column>
			<el-table-column align="center" prop="writtingTime" width="150px" label="填写时间">
			</el-table-column>
			<el-table-column align="center" label="操作" width="200px" fixed="right">
				<template v-slot="scope">
					<div style="display: flex; justify-content: center; align-items: center">
						<!-- <el-button size="small" @click="modify(scope.row)" type="primary">
              修改信息
            </el-button> -->
						<el-button size="small" @click="openWaterMeter(scope.row.id)">
							水表信息
						</el-button>
						<el-button size="small" @click="openRepair(scope.row.id)" type="primary">
							维修记录
						</el-button>
						<!-- <el-button @click="seeDetail(scope.row)" type=""> 查看 </el-button> -->
					</div>
				</template>
			</el-table-column>
		</el-table>
		<el-dialog title="维修记录" v-model="repairDialog">
			{{ repairInfo }}
			<el-input v-model="addRepairText" />
			<el-button @click="updateRepair()">添加</el-button>
		</el-dialog>
		<el-dialog center title="水表信息" v-model="waterMeterDialog">
			<!-- {{ waterMeterInfo }}  -->
			<!-- <div
        v-for="waterMeterInfoText in waterMeterInfoArr"
        :key="waterMeterInfoText.id"
      >
        {{ waterMeterInfoText }}
        <el-button
          @click="deleteWaterMeter(waterMeterInfoText.id)"
          type="danger"
          size="small"
        >
          删除
        </el-button>
      </div> -->
			<el-table
				:data="waterMeterInfoArr"
				max-height="400px"
				style="margin-top: 20px; width: 1200px"
			>
				<!-- <el-table-column align="center" prop="id" label="id">
        </el-table-column> -->
				<el-table-column align="center" prop="paymentNumber" label="缴费号">
				</el-table-column>
				<el-table-column align="center" prop="accountNumber" label="户号">
				</el-table-column>
				<el-table-column align="center" prop="accountName" label="户名"> </el-table-column>
				<el-table-column align="center" prop="status" label="用水性质"> </el-table-column>
				<el-table-column align="center" label="操作" width="100px" fixed="right">
					<template v-slot="scope">
						<div style="display: flex; justify-content: center; align-items: center">
							<el-button type="danger" @click="deleteWaterMeter(scope.row.id)">
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
					v-model="waterMeterForm.status"
					placeholder="用水性质"
				>
				</el-input>
				<el-button type="primary" @click="insertWaterMeterInfo()"> 新增水表信息 </el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { SET_INFO } from "@/store/type/mutation-type";

import _ from "lodash";

import Title from "../../components/title.vue";

import { nanoid } from "nanoid";

import dayjs from "dayjs";
export default defineComponent({
	name: "SearchAll",
	components: {
		Title,
	},
	data() {
		return {
			searchBy: "filledBy",
			searchText: "",
			searchRes: [
				// {
				//   AccountName: "",
				//   FilledBy: "",
				// },
			] as Record<string, string>[],
			formLabelWidth: "120px",
			displayRes: [
				// {
				//   AccountName: "",
				//   FilledBy: "",
				// },
			] as Record<string, string>[],
			res: [],
			repairDialog: false,
			repairId: 0,
			repairInfo: "",
			addRepairText: "",
			waterMeterDialog: false,
			waterMeterDialogId: 0,
			waterMeterInfoArr: [],
			waterMeterForm: {
				paymentNumber: "", //缴费号
				accountNumber: "", //户号
				accountName: "", //户名
				status: "", //状态
			},
			options: [
				{
					value: "filledBy",
					label: "填写人",
				},
				{
					value: "department",
					label: "所在部门",
				},
				{
					value: "accountIdentifier",
					label: "编号",
				},
				{
					value: "caliber",
					label: "口径",
				},
				{
					value: "waterNature",
					label: "用水性质",
				},
			] as Record<string, string>[],
		};
	},
	computed: {},
	methods: {
		searchFilled() {
			this.displayRes = this.res.filter((item) => {
				if (item) {
					// return item[this.searchBy] === this.searchText;
					// 匹配搜索字段
					return (item[this.searchBy] as string).indexOf(this.searchText) > -1;
				}
			});
		},
		async getRes(): Promise<void> {
			const res = await this["axios"].get("/Tygs/getAllInfo");
			this.res = res.data;
			this.$store.commit(SET_INFO, res.data);
			this.searchRes = res.data.sort((a: { filledBy: string }, b: { filledBy: string }) => {
				return a.filledBy.localeCompare(b.filledBy);
			});
			// 结果前100条
			this.displayRes = this.searchRes.slice(0, 100);
		},
		async clearRes(): Promise<void> {
			this.searchRes = [];
			this.searchText = "";
			await this.getRes();
		},
		async updateRepair(): Promise<void> {
			let repairInfo: string | Record<string, string>[] = this.repairInfo;
			if (this.repairInfo === "") {
				repairInfo = [];
				repairInfo.push({
					text: this.addRepairText,
					time: new Date().toLocaleString(),
				});
			} else {
				const repairInfoArr =
					(this.repairInfo as any) instanceof Array
						? this.repairInfo
						: JSON.parse(this.repairInfo);
				repairInfoArr.push({
					text: this.addRepairText,
					time: new Date().toLocaleString(),
				});
			}
			const res = await this["axios"].post(`Tygs/updateRepairInfo`, {
				id: this.repairId,
				repairInfo: JSON.stringify(repairInfo),
			});

			if (res.data.code === 0) {
				this.addRepairText = "";
			}
		},
		async openRepair(id: number): Promise<void> {
			this.repairDialog = true;
			this.repairId = id;
			await this.getRepair(id);
		},
		async getRepair(id: number): Promise<void> {
			const res = await this["axios"].get(`Tygs/getRepairInfoById`, {
				params: {
					id: id,
				},
			});
			this.$message.success(res.data.msg);
			this.repairInfo = res.data.data;
		},
		async openWaterMeter(id: number): Promise<void> {
			this.waterMeterDialog = true;
			this.waterMeterDialogId = id;
			await this.getWaterMeterInfoById(id);
		},
		async getWaterMeterInfoById(wallId: number): Promise<void> {
			const res = await this["axios"].get(`Tygs/getWaterMeterByWallId`, {
				params: {
					wallId: wallId,
				},
			});

			this.$message.success(res.data.msg);
			this.waterMeterInfoArr = res.data.data;
		},
		async insertWaterMeterInfo(): Promise<void> {
			this.sendWaterMeterInfo(this.waterMeterForm);
		},
		async sendWaterMeterInfo(waterMeterForm: {
			paymentNumber: string; //缴费号
			accountNumber: string; //户号
			accountName: string; //户名
			status: string;
		}): Promise<void> {
			const res = await this["axios"].post(`Tygs/insertWaterMeterInfo`, {
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
					status: "", //状态
				};
				await this.getWaterMeterInfoById(this.waterMeterDialogId);
			}
		},
		async deleteWaterMeter(waterMeterId: string): Promise<void> {
			// 从this.waterMeterInfoArr中删除waterMeterId对应的数据
			this.waterMeterInfoArr = this.waterMeterInfoArr.filter((item: { id: string }) => {
				return item.id !== waterMeterId;
			});
		},
	},
	async mounted(): Promise<void> {
		await this.getRes();
	},
});
</script>

<style lang="scss">
.page {
	.name {
		font-size: 48px;
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
