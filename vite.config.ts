import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import {
  ElementPlusResolver,
  IconsResolver,
} from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/h5/',
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router'],
      dts: true,
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'css',
        }),
        // Element Plus 图标自动导入
        (componentName) => {
          // 匹配 ElIcon 开头的组件，如 ElIconSearch
          if (componentName.startsWith('ElIcon')) {
            const iconName = componentName.slice(6) // 去掉 ElIcon 前缀
            return {
              name: iconName,
              from: '@element-plus/icons-vue',
            }
          }
        },
      ],
    }),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
})
