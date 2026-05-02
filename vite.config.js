import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ["enormous-mint-tomcat.ngrok-free.app"],
    port: 3050,
  },
  plugins: [react(), tailwindcss()],
});
