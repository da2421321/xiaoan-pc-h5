import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 用户信息类型
export interface UserInfo {
  uid?: number
  avatar?: string
  nickname?: string
  realName?: string
  account?: string
  isCredit?: boolean
  isAdmin?: number // 是否主账号: 0-子账号, 1-主账号
  bodyId?: string // 主体ID
  bodyInfo?: {
    name?: string
    address?: string
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<UserInfo>({})
  const setToken = (t: string) => {
    token.value = t
  }

  const removeToken = () => {
    token.value = ''
  }

  const getToken = computed(() => token.value)

  // 设置用户信息
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  // 获取用户显示名称（优先真实姓名，其次昵称）
  const displayName = computed(() => {
    return userInfo.value.realName || userInfo.value.nickname || '-'
  })

  // 获取用户头像
  const avatar = computed(() => userInfo.value.avatar || '')

  // 获取公司名称
  const companyName = computed(() => userInfo.value.bodyInfo?.name || '-')

  // 是否主账号
  const isAdmin = computed(() => userInfo.value.isAdmin === 1)

  // 清除用户信息
  const clearUserInfo = () => {
    userInfo.value = {}
  }

  return {
    token,
    userInfo,
    setToken,
    getToken,
    removeToken,
    setUserInfo,
    displayName,
    avatar,
    companyName,
    isAdmin,
    clearUserInfo,
  }
})
