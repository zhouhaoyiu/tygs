<template>
  <div>
    <Title>水表信息(户表)</Title>
    <div class="searchArea">
      <div class="searchClass">
        <el-select width="240px" v-model="searchBy" style="margin-right: 20px">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-input
          style="width: 200px; margin-right: 20px"
          v-model="searchText"
          placeholder="请输入用户名"
          @keyup.enter.native="searchInfoBySearch"
        />
      </div>
      <el-button type="primary" @click="searchInfoBySearch()">搜索</el-button>
      <el-button @click="resetInfo()"> 重置 </el-button>
    </div>
    <el-table
      v-loading="tableLoading"
      border
      stripe
      :data="displayRes"
      style="width: 100%; height: 575px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)"
    >
      <el-table-column align="center" prop="jfh" label="缴费号"> </el-table-column>
      <el-table-column align="center" prop="hh" label="户号"> </el-table-column>
      <el-table-column align="center" prop="mc" label="名称"></el-table-column>
      <el-table-column align="center" prop="xxdz" label="详细地址" width="300"></el-table-column>
      <el-table-column align="center" prop="sbkj" label="水表口径"></el-table-column>
      <el-table-column align="center" prop="sbh" label="水表号"></el-table-column>
      <el-table-column align="center" prop="ycbh" label="远传表号"></el-table-column>
      <el-table-column align="center" prop="cjsj" label="创建时间"></el-table-column>
      <el-table-column align="center" prop="lxr" label="联系人"></el-table-column>
      <el-table-column align="center" prop="lxdh" label="联系电话"></el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next,total"
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
    public pageSize = 30; // 每页显示的条数
    public listLength = 0; //
    public tableLoading = false;

    public options = [
      { value: "mc", label: "名称" },
      { value: "jfh", label: "缴费号" },
      { value: "hh", label: "户号" },
      { value: "xxdz", label: "地址" },
    ];

    public async searchInfoBySearch(): Promise<void> {
      this.currentPage = 1;

      await this.getInfoBySearchBy();
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

      await this.getInfoBySearchBy();
    }

    public async getInfoBySearchBy(): Promise<void> {
      switch (this.searchBy) {
        case "mc":
          await this.getInfoBy("Name", "mc");
          break;
        case "jfh":
          await this.getInfoBy("Jfh", "jfh");
          break;
        case "hh":
          await this.getInfoBy("Hh", "hh");
          break;
        case "xxdz":
          await this.getInfoBy("Xxdz", "xxdz");
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
