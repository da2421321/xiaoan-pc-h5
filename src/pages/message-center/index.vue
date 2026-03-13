<template>
  <el-drawer v-model="drawerVisible" class="message-drawer" size="350px" @close="handleClose">
    <template #header>
      <div class="flex flex-col">
        <h4 class="m-0 text-lg font-semibold text-[#333] text-left h-[50px]">消息中心</h4>
        <div class="flex items-center justify-between gap-3 h-10">
          <div class="flex items-center gap-2">
            <el-checkbox v-model="showUnreadOnly" @change="handleUnreadFilterChange">只看未读</el-checkbox>
          </div>
          <div class="cursor-pointer text-blue-500 hover:text-blue-600" @click="markAllAsRead">
            一键已读
          </div>
        </div>
      </div>
    </template>
    <div class="font-[system-ui] bg-[#f5f5f5] h-full">
      <!-- 消息列表 -->
      <div class="model p-3 px-4 h-full overflow-y-auto overflow-x-hidden" @scroll="handleScroll" ref="messageListRef">
        <div v-for="message in filteredMessages" :key="message.id"
          class="flex items-start gap-3 p-4 pl-5 bg-white rounded-xl mb-3 cursor-pointer transition-all duration-200 relative overflow-hidden hover:bg-[#fafafa]"
          :class="{ unread: message.readFlag === 0 }" @click="markAsRead(message.id)">

          <!-- 消息图标 -->
          <div class="relative shrink-0 mt-[2px]">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[linear-gradient(135deg,#4a90d9_0%,#317dfe_100%)]">
              <img src="@/assets/images/message.png" alt="message-icon" class="w-4 h-4" />
            </div>
            <!-- 未读标识 -->
            <div v-if="message.readFlag === 0"
              class="absolute -top-[2px] -right-[2px] w-[10px] h-[10px] bg-[#ff4d4f] rounded-full border-2 border-white">
            </div>
          </div>

          <!-- 消息内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-2 gap-3">
              <div class="text-[15px] font-medium text-[#333] leading-[1.4] flex-1 min-w-0">{{ message.title }}</div>
              <div class="shrink-0 text-xs text-[#999] whitespace-nowrap">{{ formatTime(message.createTime) }}</div>
            </div>
            <div class="text-[13px] text-[#666] leading-[1.5] break-words line-clamp-2">{{ message.content }}</div>
          </div>
        </div>

        <!-- 加载状态提示 -->
        <div v-if="loading" class="flex items-center justify-center gap-2 text-center p-5 text-[#999] text-sm">
          <span class="w-4 h-4 border-2 border-[#f3f3f3] border-t-[#317dfe] rounded-full animate-spin"></span>
          <span>加载中...</span>
        </div>
        <div v-else-if="!hasMore && messages.length > 0" class="text-center p-5 text-[#999] text-sm">没有更多消息了</div>
        <div v-else-if="messages.length === 0" class="text-center py-[60px] px-5 text-[#ccc] text-base">暂无消息</div>
      </div>
      <el-dialog v-model="dialogVisible" width="35%" class="messagedialog !rounded-[10px]">
        <template #header>
          <div
            class="w-full flex flex-col justify-center items-center font-medium text-lg text-[#317dfe] pl-5 dialog-header-bg">
            <div class="h-12">消息详情</div>
          </div>
        </template>
        <div class="flex flex-col gap-1 justify-center items-center w-full p-6">
          <div class="text-[#999] text-sm text-center">{{ message.createTime }}</div>
          <div class="text-[#313745] text-base leading-7 text-center px-4 break-words">
            {{ message.content }}
          </div>
        </div>
        <template #footer>
          <div class="flex justify-center mb-6">
            <el-button
              class="w-[160px] !bg-[#efefef] !border-[#efefef] !text-[#333] !h-[35px] !rounded-md hover:!bg-[#dcdcdc] hover:!border-[#dcdcdc]"
              @click="dialogVisible = false">关闭</el-button>
            <el-button
              class="w-[160px] !bg-[#317dfe] !border-[#317dfe] !text-white !h-[35px] !rounded-md hover:!bg-[#286ee6] hover:!border-[#286ee6]"
              @click="handleOrderDetail">
              查看订单详情
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 订单详情弹窗 -->
      <OrderDetailModal v-model:visible="orderDetailVisible" :order-id="currentOrderId" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { getMessageDetail, getMessageList, setAllMessageRead, setMessageRead } from '@/api'
import OrderDetailModal from '@/pages/order-list/order-detail/OrderDetailModal.vue'
import { useMessageStore } from '@/stores/message'
import { computed, onMounted, ref } from 'vue'
interface Message {
  id: number
  title: string
  content: string
  createTime: string
  readFlag: number
  type: string
  orderId?: string
}

defineOptions({
  name: 'MessageCenter',
})

// 使用消息 store
const messageStore = useMessageStore()

// Props
interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'mark-all-read': []
}>()

// 抽屉显示控制
const drawerVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
})

// 关闭抽屉
const handleClose = () => {
  emit('update:visible', false)
}

// 只看未读控制
const showUnreadOnly = ref(false)

const handleUnreadFilterChange = () => {
  console.log('Filter changed:', showUnreadOnly.value)
}

const dialogVisible = ref<boolean>(false)
const orderDetailVisible = ref<boolean>(false)
const currentOrderId = ref<number | string>('')
const message = ref<Message>({
  id: 0,
  title: '',
  content: '',
  createTime: '',
  readFlag: 0,
  type: '',
  orderId: '',
})
const messages = ref<Message[]>([])
const messageListRef = ref<HTMLElement | null>(null)

const filteredMessages = computed(() => {
  if (showUnreadOnly.value) {
    return messages.value.filter((message: Message) => message.readFlag === 0)
  }
  return messages.value
})

// 分页相关状态
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const loading = ref<boolean>(false)
const hasMore = ref<boolean>(true)

const getMessageListData = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true
  try {
    const res = await getMessageList({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
    }) as { code: string; data: { rows: Message[] } }
    if (res.code === '00000' && res.data) {
      if (isLoadMore) {
        // 加载更多时，追加数据
        messages.value = [...messages.value, ...res.data.rows]
      } else {
        // 首次加载或刷新时，替换数据
        messages.value = res.data.rows
      }

      hasMore.value = res.data.rows.length === pageSize.value
    }
  } finally {
    loading.value = false
  }
}

// 滚动事件处理
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  // 当滚动到距离底部 100px 时触发加载
  if (scrollHeight - scrollTop - clientHeight < 100 && hasMore.value && !loading.value) {
    loadMore()
  }
}

// 加载更多
const loadMore = () => {
  currentPage.value++
  getMessageListData(true)
}

// 标记单条消息为已读
const markAsRead = async (messageId: number) => {
  const res = await setMessageRead({ id: Number(messageId) }) as { code: string }
  if (res.code === '00000') {
    // 更新 store 中的未读数量
    messageStore.decrementCount()
    // 重置分页并刷新列表
    currentPage.value = 1
    hasMore.value = true
    getMessageListData()
  }
  dialogVisible.value = true
  getMessageDetailData(messageId)
}
const getMessageDetailData = async (messageId: number) => {
  const res = await getMessageDetail(String(messageId)) as { code: string; data: Message }
  if (res.code === '00000') {
    message.value = res.data
  }
}
// 一键标记所有消息为已读
const markAllAsRead = async () => {
  const res = await setAllMessageRead() as { code: string }
  if (res.code === '00000') {
    // 重置 store 中的未读数量为 0
    messageStore.resetCount()
    currentPage.value = 1
    hasMore.value = true
    getMessageListData()
    emit('mark-all-read')
  }
}

// 查看订单详情
const handleOrderDetail = () => {
  if (message.value.orderId) {
    dialogVisible.value = false
    currentOrderId.value = message.value.orderId
    orderDetailVisible.value = true
  } else {
    console.warn('该消息没有关联的订单ID')
  }
}

// 格式化时间显示
const formatTime = (timestamp: string) => {
  return timestamp
}
onMounted(() => {
  getMessageListData()
})

// Expose methods to parent component
defineExpose({
  markAllAsRead,
})
</script>

<style>
.message-drawer .el-drawer__body {
  padding: 0 !important;
  background-color: #f5f5f5 !important;
}

.messagedialog.el-dialog {
  @apply overflow-hidden !p-0;
}

.messagedialog .el-dialog__header {
  @apply !p-0 !m-0;
}

.messagedialog .el-dialog__headerbtn {
  @apply !top-4 !right-4 z-10;
}

.messagedialog .dialog-header-bg {
  background-image: url('/src/assets/images/titlebg.png');
  @apply bg-cover bg-top bg-no-repeat py-5 px-6 pb-2.5 m-0;
}

.message-drawer .el-drawer__header {
  margin-bottom: 0 !important;
  border-bottom: 1px solid #f5f5f5 !important;
  padding: 20px 20px 10px 20px !important;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.message-drawer .el-drawer__close-btn {
  position: relative !important;
  top: 0 !important;
  right: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
