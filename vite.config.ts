import {defineConfig, loadEnv} from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    css: {
      devSourcemap: true,
    },
    plugins: [vue(), svgLoader()],
  });

