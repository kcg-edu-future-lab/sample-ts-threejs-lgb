import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    babel({
      presets: [{
        preset: () => ({ plugins: [["@babel/plugin-proposal-decorators", { version: "legacy" }]] }),
        rolldown: { filter: { code: "@" } },
      }],
    }),
    react()
  ],
  base: "./",
  server:{
    open: true
  }
})
