<template>
  <div class="page">
    <Title>查询 表井</Title>
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
      <el-select>
        <el-option
          v-for="item in calibers"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
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
    <el-dialog center title="表井信息" :visible.sync="wallInfoDialog">
      <div>
        <div style="display: flex">
          填写人<el-input v-model="wallInfoForm.filledBy"></el-input>
        </div>
        <el-input></el-input>
        <el-input></el-input>
        <el-input></el-input>
        <el-input></el-input>
        <el-input></el-input>
        <el-input></el-input>
        <el-input></el-input>
        <el-input></el-input>
        <el-input></el-input>
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

  public wallInfoForm = {};

  public calibers: { value: string; label: string }[] = [
    {
      value: "DN15",
      label: "DN15",
    },
    {
      value: "DN20",
      label: "DN20",
    },
    {
      value: "DN25",
      label: "DN25",
    },
    {
      value: "DN40",
      label: "DN40",
    },
    {
      value: "DN50",
      label: "DN50",
    },
    {
      value: "DN80",
      label: "DN80",
    },
    {
      value: "DN100",
      label: "DN100",
    },
    {
      value: "DN150",
      label: "DN150",
    },
    {
      value: "DN200",
      label: "DN200",
    },
    {
      value: "DN300",
      label: "DN300",
    },
  ];

  public searchFilled() {
    console.log(this.searchBy);
    this.displayRes = this.res.filter((item) => {
      if (item) {
        // console.log(item);
        // return item[this.searchBy] === this.searchText;
        // 匹配搜索字段
        if (typeof item[this.searchBy] === "string") {
          return (item[this.searchBy] as string).indexOf(this.searchText) > -1;
        } else if (typeof item[this.searchBy] === "number") {
          // 如果是id，则判断是否相等
          return item[this.searchBy] == this.searchText;
        } else {
          throw new Error("not string or number");
        }
      }
    });
  }

  public options: Record<string, string>[] = [
    {
      value: "id",
      label: "id",
    },
    {
      value: "filledBy",
      label: "填写人",
    },
    {
      value: "accountNumber",
      label: "户号",
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
      "/Watermeterwell/getAllWatermeterwellInfo"
    );
    this.res = res.data;
    this.searchRes = res.data;

    // this.$store.commit(SET_INFO, res.data);
    // let calibers = new Set() as any;
    // this.searchRes.forEach((item) => {
    //   console.log(item);
    //   calibers.add(item.caliber);
    // });
    // calibers.forEach((caliber: any) => {
    //   this.calibers.push({ value: caliber, label: caliber });
    // });
    // console.log(calibers);

    // .sort(
    //   (a: { filledBy: string }, b: { filledBy: string }) => {
    //     return a.filledBy.localeCompare(b.filledBy);
    //   }
    // );
    // 结果前100条
    this.displayRes = this.searchRes.slice(0, 100);
  }

  public async clearRes(): Promise<void> {
    this.searchRes = [];
    this.searchText = "";
    await this.getRes();
  }

  public modify(info: any): void {
    console.log(info);
    this.wallInfoDialog = true;
    this.wallInfoId = info.id;
    this.wallInfoForm = _.cloneDeep(info);
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
    const res = await this["axios"].post(
      `Watermeterwell/updateWatermeterwellRepairInfoWithId`,
      {
        id: this.repairId,
        repairInfo: JSON.stringify(repairInfo),
      }
    );
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
    const res = await this["axios"].get(
      `Watermeterwell/getWatermeterwellRepairInfoById`,
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
      `Watermeterwell/getWatermeterwellWaterMeterInfoByWallId`,
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
      `Watermeterwell/insertWatermeterwellWaterMeterInfo`,
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
