import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const visible = ref(false)
  const text = ref('加载中，请稍后')

  function show(message?: string) {
    text.value = message || '加载中，请稍后'
    visible.value = true
  }

  function hide() {
    visible.value = false
  }

  return {
    visible,
    text,
    show,
    hide
  }
})
