import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 标签项接口
export interface TabItem {
  label: string                    // 标签显示名称
  path: string                     // 路由路径
  query?: Record<string, string>   // 查询参数
}

export const useTabsStore = defineStore('tabs', () => {
  // 已访问的标签列表，默认包含首页
  const visitedTabs = ref<TabItem[]>([
    { label: '个人工作台', path: '/' }
  ])

  // 当前激活的标签路径
  const activeTabKey = ref<string>('/')

  // 生成标签唯一键（路径 + 查询参数）
  const getTabKey = (path: string, query?: Record<string, string>): string => {
    if (!query || Object.keys(query).length === 0) {
      return path
    }
    const queryStr = Object.entries(query)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `${path}?${queryStr}`
  }

  // 查找标签
  const findTab = (path: string, query?: Record<string, string>): TabItem | undefined => {
    const key = getTabKey(path, query)
    return visitedTabs.value.find(tab => getTabKey(tab.path, tab.query) === key)
  }

  // 添加标签（自动去重）
  const addTab = (tab: TabItem) => {
    const existing = findTab(tab.path, tab.query)
    if (!existing) {
      visitedTabs.value.push(tab)
    }
    // 更新激活标签
    activeTabKey.value = getTabKey(tab.path, tab.query)
  }

  // 移除标签
  const removeTab = (tab: TabItem) => {
    const key = getTabKey(tab.path, tab.query)
    const index = visitedTabs.value.findIndex(t => getTabKey(t.path, t.query) === key)

    if (index === -1 || visitedTabs.value.length <= 1) {
      return null // 不能移除最后一个标签
    }

    const isActive = activeTabKey.value === key
    visitedTabs.value.splice(index, 1)

    // 如果移除的是激活标签，切换到相邻标签
    if (isActive && visitedTabs.value.length > 0) {
      const newIndex = Math.min(index, visitedTabs.value.length - 1)
      const newActiveTab = visitedTabs.value[newIndex]
      activeTabKey.value = getTabKey(newActiveTab.path, newActiveTab.query)
      return newActiveTab // 返回新激活的标签用于导航
    }
    return null
  }

  // 判断标签是否激活
  const isActiveTab = (tab: TabItem): boolean => {
    return activeTabKey.value === getTabKey(tab.path, tab.query)
  }

  // 设置激活标签
  const setActiveTab = (path: string, query?: Record<string, string>) => {
    activeTabKey.value = getTabKey(path, query)
  }

  // 是否可以关闭标签
  const canCloseTab = (tab: TabItem): boolean => {
    // 首页不能关闭，且至少保留一个标签
    return tab.path !== '/' && visitedTabs.value.length > 1
  }

  // 重置到默认状态（登出或切换用户时调用）
  const $reset = () => {
    visitedTabs.value = [{ label: '个人工作台', path: '/' }]
    activeTabKey.value = '/'
  }

  return {
    visitedTabs,
    activeTabKey,
    getTabKey,
    findTab,
    addTab,
    removeTab,
    isActiveTab,
    setActiveTab,
    canCloseTab,
    $reset,
  }
})
