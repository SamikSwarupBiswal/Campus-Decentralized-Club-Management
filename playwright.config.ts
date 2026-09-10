import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:3000", browserName: "chromium", headless: true },
  webServer: { command: "npm run dev -- --hostname 127.0.0.1", url: "http://127.0.0.1:3000", env: { NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000" }, reuseExistingServer: false, timeout: 120000 },
});
