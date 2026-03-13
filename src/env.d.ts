/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>
  >
  export default component
}

// Vite 环境变量类型定义
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_PREFIX: string
  readonly VITE_API_URL: string
  readonly VITE_APP_SSO_HOST: string
  readonly VITE_APP_SSO_ID: string
  readonly VITE_APP_BACKEND_HOST: string
  readonly VITE_DEV_TEST_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Vue 编译器宏全局声明
declare global {
  const defineProps: (typeof import('vue'))['defineProps']
  const defineEmits: (typeof import('vue'))['defineEmits']
  const defineExpose: (typeof import('vue'))['defineExpose']
  const withDefaults: (typeof import('vue'))['withDefaults']
  const defineOptions: (typeof import('vue'))['defineOptions']
}

export {}
