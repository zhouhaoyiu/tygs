<template>
  <div>
    <Title>卡片</Title>
    <div>
      城北营销分公司供水附属设施登记卡
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid black;
          border-right: 0px;
          width: max-content;
          height: 50px;
        "
      >
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          设施名称
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          阀门井
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          使用状态
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          正常
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          所属管线
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          白龙庙街DN300球墨铸铁给水管线（北线）
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          井室编号
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          13
        </div>
      </div>
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid black;
          border-top: 0px;
          border-right: 0px;
          width: max-content;
          height: 50px;
        "
      >
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          规格型号
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          DN100
        </div>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            border-right: 1px solid black;
            width: 200px;
            height: 50px;
          "
        >
          井室类型
        </div>
        <div></div>
        <div></div>
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
export default class Card extends Vue {}
</script>

<style lang="scss"></style>
