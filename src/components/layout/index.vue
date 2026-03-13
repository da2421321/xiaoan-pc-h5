<template>
  <div class="common-layout">
    <div v-if="mobileSidebarOpen" class="mobile-overlay lg:hidden" @click="closeMobileSidebar"></div>

    <el-container>
      <!-- 左侧边栏 -->
      <el-aside width="200px" class="sidebar" :class="{ 'mobile-open': mobileSidebarOpen }">
        <div class="sidebar-header">
          <div class="flex items-center gap-3 cursor-pointer select-none" @click="router.push('/')">
            <img src='/src/assets/images/logo.png' />
          </div>
        </div>

        <nav class="sidebar-nav">
          <div v-for="item in filteredMenuItems" :key="item.path">
            <!-- 父菜单项 -->
            <div @click="item.children ? toggleMenuExpand(item.path) : navigateTo(item.path)" class="nav-item"
              :class="isMenuItemActive(item) ? 'active' : ''">
              <img :src="item.icon" class="w-4 h-4" />
              <span class="flex-1">{{ item.label }}</span>
              <el-icon v-if="item.children" :size="14" class="transition-transform duration-200"
                :class="isMenuExpanded(item.path) ? 'rotate-90' : ''">
                <ArrowRight />
              </el-icon>
            </div>

            <!-- 子菜单 -->
            <div v-if="item.children" class="submenu" :class="{ expanded: isMenuExpanded(item.path) }">
              <!-- 加载状态 -->
              <div v-if="loading" class="submenu-item text-white/50">
                <span>加载中...</span>
              </div>
              <!-- 正常子菜单 -->
              <div v-else v-for="child in item.children" :key="child.path" @click="handleChildMenuClick(child)"
                class="submenu-item" :class="isActive(child) ? 'active' : ''">
                <span>{{ child.label }}</span>
              </div>
              <!-- 无数据状态 -->
              <div v-if="!loading && item.children.length === 0 && item.path === '/quick-order'"
                class="submenu-item text-white/50">
                <span>暂无分类</span>
              </div>
            </div>
          </div>
        </nav>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <el-header class="main-header">
          <TopHeader @open-drawer="drawer = true" @toggle-mobile-sidebar="toggleMobileSidebar" />
        </el-header>

        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <keep-alive :include="keepAliveInclude">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>

    <!-- 消息抽屉 -->
    <MessageCenter v-model:visible="drawer" />

    <!-- 分类选择弹窗 -->
    <CategoryModal v-model="showCategoryModal" />
  </div>
</template>
<script setup lang="ts">
import { getProjectList } from '@/api'
import CategoryModal from '@/components/modals/CategoryModal.vue'
import MessageCenter from '@/pages/message-center/index.vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopHeader from './TopHeader.vue'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'

// 导入菜单图标图片
import MonitorIcon from '@/assets/images/Monitor.png'
import DocumentIcon from '@/assets/images/Document.png'
import WalletIcon from '@/assets/images/Wallet.png'
import UserIcon from '@/assets/images/User.png'
import MemoIcon from '@/assets/images/Memo.png'
import edu from '@/assets/images/edu.png'
import ShippingIcon from '@/assets/images/shipping.svg'
defineOptions({
  name: 'IndexPage',
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const messageStore = useMessageStore()
const drawer = ref(false)
const mobileSidebarOpen = ref(false)
const expandedMenus = ref<string[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const showCategoryModal = ref(false)

// keep-alive 缓存控制：退出登录时清空，登录后恢复
const keepAliveInclude = ref<string[]>(['CategoryDetail'])

watch(() => route.path, (newPath: string) => {
  if (newPath === '/login') {
    keepAliveInclude.value = []
  } else if (keepAliveInclude.value.length === 0) {
    nextTick(() => {
      keepAliveInclude.value = ['CategoryDetail']
    })
  }
})



// 分类接口定义
interface Category {
  id: string
  name: string
  icon?: string
  title?: string
  subtitle?: string
}

// 菜单项接口定义
interface MenuItem {
  label: string
  path: string
  categoryId?: string
  icon?: string
  children?: MenuItem[]
  isViewAll?: boolean
}

// 仅管理员可见的菜单路径
const adminOnlyPaths = ['/reconciliation', '/account-list', '/credit-management']

// 菜单项配置
const menuItems = ref<MenuItem[]>([
  { label: '个人工作台', path: '/', icon: MonitorIcon },
  { label: '订单管理', path: '/order-list', icon: DocumentIcon },
  { label: '对账管理', path: '/reconciliation', icon: WalletIcon },
  { label: '账号管理', path: '/account-list', icon: UserIcon },
  { label: '额度管理', path: '/credit-management', icon: edu },
  {
    label: '快速下单',
    path: '/quick-order',
    icon: MemoIcon,
    children: [],
  },
  {
    label: '物流查询',
    path: '/Shipping',
    icon: ShippingIcon,
  }
])

// 根据用户权限过滤菜单
const filteredMenuItems = computed(() => {
  if (userStore.isAdmin) {
    return menuItems.value
  }
  return menuItems.value.filter((item) => !adminOnlyPaths.includes(item.path))
})

const isActive = (item: MenuItem | string) => {
  const path = typeof item === 'string' ? item : item.path
  const categoryId = typeof item === 'string' ? undefined : item.categoryId

  if (path === '/') {
    return route.path === '/'
  }
  if (path === '/Order') {
    return route.path === '/Order' && String(route.query.categoryId) === String(categoryId)
  }
  return route.path.startsWith(path)
}

// 判断菜单项是否应该高亮
const isMenuItemActive = (item: MenuItem) => {
  if (isActive(item)) {
    return true
  }
  // 检查是否有子菜单被选中
  if (item.children) {
    return item.children.some((child: MenuItem) => isActive(child))
  }
  return false
}

// 切换移动端侧边栏
const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

const initializeExpandedMenus = () => {
  const expanded: string[] = []
  menuItems.value.forEach((item) => {
    if (item.children && isMenuItemActive(item)) {
      expanded.push(item.path)
    }
  })
  expandedMenus.value = expanded
}

// 切换菜单展开状态
const toggleMenuExpand = (path: string) => {
  const index = expandedMenus.value.indexOf(path)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(path)
  }
}

// 判断菜单是否展开
const isMenuExpanded = (path: string) => {
  return expandedMenus.value.includes(path)
}

// 获取项目分类数据
const fetchCategoriesAndUpdateMenu = async () => {
  try {
    loading.value = true
    const res = await getProjectList() as { code: string; data: Category[] }
    if (res.code === '00000') {
      categories.value = res.data
      const quickOrderItem = menuItems.value.find((item) => item.path === '/quick-order')
      if (quickOrderItem) {
        // 添加批量下单子菜单
        const categoryChildren: MenuItem[] = [

        ]

        // 添加分类子菜单
        const remoteChildren = categories.value.map((category) => ({
          label: category.name,
          path: '/Order',
          categoryId: category.id,
        }))

        categoryChildren.push(...remoteChildren)

        // 添加查看所有选项
        categoryChildren.push({
          label: '查看所有',
          path: '/view-all',
          categoryId: undefined,
          isViewAll: true,
        } as MenuItem)
        categoryChildren.push({
          label: '批量下单',
          path: '/batch-order',
        })
        quickOrderItem.children = categoryChildren
      }
    } else {
      console.error('API返回错误:', res)
    }
  } catch (error) {
    console.error('获取项目分类失败:', error)
  } finally {
    loading.value = false
  }
}

// 路由跳转
const navigateTo = (path: string) => {
  router.push(path)
  closeMobileSidebar()
}

const handleChildMenuClick = (child: MenuItem) => {
  if (child.isViewAll) {
    showCategoryModal.value = true
  } else if ('categoryId' in child) {
    router.push({
      path: '/Order',
      query: {
        categoryId: (child as any).categoryId,
      },
    })
  } else {
    navigateTo(child.path)
  }
  closeMobileSidebar()
}


onMounted(() => {
  initializeExpandedMenus()
  fetchCategoriesAndUpdateMenu()
  messageStore.startPolling()
})

onUnmounted(() => {
  messageStore.stopPolling()
})
</script>
<style scoped>
.common-layout {
  height: 100vh;
  background-color: #f5f7fa;
}

.el-container {
  height: 100%;
}

.sidebar {
  background: rgba(38, 80, 159, 1);
  border-right: none;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
  /* 隐藏滚动条但保留功能 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
}

.sidebar::-webkit-scrollbar {
  display: none;
  /* Chrome/Safari */
}

.sidebar-header {
  padding: 24px 20px;
}

.sidebar-nav {
  padding: 10px 14px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item.active {
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.nav-item .el-icon {
  flex-shrink: 0;
}

/* 子菜单样式 */
.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.submenu.expanded {
  max-height: 300px;
}

.submenu-item {
  display: flex;
  flex-direction: column;
  padding: 10px 20px 10px 52px;
  margin: 2px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  position: relative;
}

.submenu-item::after {
  content: '';
  position: absolute;
  left: 1px;
  right: 1px;
  bottom: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
}

.submenu-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.submenu-item.active {
  color: #ffffff;
  font-weight: 500;
}

/* 箭头旋转动画 */
.rotate-90 {
  transform: rotate(90deg);
}

/* 顶部栏样式 */
.main-header {
  height: auto !important;
  padding: 0 !important;
}

/* 主内容区样式 */
.main-content {
  padding: 0 !important;
  background-color: #f5f7fa;
}

/* 移动端遮罩层 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px !important;
  }
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: -240px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
  }

  .sidebar.mobile-open {
    left: 0;
  }
}
</style>
