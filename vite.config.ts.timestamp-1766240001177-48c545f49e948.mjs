// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import vue from "file:///C:/Users/31963/Desktop/hainiu/xiaoan/xiaoan-pc-h5/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.21_@types+node@24.9.1__vue@3.5.18_typescript@5.9.3_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///C:/Users/31963/Desktop/hainiu/xiaoan/xiaoan-pc-h5/node_modules/.pnpm/unplugin-auto-import@0.17.8_@vueuse+core@9.13.0_vue@3.5.18_typescript@5.9.3___rollup@4.46.3/node_modules/unplugin-auto-import/dist/vite.js";
import {
  ElementPlusResolver
} from "file:///C:/Users/31963/Desktop/hainiu/xiaoan/xiaoan-pc-h5/node_modules/.pnpm/unplugin-vue-components@0.26.0_@babel+parser@7.28.3_rollup@4.46.3_vue@3.5.18_typescript@5.9.3_/node_modules/unplugin-vue-components/dist/resolvers.js";
import Components from "file:///C:/Users/31963/Desktop/hainiu/xiaoan/xiaoan-pc-h5/node_modules/.pnpm/unplugin-vue-components@0.26.0_@babel+parser@7.28.3_rollup@4.46.3_vue@3.5.18_typescript@5.9.3_/node_modules/unplugin-vue-components/dist/vite.js";
import { defineConfig } from "file:///C:/Users/31963/Desktop/hainiu/xiaoan/xiaoan-pc-h5/node_modules/.pnpm/vite@5.4.21_@types+node@24.9.1/node_modules/vite/dist/node/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/31963/Desktop/hainiu/xiaoan/xiaoan-pc-h5/vite.config.ts";
var vite_config_default = defineConfig({
  base: "/h5/",
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ["vue", "vue-router"],
      dts: true
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: "css"
        }),
        // Element Plus 图标自动导入
        (componentName) => {
          if (componentName.startsWith("ElIcon")) {
            const iconName = componentName.slice(6);
            return {
              name: iconName,
              from: "@element-plus/icons-vue"
            };
          }
        }
      ]
    })
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFwzMTk2M1xcXFxEZXNrdG9wXFxcXGhhaW5pdVxcXFx4aWFvYW5cXFxceGlhb2FuLXBjLWg1XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFwzMTk2M1xcXFxEZXNrdG9wXFxcXGhhaW5pdVxcXFx4aWFvYW5cXFxceGlhb2FuLXBjLWg1XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy8zMTk2My9EZXNrdG9wL2hhaW5pdS94aWFvYW4veGlhb2FuLXBjLWg1L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcbmltcG9ydCB7XG4gIEVsZW1lbnRQbHVzUmVzb2x2ZXIsXG4gIEljb25zUmVzb2x2ZXIsXG59IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuLy8gaW1wb3J0IHZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnL2g1LycsXG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoe1xuICAgICAgc2NyaXB0OiB7XG4gICAgICAgIGRlZmluZU1vZGVsOiB0cnVlLFxuICAgICAgICBwcm9wc0Rlc3RydWN0dXJlOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBBdXRvSW1wb3J0KHtcbiAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXG4gICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJ10sXG4gICAgICBkdHM6IHRydWUsXG4gICAgfSksXG4gICAgQ29tcG9uZW50cyh7XG4gICAgICByZXNvbHZlcnM6IFtcbiAgICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcih7XG4gICAgICAgICAgaW1wb3J0U3R5bGU6ICdjc3MnLFxuICAgICAgICB9KSxcbiAgICAgICAgLy8gRWxlbWVudCBQbHVzIFx1NTZGRVx1NjgwN1x1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVxuICAgICAgICAoY29tcG9uZW50TmFtZSkgPT4ge1xuICAgICAgICAgIC8vIFx1NTMzOVx1OTE0RCBFbEljb24gXHU1RjAwXHU1OTM0XHU3Njg0XHU3RUM0XHU0RUY2XHVGRjBDXHU1OTgyIEVsSWNvblNlYXJjaFxuICAgICAgICAgIGlmIChjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ0VsSWNvbicpKSB7XG4gICAgICAgICAgICBjb25zdCBpY29uTmFtZSA9IGNvbXBvbmVudE5hbWUuc2xpY2UoNikgLy8gXHU1M0JCXHU2Mzg5IEVsSWNvbiBcdTUyNERcdTdGMDBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG5hbWU6IGljb25OYW1lLFxuICAgICAgICAgICAgICBmcm9tOiAnQGVsZW1lbnQtcGx1cy9pY29ucy12dWUnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gICAgLy8gdnVlRGV2VG9vbHMoKSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICB9LFxuICAgIGV4dGVuc2lvbnM6IFsnLm1qcycsICcuanMnLCAnLnRzJywgJy5qc3gnLCAnLnRzeCcsICcuanNvbicsICcudnVlJ10sXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVixTQUFTLGVBQWUsV0FBVztBQUV0WCxPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkI7QUFBQSxFQUNFO0FBQUEsT0FFSztBQUNQLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsb0JBQW9CO0FBVDBMLElBQU0sMkNBQTJDO0FBYXhRLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxNQUNGLFFBQVE7QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLE1BQ3BCO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxNQUNqQyxTQUFTLENBQUMsT0FBTyxZQUFZO0FBQUEsTUFDN0IsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLE1BQ1QsV0FBVztBQUFBLFFBQ1Qsb0JBQW9CO0FBQUEsVUFDbEIsYUFBYTtBQUFBLFFBQ2YsQ0FBQztBQUFBO0FBQUEsUUFFRCxDQUFDLGtCQUFrQjtBQUVqQixjQUFJLGNBQWMsV0FBVyxRQUFRLEdBQUc7QUFDdEMsa0JBQU0sV0FBVyxjQUFjLE1BQU0sQ0FBQztBQUN0QyxtQkFBTztBQUFBLGNBQ0wsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQTtBQUFBLEVBRUg7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxJQUNBLFlBQVksQ0FBQyxRQUFRLE9BQU8sT0FBTyxRQUFRLFFBQVEsU0FBUyxNQUFNO0FBQUEsRUFDcEU7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
