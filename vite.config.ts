import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		plugins: [vue()],
		resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
		define: {
			"import.meta.env.VITE_API_BASE": JSON.stringify(
				env.VITE_API_BASE || env.VUE_APP_API_BASE || "/api",
			),
		},
		server: { host: "127.0.0.1" },
		build: { sourcemap: false },
		test: { environment: "jsdom", clearMocks: true },
	};
});
