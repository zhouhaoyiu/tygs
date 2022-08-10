<template>
  <div class="login">
    <div class="login-wrap">
      <div class="logo">
        <img :src="require('../assets/tygs.png')" alt="">
      </div>
      <div class="username">
        <span>用户名</span>
        <el-input v-model="username" placeholder="请输入用户名"></el-input>
      </div>
      <div class="password">
        <span>密码 </span>
        <el-input show-password placeholder="请输入密码" v-model="password"></el-input>
      </div>
      <div class="buttons">
        <el-button class="login-button" size="medium" type="primary" @click="login()">登录</el-button>
        <el-button class="login-button" size="medium" type="" plain @click="regis()">注册</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { JSEncrypt } from "jsencrypt";
import { SET_ADMIN_INFO } from "@/store/type/mutation-type";
import dayjs from "dayjs";

@Component({
  components: {},
})
export default class Login extends Vue {
  public username = "";
  public password = "";

  public async login(): Promise<void> {
    let publicKey: { [x: string]: string; data: string };
    publicKey = await this["axios"].get("rsa/pubKey");
    if (String(publicKey["status"]) === "200") {
      localStorage.setItem("publicKey", publicKey.data);
    }
    const jsencrypt = new JSEncrypt();
    jsencrypt.setPublicKey(localStorage.getItem("publicKey") || "");
    const res = await this["axios"].post("admin/adminLogin", {
      userName: this.username,
      passWord: jsencrypt.encrypt(this.password),
    });
    if (res.data["code"] === "0") {
      localStorage.setItem("userName", res.data.data.userName);
      localStorage.setItem("UUid", res.data.data.adminUUid);
      this.$store.commit(SET_ADMIN_INFO, res.data.data);
      this["$message"]({
        message: "登录成功",
        type: "success",
      });
      this.axios.post("adminLog/addAdminLog", {
        adminUUid: res.data.data.adminUUid,
        logTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        info: res.data.data.userName + "登录",
      });
      this["$router"].push("/home");
    } else {
      this["$message"]({
        message: res.data.msg,
        type: "error",
      });
    }
  }

  public regis(): void {
    this["$router"].push("/regis");
  }
  mounted(): void {
    //
  }
}
</script>
<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  display: flex;
  background: #282c34;

  .login-wrap {
    display: flex;
    margin: auto;
    width: 500px;
    height: 500px;
    padding: 50px 100px;
    border: 1px solid #333;
    border-radius: 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: whitesmoke;
    .logo{
      img{
        width: 200px;
        height: 200px;
      }
      margin: 20px;
    }

    .username,
    .password {
      width: 100%;
      display: flex;
      flex-wrap: nowrap;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;

      span {
        width: 100px;
        line-height: 40px;
        padding-left: 5px;
        text-align: left;
      }
    }

    .buttons {
      display: flex;
      width: 100%;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding-top: 10px;

      .login-button {
        width: 100%;
        margin: 10px 0px;
      }
    }
  }
}
</style>
