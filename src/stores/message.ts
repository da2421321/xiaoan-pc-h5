import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadMessageCount } from '@/api'

export const useMessageStore = defineStore('message', () => {
    // 未读消息数量
    const unreadCount = ref<number>(0)

    // 定时器引用
    let pollingTimer: ReturnType<typeof setInterval> | null = null

    // 轮询间隔：5分钟
    const POLLING_INTERVAL = 5 * 60 * 1000

    // 获取未读消息数量
    const fetchUnreadCount = async (): Promise<void> => {
        try {
            const res = (await getUnreadMessageCount()) as { code: string; data: number }
            if (res.code === '00000') {
                unreadCount.value = res.data
            }
        } catch (error) {
            console.error('获取未读消息数量失败:', error)
        }
    }

    // 减少未读数量（标记单条已读）
    const decrementCount = (): void => {
        if (unreadCount.value > 0) {
            unreadCount.value--
        }
    }

    // 重置未读数量（一键已读）
    const resetCount = (): void => {
        unreadCount.value = 0
    }

    // 启动定时轮询
    const startPolling = (): void => {
        // 先立即获取一次
        fetchUnreadCount()

        // 清除已有定时器
        if (pollingTimer) {
            clearInterval(pollingTimer)
        }

        // 启动新定时器
        pollingTimer = setInterval(() => {
            fetchUnreadCount()
        }, POLLING_INTERVAL)
    }

    // 停止定时轮询
    const stopPolling = (): void => {
        if (pollingTimer) {
            clearInterval(pollingTimer)
            pollingTimer = null
        }
    }

    // 清除状态（退出登录时调用）
    const clearState = (): void => {
        stopPolling()
        unreadCount.value = 0
    }

    return {
        unreadCount,
        fetchUnreadCount,
        decrementCount,
        resetCount,
        startPolling,
        stopPolling,
        clearState,
    }
})
