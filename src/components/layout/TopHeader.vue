<template>
  <div class="main-header">
    <div class="header-content">
      <div class="flex items-center gap-4">
        <!-- 移动端汉堡菜单按钮 -->
        <div class="mobile-menu-btn cursor-pointer p-2 rounded hover:bg-gray-100 lg:hidden"
          @click="$emit('toggle-mobile-sidebar')">
          <el-icon :size="20" class="text-gray-600">
            <Menu />
          </el-icon>
        </div>
        <!-- <h4 class="page-title">小安派工管理系统</h4> -->
      </div>

      <div class="flex items-center gap-6">
        <div
          class="cursor-pointer flex items-center justify-center w-20 h-8 rounded-full hover:bg-gray-50 transition-colors"
          @click="$emit('open-drawer')">
          <el-badge :value="messageStore.unreadCount" :max="99" :hidden="messageStore.unreadCount === 0"
            class="msg-badge h-5 flex items-center">
            <el-icon :size="20" class="text-[#333]">
              <Bell />
            </el-icon>
          </el-badge>
          <span class="pl-3">消息</span>
        </div>
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="flex items-center gap-2 cursor-pointer outline-none group">
            <!-- 有头像时显示头像图片 -->
            <el-avatar v-if="userStore.avatar" :size="30" :src="userStore.avatar" />
            <!-- 无头像时显示默认图标 -->
            <el-avatar v-else :size="30" class="bg-[#317DFE] text-white flex items-center justify-center text-xs">
              <el-icon :size="16">
                <User />
              </el-icon>
            </el-avatar>
            <span class="text-[14px] text-[#333] group-hover:text-[#317DFE] transition-colors">{{ userStore.displayName
            }}</span>
            <el-icon :size="12" class="text-gray-400 group-hover:text-[#317DFE] transition-colors">
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="min-w-[120px]">
              <el-dropdown-item command="profile">
                <el-icon>
                  <User />
                </el-icon> 个人信息
              </el-dropdown-item>
              <el-dropdown-item command="changePassword">
                <el-icon>
                  <Lock />
                </el-icon> 修改密码
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon>
                  <SwitchButton />
                </el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <userinfo v-model:visible="uservisible"></userinfo>
    <change-password v-model:visible="changePasswordVisible"></change-password>

    <!-- 标签页导航 - Chrome风格 (Modern) -->
    <div class="tabs-navigation">
      <div class="tabs-container">
        <div v-for="(tab, index) in tabsStore.visitedTabs" :key="tabsStore.getTabKey(tab.path, tab.query)"
          class="chrome-tab" :class="{ active: tabsStore.isActiveTab(tab) }" @click="handleTabClick(tab)">
          <div class="tab-background">
            <div class="tab-background-content"></div>
            <div class="tab-corner-left"></div>
            <div class="tab-corner-right"></div>
          </div>

          <div
            v-if="!tabsStore.isActiveTab(tab) && index < tabsStore.visitedTabs.length - 1 && !tabsStore.isActiveTab(tabsStore.visitedTabs[index + 1])"
            class="tab-separator"></div>

          <div class="chrome-tab-content">
            <span class="chrome-tab-title">{{ tab.label }}</span>
            <span v-if="tabsStore.canCloseTab(tab)" class="chrome-tab-close" @click.stop="handleTabClose(tab)">
              <el-icon :size="12">
                <Close />
              </el-icon>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTabsStore, type TabItem } from '@/stores/tabs';
import { useUserStore } from '@/stores/user';
import { useMessageStore } from '@/stores/message';
import { useSessionManager } from '@/utils/sessionManager';
import {
  ArrowDown,
  Bell,
  Close,
  Lock,
  Menu,
  SwitchButton,
  User,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import userinfo from '../modals/userinfo.vue';
import ChangePassword from '../modals/change-password.vue';

// 使用 store
const userStore = useUserStore()
const tabsStore = useTabsStore()
const messageStore = useMessageStore()
const sessionManager = useSessionManager()

// 定义事件
defineEmits<{
  'open-drawer': []
  'toggle-mobile-sidebar': []
}>()

const route = useRoute()
const router = useRouter()
const uservisible = ref(false)
const changePasswordVisible = ref(false)

// 分类缓存（用于获取分类名称）
const categoriesCache = ref<{ id: string; name: string }[]>([])

// 获取分类数据（带缓存）
const fetchCategories = async () => {
  if (categoriesCache.value.length > 0) {
    return categoriesCache.value
  }
  try {
    const { getProjectList } = await import('@/api')
    const res = await getProjectList() as { code: string; data: { id: string; name: string }[] }
    if (res.code === '00000' && res.data) {
      categoriesCache.value = res.data
      return res.data
    }
  } catch (error) {
    console.error('获取分类信息失败:', error)
  }
  return []
}

// 点击标签切换页面
const handleTabClick = (tab: TabItem) => {
  if (tab.query && Object.keys(tab.query).length > 0) {
    router.push({ path: tab.path, query: tab.query })
  } else {
    router.push(tab.path)
  }
}

const getunread = async () => {
  // 已迁移到 messageStore.fetchUnreadCount
}

// 关闭标签
const handleTabClose = (tab: TabItem) => {
  const newActiveTab = tabsStore.removeTab(tab)
  if (newActiveTab) {
    handleTabClick(newActiveTab)
  }
}

// 同步当前路由到标签页
const syncRouteToTab = async () => {
  let currentPath = route.path
  const query = route.query as Record<string, string>

  // 获取标签名称
  let label = (route.meta?.title as string) || currentPath

  // 对于 Order 页面，尝试获取分类名称
  if (currentPath === '/Order' && query.categoryId) {
    const categories = await fetchCategories()
    const category = categories.find(item => item.id === query.categoryId)
    if (category) {
      label = `${category.name} - 快速下单`
    }
  }

  // 对于订单列表页面，统一使用基础路径，避免不同状态创建多个标签
  if (currentPath.startsWith('/order-list')) {
    currentPath = '/order-list'
  }

  tabsStore.addTab({ label, path: currentPath, query: Object.keys(query).length > 0 ? query : undefined })
}

// 监听路由变化，自动同步标签
watch(
  () => route.path + JSON.stringify(route.query),
  () => {
    if (route.path !== '/login') {
      syncRouteToTab()
    }
  },
  { immediate: true }
)

// 组件挂载时 - 消息数量已由 layout 组件统一管理
onMounted(() => {
  // 消息轮询已迁移到 layout/index.vue
})

// 下拉菜单逻辑
const handleCommand = (command: string) => {
  if (command === 'profile') {
    uservisible.value = true
  }
  if (command === 'changePassword') {
    changePasswordVisible.value = true
  }
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      sessionManager.clearSession()
      ElMessage({
        message: '退出登录成功',
        type: 'success',
      })
      router.push('/login')
    })
  }
}

</script>

<style scoped>
.main-header {
  height: auto !important;
  min-height: auto;
  padding: 0 !important;
  background: #dfe1e5;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 12px;
  background: #fff;
  border-bottom: 1px solid #dfe1e5;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* Chrome风格标签导航 */
.tabs-navigation {
  background: #F1F2F6;
  padding: 8px 8px 0 8px;
  height: 42px;
  position: relative;
  display: flex;
  align-items: flex-end;
}

.tabs-container {
  display: flex;
  align-items: flex-end;
  height: 100%;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 20px;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.chrome-tab {
  position: relative;
  height: 34px;
  max-width: 240px;
  min-width: 120px;
  margin: 0 -1px;
  cursor: pointer;
  transition: z-index 0s;
  z-index: 1;
  border-radius: 8px 8px 0 0;
}

.chrome-tab:hover {
  z-index: 2;
}

.chrome-tab.active {
  z-index: 3;
}

.tab-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.1s;
}

.chrome-tab:hover:not(.active) .tab-background {
  opacity: 1;
}

.chrome-tab:hover:not(.active) .tab-background-content {
  background: #eee;
  border-radius: 8px 8px 0 0;
  margin: 0 4px;
  height: 100%;
}

/* Active Tab Styles */
.chrome-tab.active .tab-background {
  opacity: 1;
  overflow: visible;
  /* Allow corners to spill out */
}

.chrome-tab.active .tab-background-content {
  background: #fff;
  height: 100%;
  width: 100%;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.tab-corner-left,
.tab-corner-right {
  display: none;
}

.chrome-tab.active .tab-corner-left,
.chrome-tab.active .tab-corner-right {
  display: block;
  position: absolute;
  bottom: 0;
  width: 20px;
  height: 20px;
  pointer-events: none;
  z-index: 4;
}

.chrome-tab.active .tab-corner-left {
  left: -20px;
}

.chrome-tab.active .tab-corner-right {
  right: -20px;
}

.chrome-tab.active .tab-corner-left::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-bottom-right-radius: 10px;
  box-shadow: 10px 0 0 0 #fff;
}

.chrome-tab.active .tab-corner-right::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-bottom-left-radius: 10px;
  box-shadow: -10px 0 0 0 #fff;
}

/* Separator */
.tab-separator {
  position: absolute;
  right: -1px;
  top: 25%;
  height: 50%;
  width: 1px;
  background-color: #317DFE;
  z-index: 2;
}

.chrome-tab-content {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  z-index: 5;
  width: 100%;
}

/* Title */
.chrome-tab-title {
  font-size: 12px;
  color: #5f6368;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
}

.chrome-tab.active .chrome-tab-title {
  color: #1f1f1f;
  font-weight: 500;
}

.chrome-tab-close {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  transition: all 0.2s;
}

.chrome-tab-close:hover {
  background-color: #dadce0;
  color: #000;
}

:deep(.msg-badge .el-badge__content) {
  background-color: #f56c6c;
  border: 1px solid #fff;
}

/* 响应式 */
@media (max-width: 1024px) {
  .header-content {
    padding: 0 16px;
  }
}
</style>
