# 太原供水设施台账

Vue 2.7 / Element UI。保留表井、水表间、消防栓、阀门井、表卡和小区资料入口。

运行 `pnpm install`，设置 `VUE_APP_API_BASE` 后执行 `pnpm serve`。默认 /api 需代理到 tygs-java。生产服务使用 HTTPS。

登录使用后端 8 小时会话，退出后撤销。前端不保存密码或私钥。水表停用提交所属设施与原因，后端事务写入操作记录。公开注册已关闭，账号由管理员配置。

`pnpm build` 构建生产文件。旧私钥已从当前代码移除，服务器证书仍需重新签发并撤销旧证书。

## Build compatibility

`patches/vue-loader@15.11.1.patch` imports ordinary component styles for their side effects. CSS modules retain their named bindings. This fixes the Vue 2 loader's default-export warnings with Webpack 5 without suppressing build diagnostics.
