import { defineConfig } from "vitest/config"; export default defineConfig({ test: { globals: true, environment: "vitest", setupFiles: "./src/test/setup.ts" } });
