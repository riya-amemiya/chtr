import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		// Browser tests live alongside the source; the fast `bun test` suite
		// under tests/unit is intentionally excluded from this runner.
		include: ["tests/chtr.test.tsx"],
		browser: {
			enabled: true,
			provider: "playwright",
			// https://vitest.dev/guide/browser/playwright
			instances: [{ browser: "chromium" }],
		},
	},
});
