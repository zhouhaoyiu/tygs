<template>
  <div>
    <Title>数据录入</Title>
    <!-- <table border="1">
      <tr>
        <th>Month</th>
        <th>Savings</th>
      </tr>
      <tr>
        <td>January</td>
        <td>$100</td>
      </tr>
    </table> -->
    <el-radio-group v-model="inputType">
      <el-radio-button label="表卡输入"></el-radio-button>
      <el-radio-button label="信息录入"></el-radio-button>
      <!-- <el-radio-button label="广州"></el-radio-button> -->
      <!-- <el-radio-button label="深圳"></el-radio-button> -->
    </el-radio-group>
    <div style="margin-top: 15px;" v-show="inputType === '表卡输入'">
      <input
        type="file"
        ref="upload"
        accept=".xls,.xlsx"
        class="outputlist_upload"
      />
      <div>
        <el-table
          :data="ExcelInfo"
          max-height="500px"
          style="margin-top: 20px; width: 97%"
        >
          <el-table-column align="center" prop="ssmc" label="设施名称">
          </el-table-column>
          <el-table-column align="center" prop="ggxh" label="规格型号">
          </el-table-column>
          <el-table-column align="center" prop="syzt" label="使用状态">
          </el-table-column>
        </el-table>
        <!-- {{ ExcelInfo }} -->
        <!-- {{ ggxh }} -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";
import { read, utils } from "xlsx";
@Component({
  components: {
    Title,
  },
})
export default class InputInfor extends Vue {
  public outputs = [];

  public ssmc: string[] = [];
  public ggxh: string[] = [];
  public syzt: string[] = [];

  public ExcelInfo: any[] = [];
  public inputType: string = "表卡输入";

  public mounted() {
    console.log(123);
    (this.$refs!.upload! as HTMLElement).addEventListener(
      "change",
      (e: any) => {
        //绑定监听表格导入事件
        this.readExcel(e);
      }
    );
  }

  readExcel(e: { target: { files: any } }) {
    var that = this;
    const files = e.target.files;
    // 如果没有文件名
    if (files.length <= 0) {
      return false;
    } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
      this.$message.error("上传格式不正确，请上传xls或者xlsx格式");
      return false;
    }

    const fileReader = new FileReader();
    fileReader.onload = (ev) => {
      try {
        const data = ev!.target!.result;
        // 切换为新的调用方式
        const workbook = read(data, {
          type: "binary",
        });
        // 取第一张表
        const wsname = workbook.SheetNames[0];
        // 切换为新的调用方式 生成json表格内容
        const ws = utils.sheet_to_json(workbook.Sheets[wsname]);
        console.log(ws);
        ws.forEach((item: any) => {
          // console.log(item);
          if (item["__EMPTY"] === "设施名称") {
            this.ssmc.push(item["__EMPTY_1"]);
          }
          if (item["__EMPTY"] === "规格型号") {
            this.ggxh.push(item["__EMPTY_1"]);
          }
          if (item["__EMPTY_2"] === "使用状态") {
            this.syzt.push(item["__EMPTY_3"]);
          }
        });
        for (let i = 0; i < this.ssmc.length; i++) {
          this.ExcelInfo.push({
            ssmc: this.ssmc[i],
            ggxh: this.ggxh[i],
            syzt: this.syzt[i],
          });
        }
        // 后续为自己对ws数据的处理
      } catch (e) {
        return false;
      }
    };
    fileReader.readAsBinaryString(files[0]);
  }
}
</script>

<style lang="scss">
.outputlist_upload {
  border: none;
}
input[type="button"] {
  background: red;
}
</style>
