import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	use: {
		baseURL: "http://127.0.0.1:3000"
	},
	webServer: {
		command: "pnpm run serve",
		url: "http://127.0.0.1:3000",
		reuseExistingServer: true,
		timeout: 30000
	}
});
