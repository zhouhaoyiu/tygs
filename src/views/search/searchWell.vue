<template>
  <div>
    <Title>水表信息</Title>
    <div class="searchArea">
      <div class="searchClass">
        <el-select width="240px" v-model="searchBy" style="margin-right: 20px">
          <el-option
            v-for="item in options"
            :key="item"
            :label="item.label"
            :value="item"
          ></el-option>
        </el-select>
        <el-input
          style="width: 200px; margin-right: 20px"
          v-model="searchText"
          placeholder="请输入用户名"
          @keyup.enter.native="searchInfoBySearch"
        />
      </div>
      <el-button type="success" @click="searchInfoBySearch()">search</el-button>
      <el-button @click="resetInfo()"> reset </el-button>
    </div>
    <el-table
      border
      stripe
      :data="displayRes"
      style="width: 100%; height: 575px"
    >
      <el-table-column prop="jfh" label="jfh"> </el-table-column>
      <el-table-column prop="mc" label="mc"></el-table-column>
      <el-table-column prop="dz" label="dz" width="300"></el-table-column>
      <el-table-column prop="sbkj" label="sbkj"></el-table-column>
      <el-table-column prop="sbh" label="sbh"></el-table-column>
      <el-table-column prop="ycbh" label="ycbh"></el-table-column>
      <el-table-column prop="cjsj" label="cjsj"></el-table-column>
      <el-table-column prop="lxr" label="lxr"></el-table-column>
      <el-table-column prop="lxdh" label="lxdh"></el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      :total="listLength"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="changePage($event)"
      class="pagination"
    ></el-pagination>
  </div>
</template>

<script lang="ts">
import Title from "@/components/title.vue";
import axios from "axios";
import Vue from "vue";
import Component from "vue-class-component";
@Component({
  components: {
    Title,
  },
})
export default class SearchWell extends Vue {
  public searchText = "";
  public searchBy = "mc";
  public currentPage = 1;
  public displayRes = [];
  public pageSize = 30;
  public listLength = 0;

  public options = [
    { value: "mc", label: "名称" },
    { value: "jfh", label: "缴费号" },
    { value: "dz", label: "地址" },
  ];

  public async searchInfoBySearch(): Promise<void> {
    this.currentPage = 1;
    // await getInfoBySearch();
    switch (this.searchBy) {
      case "mc":
        await this.getInfoBy("Name", "mc");
        break;
      case "jfh":
        await this.getInfoBy("Jfh", "jfh");
        break;
      case "dz":
        await this.getInfoBy("Dz", "dz");
        break;
    }
  }

  public async getInfoBy(By: string, Param: string): Promise<void> {
    const res = await axios.get(`sheet1/getInfoByPageAnd${By}`, {
      params: {
        page: this.currentPage,
        [Param]: this.searchText,
      },
    });
    const length = await axios.get(`sheet1/getInfoByPageAnd${By}Count`, {
      params: {
        [Param]: this.searchText,
      },
    });

    this.displayRes = res.data;
    this.listLength = length.data;
  }

  public async getInfo(): Promise<void> {
    const res = await axios.get("sheet1/getInfoByPage", {
      params: {
        page: this.currentPage,
      },
    });

    const length = await axios.get("sheet1/getInfoByPageCount");

    this.displayRes = res.data;
    this.listLength = length.data;
  }

  public async changePage(page: number): Promise<void> {
    if (page < 1) {
      return;
    }
    this.currentPage = page;

    if (!this.searchText) {
      await this.getInfo();
      return;
    }

    switch (this.searchBy) {
      case "mc":
        await this.getInfoBy("Name", "mc");
        break;
      case "jfh":
        await this.getInfoBy("Jfh", "jfh");
        break;
      case "dz":
        await this.getInfoBy("Dz", "dz");
        break;
      default:
        await this.getInfo();
        break;
    }
  }

  public async resetInfo(): Promise<void> {
    this.searchText = "";
    this.searchBy = "mc";
    this.currentPage = 1;
    await this.getInfo();
  }

  public async mounted(): Promise<void> {
    await this.getInfo();
  }
}
</script>

<style lang="scss" scoped>
.searchArea {
  display: flex;
  // justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.pagination {
  // 居中
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}
</style>
