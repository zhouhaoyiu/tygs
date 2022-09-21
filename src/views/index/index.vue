<template>
  <div class="page">
    <Title>首页</Title>
    <div class="cardContent">
      <div @click="goPage(card.path)" class="card" v-for="card in cardArr" :key="card.title">
        {{ card.title }}
      </div>
    </div>
    <div style="margin-top: 40px; display: flex">
      <div style="width: 800px; height: 450px" id="chart"></div>
      <div style="width: 800px; height: 450px" id="chart2"></div>
    </div>
  </div>
</template>

<script lang="ts">
  import * as echarts from "echarts";
  import Vue from "vue";
  import Component from "vue-class-component";
  import Title from "../../components/title.vue";
  import { bgPatternImg, piePatternImg } from "./image";
  @Component({
    components: {
      Title,
    },
  })
  export default class homeIndex extends Vue {
    public async mounted() {
      try {
        const res = await this.axios.get("/Tygs/getWaterMeterCount");
        console.log(res);
        this.setCharts(res.data);
      } catch (err) {
        this.$message.error("获取数据失败");
      }
    }

    // echarts 饼状图
    public setCharts(data: {
      fireHydrant: number;
      valueWellCount: number;
      waterMeterRoomCount: number;
      waterMeterWellCount: number;
    }) {
      const chartDom = document.getElementById("chart")!;
      const chart1 = echarts.init(chartDom);

      let option: echarts.EChartsOption = {
        // backgroundColor: {
        //   // 白色
        //   type: "pattern",
        //   image: bgPatternImg,
        //   repeat: "repeat",
        //   // image: bgPatternImg,
        //   // repeat: "repeat",
        // },
        title: {
          text: "数据分析",
          textStyle: {
            color: "#235894",
          },
        },
        series: [
          {
            name: "pie",
            type: "pie",
            selectedMode: "single",
            selectedOffset: 40,
            clockwise: true,
            label: {
              show: true,
              position: "outside",
              formatter: "{b} {c} {d}%",
              color: "#235894",
              fontSize: 14,
            },
            labelLine: {
              lineStyle: {
                color: "#235894",
              },
            },
            data: [
              { value: data.fireHydrant, name: "消防栓" },
              { value: data.valueWellCount, name: "阀门井" },
              { value: data.waterMeterRoomCount, name: "水表间" },
              { value: data.waterMeterWellCount, name: "表井" },
            ],
            itemStyle: {
              opacity: 1,
              color: {
                image: piePatternImg,
                repeat: "repeat",
              },
              borderWidth: 2,
              borderColor: "#235894",
            },
          },
        ],
      };
      option && chart1.setOption(option);
    }

    public cardArr: Record<string, string>[] = [
      // {
      //   title: "查询全部",
      //   path: "/searchAll",
      // },
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

    public goPage(path: string): void {
      this.$router.push("/home" + path);
    }
  }
</script>

<style lang="scss" scoped>
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
        box-shadow: 0 0px 5px 1px #2b5cab55;
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
