<template>
  <div class="page">
    <Title>查询 水表间(户表)</Title>
    <!-- <div class="searchArea">
      <div class="searchSelects">
        <span>户号: </span>
        <el-select v-model="searchSelectBy.caliber" class="searchSelect">
          <el-option
            v-for="item in calibers"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <span>名称: </span>
        <el-select class="searchSelect">
          <el-option
            v-for="item in calibers"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <span>地址: </span>
        <el-select class="searchSelect">
          <el-option
            v-for="item in calibers"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <span>口径: </span>
        <el-select class="searchSelect">
          <el-option
            v-for="item in calibers"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div class="searchInput">
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
          @keyup.enter.native="searchFilled()"
          style="width: 400px"
          v-model="searchText"
          clearable
          placeholder="请输入搜索字段"
        >
        </el-input>
        <el-button
          @click="searchFilled()"
          style="margin-left: 30px"
          type="primary"
        >
          搜索
        </el-button>
        <el-button @click="clearRes()" style="margin-left: 15px">
          重置
        </el-button>
      </div>
    </div> -->
    <el-table
      :data="
        displayRes.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      "
      max-height="550px"
      style="margin-top: 20px; width: 1600px"
    >
      <el-table-column
        align="center"
        prop="filledBy"
        width="120px"
        label="填写人"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="department"
        width="150px"
        label="所在部门"
      >
      </el-table-column>

      <el-table-column
        align="center"
        prop="userType"
        width="150px"
        label="用户类型"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="accountIdentifier"
        width="150px"
        label="编号"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="communityName"
        width="250px"
        label="小区名称"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="detailedAddress"
        width="100px"
        label="详细地址"
      >
      </el-table-column>
      <el-table-column
        align="center"
        width="265px"
        prop="location"
        label="位置"
      >
      </el-table-column>
      <el-table-column
        align="center"
        width="150px"
        prop="watermeterLocation"
        label="水表位置"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="watermeterType"
        width="150px"
        label="水表类型"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="totalHouseholds"
        width="150px"
        label="总户数"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="numberHouseholds"
        label="居民户数"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="numberNoHouseholds"
        width="150px"
        label="非居民户数"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="numberHouseholdsWithSubitems"
        width="150px"
        label="带分项户数"
      >
      </el-table-column>
      <el-table-column align="center" prop="pipe" width="150px" label="管材">
      </el-table-column>
      <el-table-column
        align="center"
        prop="conditionOfWaterSeparator"
        width="150px"
        label="分水器情况"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="troubleshooting"
        width="150px"
        label="排查情况"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="personLiable"
        width="150px"
        label="排查情况"
      >
      </el-table-column>
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
          <div
            style="display: flex; justify-content: center; align-items: center"
          >
            <!-- <el-button size="small" @click="modify(scope.row)" type="primary">
              修改信息
            </el-button> -->
            <el-button size="small" @click="openWaterMeter(scope.row.id)">
              水表信息
            </el-button>
            <el-button
              size="small"
              @click="openRepair(scope.row.id)"
              type="primary"
            >
              维修记录
            </el-button>
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
    <el-dialog title="维修记录" :visible.sync="repairDialog">
      {{ repairInfo }}
      <el-input v-model="addRepairText" />
      <el-button @click="updateRepair()">添加</el-button>
    </el-dialog>
    <el-dialog center title="水表信息" :visible.sync="waterMeterDialog">
      <!-- {{ waterMeterInfo }}  -->
      <!-- <div
        v-for="waterMeterInfoText in waterMeterInfoArr"
        :key="waterMeterInfoText.id"
      >
        {{ waterMeterInfoText }}
        <el-button
          @click="deleteWaterMeter(waterMeterInfoText.id)"
          type="danger"
          size="mini"
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
        <el-table-column align="center" prop="accountName" label="户名">
        </el-table-column>
        <el-table-column align="center" prop="status" label="用水性质">
        </el-table-column>
        <el-table-column
          align="center"
          label="操作"
          width="100px"
          fixed="right"
        >
          <template v-slot="scope">
            <div
              style="
                display: flex;
                justify-content: center;
                align-items: center;
              "
            >
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
        <el-button type="primary" @click="insertWaterMeterInfo()">
          新增水表信息
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { SET_INFO } from "@/store/type/mutation-type";
import _ from "lodash";
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
@Component({
  components: {
    Title,
  },
})
export default class SearchAll extends Vue {
  public searchBy = "filledBy";
  public searchText = "";
  public searchRes: Record<string, string>[] = [];

  public formLabelWidth = "120px";

  public displayRes: Record<string, string>[] = [];

  public res = [];

  public repairDialog = false;
  public repairId = 0;
  public repairInfo = "";
  public addRepairText = ""; // 新增的维修记录

  public waterMeterDialog = false;
  public waterMeterDialogId = 0;
  public waterMeterInfoArr = [];
  public waterMeterForm = {
    paymentNumber: "", //缴费号
    accountNumber: "", //户号
    accountName: "", //户名
    status: "", //状态
  };

  public wallInfoDialog = false;
  public wallInfoId = 0;

  public handleSizeChange(val: number) {
    this.pageSize = val;
    console.log(`每页 ${val} 条`);
  }
  public handleCurrentChange(val: number) {
    this.currentPage = val;
  }
  public pageSize = 30;
  public currentPage = 1;

  // 计算属性获取displayRes的长度
  get total(): number {
    return this.displayRes.length;
  }

  public searchFilled() {
    this.displayRes = this.res.filter((item) => {
      if (item) {
        // return item[this.searchBy] === this.searchText;
        // 匹配搜索字段
        return (item[this.searchBy] as string).indexOf(this.searchText) > -1;
      }
    });
  }

  public options: Record<string, string>[] = [
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
  ];

  public async mounted(): Promise<void> {
    console.log("homeIndex mounted");
    await this.getRes();
  }

  public async getRes(): Promise<void> {
    const res = await this["axios"].get(
      "/WaterMeterRoom/getAllWaterMeterRoomInfo"
    );
    this.res = res.data;
    this.searchRes = res.data;
    // .sort(
    //   (a: { filledBy: string }, b: { filledBy: string }) => {
    //     return a.filledBy.localeCompare(b.filledBy);
    //   }
    // );

    this.displayRes = this.searchRes;
    // .slice(0, 30);
  }

  public async clearRes(): Promise<void> {
    this.searchRes = [];
    this.searchText = "";
    await this.getRes();
  }

  public modify(FilledBy: any): void {
    console.log(FilledBy);
  }

  public seeDetail(FilledBy: any): void {
    console.log(1);
    console.log(2);
  }

  public async updateRepair(): Promise<void> {
    let repairInfo: string | Record<string, string>[] = this.repairInfo;
    if (
      this.repairInfo === "" ||
      this.repairInfo === null ||
      this.repairInfo === undefined
    ) {
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
    const res = await this["axios"].post(
      `WaterMeterRoom/updateWaterMeterRoomRepairInfoWithId`,
      {
        id: this.repairId,
        repairInfo: JSON.stringify(repairInfo),
      }
    );
    // console.log(res);
    if (res.data.code === 0) {
      this.$message.success(res.data.msg);
      this.addRepairText = "";
    }
    await this.getRepair(this.repairId);
  }

  public async openRepair(id: number): Promise<void> {
    this.repairDialog = true;
    this.repairId = id;
    await this.getRepair(id);
  }

  public async getRepair(id: number): Promise<void> {
    const res = await this["axios"].get(
      `WaterMeterRoom/getWaterMeterRoomRepairInfoById`,
      {
        params: {
          id: id,
        },
      }
    );
    this.$message.success(res.data.msg);
    this.repairInfo = res.data.data;
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
      }
    );
    console.log(res);
    this.$message.success(res.data.msg);
    this.waterMeterInfoArr = res.data.data;
  }

  // 更新水表信息
  public async insertWaterMeterInfo(): Promise<void> {
    this.sendWaterMeterInfo(this.waterMeterForm);
  }

  public async sendWaterMeterInfo(waterMeterForm: {
    paymentNumber: string; //缴费号
    accountNumber: string; //户号
    accountName: string; //户名
    status: string;
  }): Promise<void> {
    // console.log(repairInfoArr);
    const res = await this["axios"].post(
      `WaterMeterRoom/insertWaterMeterRoomWaterMeterInfo`,
      {
        wallId: this.waterMeterDialogId,
        waterMeterId: nanoid(),
        updateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        ...waterMeterForm,
      }
    );

    console.log(res);
    if (res.data.code === 0) {
      this.waterMeterForm = {
        paymentNumber: "", //缴费号
        accountNumber: "", //户号
        accountName: "", //户名
        status: "", //状态
      };
      await this.getWaterMeterInfoById(this.waterMeterDialogId);
    }
  }

  public async deleteWaterMeter(waterMeterId: string): Promise<void> {
    // console.log(this.waterMeterInfo);
    // 从this.waterMeterInfoArr中删除waterMeterId对应的数据
    this.waterMeterInfoArr = this.waterMeterInfoArr.filter(
      (item: { id: string }) => {
        return item.id !== waterMeterId;
      }
    );
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
