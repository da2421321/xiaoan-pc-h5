<template>
    <el-dialog v-model="dialogVisible" width="700px" :show-close="true" class="logistics-dialog !rounded-[14px]"
        custom-class="logistics-dialog">
        <template #header>
            <div class="dialog-header-bg text-center">
                <span class="text-lg font-bold text-gray-900">订单轨迹</span>
            </div>
        </template>

        <div class="px-6 pb-6">
            <div class="flex items-center bg-[#F1F2F6] rounded-lg px-4 py-3 mb-6">
                <img src="@/assets/images/trajectory.png" alt="订单" class="w-8 h-8 mr-3" />
                <div class="flex items-center text-sm">
                    <span style="color: rgba(85, 85, 85, 1);">订单号：</span>
                    <span style="color: rgba(85, 85, 85, 1);" class="font-medium mr-6">{{ orderId }}</span>
                </div>
            </div>

            <!-- 物流进度时间轴 -->
            <div class="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <el-timeline v-if="logisticsData?.length" class="logistics-timeline">
                    <el-timeline-item v-for="(activity, index) in logisticsData" :key="activity.id" :hollow="false"
                        color="#3b82f6" size="normal">
                        <div class="timeline-time">{{ activity.createDate }}</div>
                        <div class="timeline-content" :class="{ 'highlight': index === 0 }">
                            {{ activity.remark || activity.content }}
                        </div>
                    </el-timeline-item>
                </el-timeline>
                <div v-else-if="loading" class="text-center text-gray-400 py-10">
                    加载中...
                </div>
                <div v-else class="text-center text-gray-400 py-10">
                    暂无订单轨迹
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { getOrderWorkflow } from '@/api'
import { onMounted, ref, watch } from 'vue'

interface TrajectoryItem {
    id: string
    type: number
    orderId: string
    workOrderId: string | null
    preStatus: number | null
    afterStatus: number
    applyUserId: string
    content: string
    createDate: string
    remark: string
}

interface Props {
    visible: boolean
    id?: number | string
    orderId?: string
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    id: '',
    orderId: '',
})

const emit = defineEmits<{
    'update:visible': [value: boolean]
}>()

const dialogVisible = ref(props.visible)
const loading = ref(false)

const logisticsData = ref<TrajectoryItem[]>([])

const getOrderWorkflows = async (id: number | string) => {
    loading.value = true
    try {
        const res = await getOrderWorkflow(String(id))
        const data = res.data || []
        // 按照时间降序排序，最新的在最上面
        logisticsData.value = data.sort((a: TrajectoryItem, b: TrajectoryItem) => {
            return new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
        })
    } catch (error) {
        console.error('获取物流信息失败:', error)
    } finally {
        loading.value = false
    }
}

watch(() => props.visible, (newVal) => {
    dialogVisible.value = newVal
    if (newVal) {
        getOrderWorkflows(props.id)
    }
})

watch(dialogVisible, (newVal) => {
    emit('update:visible', newVal)
})

onMounted(() => {
    if (props.visible) {
        getOrderWorkflows(props.id)
    }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    @apply w-1.5;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-200 rounded;
}

.custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
}

.timeline-time {
    @apply text-blue-500 text-[13px] mb-1.5;
}

.timeline-content {
    @apply text-gray-700 text-sm leading-relaxed rounded;
}
</style>

<style>
.logistics-dialog.el-dialog {
    @apply overflow-hidden !p-0;
}

.logistics-dialog .el-dialog__header {
    @apply !p-0 !m-0;
}

.logistics-dialog .el-dialog__headerbtn {
    @apply !top-4 !right-4 z-10;
}

.logistics-dialog .dialog-header-bg {
    background-image: url('/src/assets/images/titlebg.png');
    @apply bg-cover bg-top bg-no-repeat py-5 px-6 pb-2.5 m-0;
}

.logistics-timeline.el-timeline {
    @apply pl-6;
}

.logistics-timeline .el-timeline-item__tail {
    @apply !border-l-2 !border-solid !border-blue-500;
    left: 5px;
}

.logistics-timeline .el-timeline-item__node {
    @apply bg-blue-500 left-0;
}

.logistics-timeline .el-timeline-item__wrapper {
    @apply pl-6;
    top: -3px;
}

.logistics-timeline .el-timeline-item__content {
    @apply text-gray-700;
}
</style>
