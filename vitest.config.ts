import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/__tests__/**/*.test.ts"],
	},
	resolve: {
		alias: [
			{
				find: "@/lib/schemas",
				replacement: path.resolve(__dirname, "./src/lib/schemas"),
			},
			{
				find: "@",
				replacement: path.resolve(__dirname, "./src/react-app"),
			},
		],
	},
});
