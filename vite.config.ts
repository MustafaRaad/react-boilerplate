import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          if (!normalizedId.includes("node_modules/")) return;

          const segments = normalizedId.split("node_modules/");
          const pkgPath = segments[segments.length - 1];
          const parts = pkgPath.split("/");
          const pkg = parts[0].startsWith("@")
            ? `${parts[0]}/${parts[1]}`
            : parts[0];

          if (pkg === "react" || pkg === "react-dom" || pkg === "scheduler") {
            return "react";
          }
          if (pkg.startsWith("@tanstack")) return "tanstack";
          if (pkg.startsWith("@radix-ui")) return "radix";
          if (pkg.startsWith("@dnd-kit")) return "dnd-kit";
          if (pkg === "recharts") return "charts";
          if (pkg === "i18next" || pkg === "react-i18next") return "i18n";
          if (pkg === "date-fns") return "date-fns";
          if (
            pkg === "@remixicon/react" ||
            pkg === "@base-ui/react" ||
            pkg === "cmdk" ||
            pkg === "embla-carousel-react" ||
            pkg === "input-otp" ||
            pkg === "next-themes" ||
            pkg === "radix-ui" ||
            pkg === "react-day-picker" ||
            pkg === "react-resizable-panels" ||
            pkg === "sonner" ||
            pkg === "vaul" ||
            pkg === "zustand" ||
            pkg === "zod"
          ) {
            return "ui";
          }

          return "vendor";
        },
      },
    },
  },
})
