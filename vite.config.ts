import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: mode === "test"
    ? [tailwindcss()]
    : [
        cloudflare({ viteEnvironment: { name: "ssr" } }),
        tailwindcss(),
        reactRouter(),
      ],
}));
