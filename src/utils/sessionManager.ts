import { useMessageStore } from '@/stores/message'
import { useOrderFormStore } from '@/stores/orderForm'
import { useTabsStore } from '@/stores/tabs'
import { useUserStore } from '@/stores/user'

/**
 * 会话管理器
 * 负责协调所有 store 的状态清理和重置，确保用户会话隔离
 */
export function useSessionManager() {
    /**
     * 清除所有会话状态（登出或 token 过期时调用）
     */
    const clearSession = (): void => {
        try {
            // 清除用户信息
            const userStore = useUserStore()
            userStore.clearUserInfo()
            userStore.removeToken()

            // 重置标签页
            const tabsStore = useTabsStore()
            tabsStore.$reset()

            // 清除订单表单数据
            const orderFormStore = useOrderFormStore()
            orderFormStore.clearAllFormData()

            // 清除消息状态
            const messageStore = useMessageStore()
            messageStore.clearState()

            // 清除 localStorage 中的 token
            localStorage.removeItem('token')

            // 清除输入历史记录缓存
            localStorage.removeItem('address_contact_history')
            localStorage.removeItem('address_phone_history')
            localStorage.removeItem('address_detail_history')
            localStorage.removeItem('address_recognition_history')
            localStorage.removeItem('service_name_history')

            // 清除地址数据缓存
            localStorage.removeItem('address_cache')
        } catch (error) {
            console.error('清除会话状态失败:', error)
        }
    }

    /**
     * 重置会话状态（登录成功后调用）
     */
    const resetSession = (): void => {
        try {
            // 重置标签页到默认状态
            const tabsStore = useTabsStore()
            tabsStore.$reset()

            // 清除订单表单数据
            const orderFormStore = useOrderFormStore()
            orderFormStore.clearAllFormData()

            // 启动消息轮询
            const messageStore = useMessageStore()
            messageStore.startPolling()
        } catch (error) {
            console.error('重置会话状态失败:', error)
        }
    }

    /**
     * 处理未授权响应（401/token 过期）
     */
    const handleUnauthorized = (): void => {
        clearSession()
    }

    return {
        clearSession,
        resetSession,
        handleUnauthorized,
    }
}
