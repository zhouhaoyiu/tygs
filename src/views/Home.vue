<template>
  <div style="width: 100%; height: 100%">
    <TopBar></TopBar>
    <div class="home">
      <side-bar
        :userName="userName"
        :identity="identity"
        @goPage="goPage"
        @logOut="logOut"
      ></side-bar>
      <router-view
        style="padding: 2% 3%; width: 100%; height: 100%; margin-top: 0%"
      ></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import SideBar from "@/components/sideBar.vue";
import { GET_ADMIN_INFO } from "@/store/type/getter-type";
import { Component, Vue } from "vue-property-decorator";
import TopBar from "../components/topBar.vue";

@Component({
  components: { SideBar, TopBar },
})
export default class Home extends Vue {
  public goPage(page: string): void {
    this["$router"].push(`/home/${page}`);
    localStorage.setItem("page", page);
  }

  get userName(): string {
    return this.$store.getters[GET_ADMIN_INFO].userName;
  }

  get identity(): string {
    let identityArr = {
      0: "超级管理员",
      1: "管理员",
    };
    return identityArr[
      this.$store.getters[GET_ADMIN_INFO].adminRole as keyof typeof identityArr
    ];
  }

  public logOut(): void {
    localStorage.removeItem("UUid");
    this["$router"].push("/login");
  }
}
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  width: 100%;
  height: calc(100% - 120px);
}
</style>
