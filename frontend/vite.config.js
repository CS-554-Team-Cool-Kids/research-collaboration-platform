import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  proxy: {
    "/": "0.0.0.0:5000",
  },
});
