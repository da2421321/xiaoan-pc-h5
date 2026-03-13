import Layout from '@/components/layout/index.vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { getUserInfo } from '@/api/user'
import { useUserStore, type UserInfo } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'layout',
    component: Layout,
    children: [
      {
        path: '/',
        name: 'workspace',
        component: () => import('@/pages/workspace/index.vue'),
        meta: { title: '个人工作台' },
      },
      {
        path: '/Order',
        name: 'Order',
        component: () => import('@/pages/category-detail/index.vue'),
        meta: { title: '创建订单' },
      },
      {
        path: '/batch-order',
        name: 'BatchOrder',
        component: () => import('@/pages/batch-order/index.vue'),
        meta: { title: '批量下单' },
      },
      {
        path: '/order-list/:type?/:status?',
        name: 'orderList',
        component: () => import('@/pages/order-list/index.vue'),
        meta: { title: '订单管理' },
        props: true,
      },
      {
        path: '/account-list',
        name: 'accountList',
        component: () => import('@/pages/account-list/index.vue'),
        meta: { title: '账号管理' },
      },
      {
        path: '/message-center',
        name: 'messageCenter',
        component: () => import('@/pages/message-center/index.vue'),
        meta: { title: '消息中心' },
      },
      {
        path: '/reconciliation',
        name: 'reconciliation',
        component: () => import('@/pages/reconciliation/index.vue'),
        meta: { title: '对账管理' },
      },
      {
        path: '/credit-management',
        name: 'creditManagement',
        component: () => import('@/pages/credit-management/index.vue'),
        meta: { title: '额度管理' },
      },
      {
        path: '/Shipping',
        name: 'Shipping',
        component: () => import('@/pages/Shipping/index.vue'),
        meta: { title: '物流查询' },
      }
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
    meta: { title: '登录' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 用户信息接口响应类型
interface UserInfoResponse {
  success: boolean
  code: string
  message: string
  data: {
    uid: number
    avatar: string
    nickname: string
    realName: string
    account: string
    isCredit: boolean
    isAdmin: number // 是否主账号: 0-子账号, 1-主账号
    bodyInfo?: {
      name: string
      address: string
    }
  }
}

// 路由守卫 - 自动获取用户信息
router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('token')

  // 如果去登录页，直接放行
  if (to.path === '/login') {
    next()
    return
  }

  // 如果没有 token，跳转登录
  if (!token) {
    next('/login')
    return
  }

  // 如果有 token 且 store 中没有用户信息，则获取
  const userStore = useUserStore()
  if (!userStore.userInfo.uid) {
    try {
      const res = await getUserInfo() as UserInfoResponse
      if (res.success && res.data) {
        const storeInfo: UserInfo = {
          uid: res.data.uid,
          avatar: res.data.avatar,
          nickname: res.data.nickname,
          realName: res.data.realName,
          account: res.data.account,
          isCredit: res.data.isCredit,
          isAdmin: res.data.isAdmin,
          bodyId: res.data.bodyId,
          bodyInfo: res.data.bodyInfo
        }
        userStore.setUserInfo(storeInfo)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  next()
})

export default router

