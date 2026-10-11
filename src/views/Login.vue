<template>
	<main class="facility-login">
		<form @submit.prevent="login">
			<img src="../assets/tygs.png" alt="太原供水" />
			<p>城北营销 · 设施管理</p>
			<h1>登录工作台</h1>
			<label
				>账号<el-input v-model="username" autocomplete="username" :disabled="busy" /></label
			><label
				>密码<el-input
					v-model="password"
					type="password"
					show-password
					autocomplete="current-password"
					:disabled="busy" /></label
			><el-button native-type="submit" type="primary" :loading="busy">登录</el-button>
		</form>
	</main>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { SET_ADMIN_INFO } from "@/store/type/mutation-type";
@Component
export default class Login extends Vue {
	public username = "";
	public password = "";
	public busy = false;
	public async login(): Promise<void> {
		if (this.busy || !this.username || !this.password) return;
		this.busy = true;
		try {
			const response = await this.axios.post("/admin/adminLogin", {
				userName: this.username,
				passWord: this.password,
			});
			if (!response.data.token) throw new Error("登录未返回会话");
			sessionStorage.setItem("facilityToken", response.data.token);
			sessionStorage.setItem("facilityName", response.data.data.userName);
			sessionStorage.setItem("facilityRole", String(response.data.data.adminRole));
			localStorage.removeItem("userName");
			localStorage.removeItem("UUid");
			localStorage.removeItem("publicKey");
			this.$store.commit(SET_ADMIN_INFO, response.data.data);
			await this.$router.replace("/home/index");
		} catch {
			this.$message.error("登录失败，请核对账号和密码");
		} finally {
			this.busy = false;
		}
	}
}
</script>
