// vite.config.ts
import { defineConfig } from "file:///C:/Users/esher/Documents/portal/node_modules/.pnpm/vite@4.4.9/node_modules/vite/dist/node/index.js";
import wasm from "file:///C:/Users/esher/Documents/portal/node_modules/.pnpm/vite-plugin-wasm@3.2.2_vite@4.4.9/node_modules/vite-plugin-wasm/exports/import.mjs";
import mkcert from "file:///C:/Users/esher/Documents/portal/node_modules/.pnpm/vite-plugin-mkcert@1.16.0_vite@4.4.9/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
import react from "file:///C:/Users/esher/Documents/portal/node_modules/.pnpm/@vitejs+plugin-react@4.0.4_vite@4.4.9/node_modules/@vitejs/plugin-react/dist/index.mjs";
var count = 0;
var vite_config_default = defineConfig({
  server: { https: true },
  plugins: [
    wasm(),
    react(),
    // https
    mkcert(),
    {
      name: "wasm-loader",
      transform: (code, id) => {
        if (count < 1e6) {
          console.log(id);
          count++;
        }
        if (id.endsWith(".wasm")) {
          console.log("code ", code, "id ", id);
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null
          };
        }
      }
    }
  ],
  assetsInclude: ["**/*.mp4"]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxlc2hlclxcXFxEb2N1bWVudHNcXFxccG9ydGFsXFxcXHBhY2thZ2VzXFxcXHdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZXNoZXJcXFxcRG9jdW1lbnRzXFxcXHBvcnRhbFxcXFxwYWNrYWdlc1xcXFx3ZWJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2VzaGVyL0RvY3VtZW50cy9wb3J0YWwvcGFja2FnZXMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB3YXNtIGZyb20gJ3ZpdGUtcGx1Z2luLXdhc20nXG5pbXBvcnQgbWtjZXJ0IGZyb20gJ3ZpdGUtcGx1Z2luLW1rY2VydCdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcblxubGV0IGNvdW50ID0gMDtcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHsgaHR0cHM6IHRydWUgfSxcbiAgcGx1Z2luczogW1xuICAgIHdhc20oKSxcbiAgICByZWFjdCgpLFxuXG4gICAgLy8gaHR0cHNcbiAgICBta2NlcnQoKSxcbiAgICB7XG4gICAgICBuYW1lOiAnd2FzbS1sb2FkZXInLFxuICAgICAgdHJhbnNmb3JtOiAoY29kZSwgaWQpID0+IHtcbiAgICAgICAgaWYgKGNvdW50IDwgMTAwMDAwMCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGlkKVxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCc8PDw8PDw8ZW5kJylcbiAgICAgICAgICBjb3VudCsrXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaWQuZW5kc1dpdGgoJy53YXNtJykpIHtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCdjb2RlICcsIGNvZGUsICdpZCAnLCBpZClcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb2RlOiBgZXhwb3J0IGRlZmF1bHQgJHtKU09OLnN0cmluZ2lmeShjb2RlKX07YCxcbiAgICAgICAgICAgIG1hcDogbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgfVxuICBdLFxuICBhc3NldHNJbmNsdWRlOiBbJyoqLyoubXA0J11cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9VLFNBQVMsb0JBQW9CO0FBQ2pXLE9BQU8sVUFBVTtBQUNqQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxXQUFXO0FBRWxCLElBQUksUUFBUTtBQUVaLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVEsRUFBRSxPQUFPLEtBQUs7QUFBQSxFQUN0QixTQUFTO0FBQUEsSUFDUCxLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUE7QUFBQSxJQUdOLE9BQU87QUFBQSxJQUNQO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixXQUFXLENBQUMsTUFBTSxPQUFPO0FBQ3ZCLFlBQUksUUFBUSxLQUFTO0FBQ25CLGtCQUFRLElBQUksRUFBRTtBQUVkO0FBQUEsUUFDRjtBQUVBLFlBQUksR0FBRyxTQUFTLE9BQU8sR0FBRztBQUV4QixrQkFBUSxJQUFJLFNBQVMsTUFBTSxPQUFPLEVBQUU7QUFFcEMsaUJBQU87QUFBQSxZQUNMLE1BQU0sa0JBQWtCLEtBQUssVUFBVSxJQUFJLENBQUM7QUFBQSxZQUM1QyxLQUFLO0FBQUEsVUFDUDtBQUFBLFFBQ0Y7QUFBQSxNQUVGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGVBQWUsQ0FBQyxVQUFVO0FBQzVCLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
