import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import node from "@astrojs/node"
import tailwindcss from "@tailwindcss/vite"
import { loadEnv } from "vite"

const environment = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "")
Object.assign(process.env, environment)
const astroHost = environment.ASTRO_HOST?.trim() || false

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["@zbeaver/beaver"],
      noExternal: ["cookie"],
    },
    server: {
      watch: {
        ignored: ["**/sqlite.db", "**/sqlite.db-wal", "**/sqlite.db-shm"],
      },
    },
  },
  integrations: [react()],
  server: { host: astroHost },
  security: {
    checkOrigin: true,
  },
})
