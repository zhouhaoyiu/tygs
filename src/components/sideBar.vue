<template>
  <div class="sideBar">
    <div class="info">
      <div class="info-title">欢迎您</div>
      <div class="info-name">{{ userName }}</div>
      <div class="info-name">{{ identity }}</div>
    </div>
    <div class="buttons">
      <div
        class="button"
        v-for="(button, buttonIndex) in calcButtonArr"
        :key="button.name"
      >
        <button
          :class="getActive(button.path, button.children) ? 'active' : ''"
          @click="emitGoPage(button.path, buttonIndex)"
          class="button-inside"
        >
          {{ button.name }}
          <i
            v-if="button.children"
            class="button-inside-svg fas fa-caret-down"
          ></i>
        </button>
        <div
          style="display: flex; flex-direction: column"
          v-if="getChildrenListShow(button)"
        >
          <button
            @click="emitGoChildPage(childrenBtn.path, childrenBtnIndex)"
            class="button-child-inside"
            :class="getChildActive(childrenBtn.path) ? 'active' : ''"
            v-for="(childrenBtn, childrenBtnIndex) in button.children"
            :key="childrenBtnIndex"
          >
            {{ childrenBtn.name }}
          </button>
        </div>
      </div>
    </div>
    <div class="sideBar-foot">
      <el-button type="primary" @click="askLogOut()">登出</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { GET_ADMIN_INFO } from "@/store/type/getter-type";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { btn } from "./type";

@Component({
  components: {},
})
export default class SideBar extends Vue {
  @Prop() userName!: string;
  @Prop() identity!: string;
  @Prop() goPage!: (page: string) => void;
  @Prop() logOut!: () => void;

  public index = 0;
  public childrenIndex = 0;

  public buttonArr: btn[] = [
    {
      name: "首页",
      path: "index",
      role: 1,
    },
    {
      name: "查询",
      role: 1,
      path: "search",
      children: [
        {
          name: "全部",
          path: "searchAll",
          role: 1,
        },
        {
          name: "表井(总表)",
          path: "searchWaterMeterWell",
          role: 1,
        },
        {
          name: "阀门井",
          path: "searchValueWell",
          role: 1,
        },
        {
          name: "水表间(户表)",
          path: "searchWaterMeterRoom",
          role: 1,
        },
        {
          name: "消火栓",
          path: "searchFireHydrant",
          role: 1,
        },
      ],
    },
    {
      name: "卡片",
      path: "card",
      role: 1,
    },
    {
      name: "录入",
      path: "InputInfor",
      role: 1,
    },
  ];

  public emitGoPage(path: string, index: number): void {
    if (!this.buttonArr[index].children) {
      this.$emit("goPage", path);
      this.index = index;
      console.log(this.index);
    } else {
      if (this.index !== index) {
        if (this.buttonArr[index].children!.length > 0) {
          this.$emit("goPage", this.buttonArr[index].children![0].path);
        }
        this.index = index;
        this.setChildrenIndex(0);
      }
    }
  }
  public emitGoChildPage(path: string, index: number): void {
    this.$emit("goPage", path);
    this.setChildrenIndex(index);
  }

  public setIndex(index: number): void {
    this.index = index;
  }
  public setChildrenIndex(index: number): void {
    this.childrenIndex = index;
  }

  public askLogOut(): void {
    this.$confirm("请确认是否登出系统?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        this.$message({
          type: "success",
          message: "退出成功!",
        });
        this.$emit("logOut");
      })
      .catch(() => {});
  }

  get routePath(): string {
    return this.$route.path.split("/")[2] || "index";
  }

  get calcButtonArr(): btn[] {
    return this.buttonArr.filter((button: btn) => {
      return button.role >= this.$store.getters[GET_ADMIN_INFO].adminRole;
    });
  }
  // 根据当前url来判断是否需要高亮显示按钮
  public getActive(path: string, children: btn[] | undefined) {
    // console.log(path);
    // console.log(this.routePath);
    return (
      this.routePath === path ||
      (children && children.some((child) => child.path === this.routePath))
    );
  }

  // 根据当前url来判断是否需要显示子按钮
  public getChildrenListShow(button: btn): boolean {
    return (
      (button.children &&
        button.children.some((child) => child.path === this.routePath)) ||
      false
    );
  }

  // 根据当前url来判断是否需要高亮显示子按钮
  public getChildActive(path: string): boolean {
    return this.routePath === path;
  }

  // mounted(): void {
  //   if (localStorage.getItem("page")) {
  //     this["$router"].push(`/home/${localStorage.getItem("page")}`);
  //   } else {
  //     this["$router"].push("/home/index");
  //   }
  // }
}
</script>

<style lang="scss" scoped>
.sideBar {
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: #021146;
  height: 100%;
  width: 208px;
  z-index: 100;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  top: 0;
  left: 0;
  overflow: hidden;
  min-width: 200px;

  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 15px 0;
    height: 120px;

    .info-title {
      margin-bottom: 10px;
      font-size: 20px;
      font-weight: bold;
    }

    .info-name {
      margin-bottom: 10px;
      font-size: 16px;
    }
  }

  .buttons {
    display: flex;
    width: 100%;
    height: 80%;
    flex-direction: column;

    .button {
      display: flex;
      flex-direction: column;
      width: 100%;
      justify-content: space-between;
      margin-bottom: 10px;

      .button-inside {
        position: relative;
        width: 100%;
        height: 40px;
        border: none;
        background-color: transparent;
        // border-top: 1px solid brown;
        border-top: 1px solid var(--primary-color);
        border-bottom: 1px solid var(--primary-color);
        color: black;
        font-size: 14px;
        cursor: pointer;

        .button-inside-svg {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
        }
      }

      .button-child-inside {
        margin: 10px auto 0 auto;
        width: 80%;
        height: 35px;
        border: 1px solid var(--primary-color);
        border-radius: 12px;
        background-color: transparent;
        color: black;
        font-size: 14px;
        cursor: pointer;
      }
    }

    .active {
      background: var(--primary-color) !important;
      font-weight: bold;
      color: #fff !important;
    }
  }

  .sideBar-foot {
    display: flex;
    width: 100%;
    height: calc(30% - 160px);
    flex-direction: column;
    justify-content: center;
    align-items: center;

    button {
      width: 80%;
      height: 40px;
      // background-color: blue;
      // border: none;
      border-radius: 6px;
      // border-top: 1px solid brown;
      // color: #fff;
      // font-size: 14px;
    }
  }
}
</style>
