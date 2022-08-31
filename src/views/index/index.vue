<template>
  <div class="page">
    <Title>首页</Title>
    <div class="cardContent">
      <div
        @click="goPage(card.path)"
        class="card"
        v-for="card in cardArr"
        :key="card.title"
      >
        {{ card.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Title from "../../components/title.vue";
@Component({
  components: {
    Title,
  },
})
export default class homeIndex extends Vue {
  public async mounted() {
    const res = await this.axios.get("/Tygs/getWaterMeterCount");
    console.log(res);
  }

  // echarts 饼状图
  

  public cardArr: Record<string, string>[] = [
    {
      title: "查询全部",
      path: "/searchAll",
    },
    {
      title: "表井",
      path: "/searchWaterMeterWell",
    },
    {
      title: "水表间",
      path: "/searchWaterMeterRoom",
    },
    {
      title: "消防栓",
      path: "/searchFireHydrant",
    },
    {
      title: "阀门井",
      path: "/searchValueWell",
    },
    {
      title: "卡片",
      path: "/card",
    },
    {
      title: "录入",
      path: "/InputInfor",
    },
  ];

  public goPage(path: string) {
    this.$router.push("/home" + path);
  }
}
</script>

<style lang="scss">
.page {
  .name {
    font-size: 48px;
  }
  .cardContent {
    display: flex;
    flex-wrap: wrap;
    // justify-content: center;
    align-items: center;
    .card {
      height: 55px;
      width: 30%;
      margin: 7px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid var(--primary-color);
      border-radius: 5px;
      cursor: pointer;
      background: var(--primary-color);
      color: white;
    }
    .card:hover {
      transform: scale(1.05);
    }
    // 点击时候的效果
    .card:active {
      transform: scale(0.95);
    }
  }
}
</style>
