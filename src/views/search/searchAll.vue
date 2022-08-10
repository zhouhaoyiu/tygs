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
    <el-table
      :data="displayRes"
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
        prop="accountName"
        width="150px"
        label="户名"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="accountNumber"
        width="150px"
        label="户号"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="coordinates"
        width="250px"
        label="坐标"
      >
      </el-table-column>
      <el-table-column align="center" prop="caliber" width="100px" label="口径">
      </el-table-column>
      <el-table-column
        align="center"
        width="150px"
        prop="operatingStatus"
        label="运行状态"
      >
      </el-table-column>
      <el-table-column
        align="center"
        width="150px"
        prop="waterNature"
        label="用水性质"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="wellDepth"
        width="150px"
        label="井深"
      >
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
      <el-table-column
        align="center"
        prop="accountIdentifier"
        width="150px"
        label="编号"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="writtingTime"
        width="150px"
        label="填写时间"
      >
      </el-table-column>
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
    <el-dialog title="维修记录" :visible.sync="repairDialog">
      {{ repairInfo }}
      <el-input v-model="addRepairText" />
      <el-button @click="updateRepair()">添加</el-button>
    </el-dialog>
    <el-dialog title="水表信息" :visible.sync="waterMeterDialog">
      <!-- {{ waterMeterInfo }}  -->
      <div
        v-for="waterMeterInfoText in waterMeterInfo"
        :key="waterMeterInfoText"
      >
        {{ waterMeterInfoText }}
      </div>
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
          placeholder="状态"
        >
        </el-input>
        <el-button type="primary" @click="updateWaterMeter()">
          新增水表信息
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { SET_INFO } from "@/store/type/mutation-type";
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";
@Component({
  components: {
    Title,
  },
})
export default class SearchAll extends Vue {
  public searchBy = "filledBy";
  public searchText = "";
  public searchRes: Record<string, string>[] = [
    // {
    //   AccountName: "",
    //   FilledBy: "",
    // },
  ];

  public formLabelWidth = "120px";

  public displayRes: Record<string, string>[] = [
    // {
    //   AccountName: "",
    //   FilledBy: "",
    // },
  ];

  public res = [];

  public repairDialog = false;
  public repairId = 0;
  public repairInfo = "";
  public addRepairText = ""; // 新增的维修记录

  public waterMeterDialog = false;
  public waterMeterId = 0;
  public waterMeterInfo = "";
  public waterMeterForm = {
    paymentNumber: "", //缴费号
    accountNumber: "", //户号
    accountName: "", //户名
    status: "", //状态
  };

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
    const res = await this["axios"].get("/Tygs/getAllInfo");
    this.res = res.data;
    this.$store.commit(SET_INFO, res.data);
    this.searchRes = res.data.sort(
      (a: { filledBy: string }, b: { filledBy: string }) => {
        return a.filledBy.localeCompare(b.filledBy);
      }
    );
    // 结果前100条
    this.displayRes = this.searchRes.slice(0, 100);
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
    if (this.repairInfo === "") {
      repairInfo = [];
      repairInfo.push({
        text: this.addRepairText,
        time: new Date().toLocaleString(),
      });
    } else {
      // console.log(this.repairInfo);
      const repairInfoArr =
        (this.repairInfo as any) instanceof Array
          ? this.repairInfo
          : JSON.parse(this.repairInfo);
      repairInfoArr.push({
        text: this.addRepairText,
        time: new Date().toLocaleString(),
      });
      // console.log(repairInfoArr);
    }
    const res = await this["axios"].post(`Tygs/updateRepairInfo`, {
      id: this.repairId,
      repairInfo: JSON.stringify(repairInfo),
    });
    // console.log(res);
    if (res.data.code === 0) {
      this.addRepairText = "";
    }
  }

  public async openRepair(id: number): Promise<void> {
    this.repairDialog = true;
    this.repairId = id;
    await this.getRepair(id);
  }

  public async getRepair(id: number): Promise<void> {
    const res = await this["axios"].get(`Tygs/getRepairInfoById`, {
      params: {
        id: id,
      },
    });
    this.$message.success(res.data.msg);
    this.repairInfo = res.data.data;
  }

  public async openWaterMeter(id: number): Promise<void> {
    this.waterMeterDialog = true;
    this.waterMeterId = id;
    const res = await this["axios"].get(`Tygs/getWaterMeterById`, {
      params: {
        id: id,
      },
    });
    console.log(res);
    this.$message.success(res.data.msg);
    this.waterMeterInfo = res.data.data;
  }

  public async updateWaterMeter(): Promise<void> {
    let waterMeterInfo: string | Record<string, string>[] = this.waterMeterInfo;
    console.log(waterMeterInfo);
    if (this.waterMeterInfo === "") {
      console.log(222);
      waterMeterInfo = [];
      waterMeterInfo.push({
        ...this.waterMeterForm,
        time: new Date().toLocaleString(),
      });
      console.log(waterMeterInfo);
    } else {
      console.log(222);
      // console.log(this.repairInfo);
      const waterMeterInfoArr =
        (this.waterMeterInfo as any) instanceof Array
          ? this.waterMeterInfo
          : JSON.parse(this.waterMeterInfo);
      waterMeterInfoArr.push({
        ...this.waterMeterForm,
        time: new Date().toLocaleString(),
      });
    }

    // console.log(repairInfoArr);
    const res = await this["axios"].post(`Tygs/updateWaterMeterInfo`, {
      id: this.waterMeterId,
      waterMeterInfo: JSON.stringify(waterMeterInfo),
    });

    console.log(res);
    if (res.data.code === 0) {
      this.waterMeterForm = {
        paymentNumber: "", //缴费号
        accountNumber: "", //户号
        accountName: "", //户名
        status: "", //状态
      };
    }
  }
}
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
  }
  .dialogInput {
    width: 20%;
    // margin: 10px;
  }
}
</style>
