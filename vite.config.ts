import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    useAtYourOwnRisk_mutateSwcOptions(options) {
      options.jsc!.parser!.decorators = true
      options.jsc!.transform!.decoratorVersion = '2022-03'
    },
  })],
  base: "./",
  server:{
    open: true
  }
})
