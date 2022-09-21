<template>
  <div class="page">
    <Title>查询 表井</Title>
    <!-- <div>编号</div>
    <div>户号</div>
    <div>街道地址</div> -->
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
      border
      stripe
      v-loading="tableLoading"
      :data="displayRes.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
      max-height="495px"
      class="table"
    >
      <el-table-column align="center" prop="filledBy" width="100px" label="填写人">
      </el-table-column>
      <el-table-column align="center" prop="accountName" width="150px" label="户名">
      </el-table-column>
      <el-table-column align="center" prop="accountNumber" width="150px" label="户号">
      </el-table-column>
      <el-table-column align="center" prop="coordinates" width="250px" label="坐标">
      </el-table-column>
      <el-table-column align="center" prop="caliber" width="100px" label="口径"> </el-table-column>
      <el-table-column align="center" width="150px" prop="operatingStatus" label="运行状态">
      </el-table-column>
      <el-table-column align="center" width="150px" prop="waterNature" label="用水性质">
      </el-table-column>
      <el-table-column align="center" prop="wellDepth" width="150px" label="井深">
      </el-table-column>
      <el-table-column align="center" prop="includedFacilities" width="150px" label="内含设施">
      </el-table-column>
      <el-table-column align="center" prop="waterMeterManufacturer" label="水表厂家" width="150px">
      </el-table-column>
      <el-table-column align="center" prop="accountIdentifier" width="150px" label="编号">
      </el-table-column>
      <el-table-column align="center" prop="writtingTime" width="150px" label="填写时间">
      </el-table-column>
      <el-table-column align="center" label="操作" width="200px" fixed="right">
        <template v-slot="scope">
          <div style="display: flex; justify-content: center; align-items: center">
            <el-button size="small" @click="openWaterMeter(scope.row.id)"> 水表信息 </el-button>
            <el-button size="small" @click="modify(scope.row)" type="primary"> 修改信息 </el-button>
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
    <el-dialog title="维修记录" :visible.sync="repairDialog" :close-on-click-modal="false">
      <div style="height: 400px">
        <div v-for="repairInfoSingle in repairInfo" :key="repairInfoSingle.time + Math.random()">
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

      <el-button :disabled="updateRepairDisabled" style="margin-top: 12px" @click="updateRepair()">
        添加
      </el-button>
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
        <el-table-column align="center" prop="paymentNumber" label="缴费号"> </el-table-column>
        <el-table-column align="center" prop="accountNumber" label="户号"> </el-table-column>
        <el-table-column align="center" prop="accountName" label="户名"> </el-table-column>
        <el-table-column align="center" prop="status" label="用水性质"> </el-table-column>
        <el-table-column align="center" label="操作" width="100px" fixed="right">
          <template v-slot="scope">
            <div style="display: flex; justify-content: center; align-items: center">
              <el-button type="danger" @click="deleteWaterMeter(scope.row.id)"> 删除 </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="waterMeterDialog">
        <el-input class="dialogInput" v-model="waterMeterForm.paymentNumber" placeholder="缴费号">
        </el-input>
        <el-input class="dialogInput" v-model="waterMeterForm.accountNumber" placeholder="户号">
        </el-input>
        <el-input class="dialogInput" v-model="waterMeterForm.accountName" placeholder="户名">
        </el-input>
        <el-input class="dialogInput" v-model="waterMeterForm.status" placeholder="用水性质">
        </el-input>
        <el-button type="primary" @click="insertWaterMeterInfo()"> 新增水表信息 </el-button>
      </div>
    </el-dialog>
    <el-dialog title="表井信息" :visible.sync="wallInfoDialog">
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
          <el-input v-model="wallInfoForm.operatingStatus" placeholder="运行状态"></el-input>
        </el-form-item>
        <el-form-item label="用水性质" prop="waterNature">
          <el-input v-model="wallInfoForm.waterNature" placeholder="用水性质"></el-input>
        </el-form-item>
        <el-form-item label="井深" prop="wellDepth">
          <el-input v-model="wallInfoForm.wellDepth" placeholder="井深"></el-input>
        </el-form-item>
        <el-form-item label="内含设施" prop="includedFacilities">
          <el-input v-model="wallInfoForm.includedFacilities" placeholder="内含设施"></el-input>
        </el-form-item>
        <el-form-item label="水表厂家" prop="waterMeterManufacturer">
          <el-input v-model="wallInfoForm.waterMeterManufacturer" placeholder="水表厂家"></el-input>
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
  import { objectArray, ObjectType, repairInfoArray } from "./types";
  @Component({
    components: {
      Title,
    },
  })
  export default class SearchAll extends Vue {
    public pickerOptions = {};

    public searchTextBy: string = "filledBy";
    public searchText: string = "";

    public searchSelectBy = {
      accountIdentifier: [] as string[], //编号
      accountNumber: [] as string[], // 户号
      address: "" as string, // 地址
    };

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
      status: "", //状态
    };

    public wallInfoDialog = false;
    public wallInfoId = 0;

    public wallInfoForm: ObjectType = {
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

    public async search(): Promise<void> {
      this.searchLoading = true;
      this.tableLoading = true;
      this.searchLoading = false;
      this.tableLoading = false;

      // 解决视图不更新的问题
      await this.$nextTick();
    }

    public options: objectArray = [
      {
        value: "id",
        label: "id",
      },
    ];

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
      // .slice(0, 30);

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
      const res = await this["axios"].post(`WaterMeterWell/updateWaterMeterWellRepairInfoWithId`, {
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
      status: string;
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
          status: "", //状态
        };
        await this.getWaterMeterInfoById(this.waterMeterDialogId);
      }
    }

    public async deleteWaterMeter(waterMeterId: string): Promise<void> {
      this.waterMeterInfoArr = this.waterMeterInfoArr.filter((item: { id: string }) => {
        return item.id !== waterMeterId;
      });
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
