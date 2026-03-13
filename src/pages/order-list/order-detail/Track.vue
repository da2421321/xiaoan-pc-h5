<template>
    <el-dialog v-model="dialogVisible" width="700px" :show-close="true" class="logistics-dialog !rounded-[14px]"
        custom-class="logistics-dialog">
        <template #header>
            <div class="dialog-header-bg text-center">
                <span class="text-lg font-bold text-gray-900">物流信息</span>
            </div>
        </template>

        <div class="px-6 pb-6">
            <!-- 物流公司和运单号 -->
            <div class="flex items-center bg-[#F1F2F6] rounded-lg px-4 py-3 mb-6">
                <img src="@/assets/images/wuliu.png" alt="物流" class="w-8 h-8 mr-3" />
                <div class="flex items-center text-sm">
                    <span class="text-gray-600">物流公司：</span>
                    <span class="text-gray-900 font-medium mr-6">{{ getCompanyName(logisticsData?.trackingCompany)
                    }}</span>
                    <span class="text-gray-600">运单号：</span>
                    <span class="text-gray-900 font-medium">{{ logisticsData?.trackingNumber || '-' }}</span>
                </div>
            </div>

            <!-- 物流进度时间轴 -->
            <div class="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <el-timeline v-if="logisticsData?.kuaidiList?.length" class="logistics-timeline">
                    <el-timeline-item v-for="(activity, index) in logisticsData.kuaidiList" :key="index" :hollow="false"
                        color="#3b82f6" size="normal">
                        <div class="timeline-time">{{ activity.time }}</div>
                        <div class="timeline-content" :class="{ 'highlight': index === 0 }">
                            {{ activity.context }}
                        </div>
                    </el-timeline-item>
                </el-timeline>
                <div v-else-if="loading" class="text-center text-gray-400 py-10">
                    加载中...
                </div>
                <div v-else class="text-center text-gray-400 py-10">
                    暂无物流信息
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { getLogistics, getLogisticsCompany } from '@/api'
import { useLoadingStore } from '@/stores/loading'
import { onMounted, ref, watch } from 'vue'

const loadingStore = useLoadingStore()

interface Trace {
    time: string
    context: string
}

interface LogisticsData {
    equipmentType: string
    trackingCompany: string
    trackingNumber: string
    kuaidiList: Trace[]
}

interface LogisticsCompany {
    id: string
    name: string
    code: string
}

interface Props {
    visible: boolean
    orderId?: number | string
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    orderId: '',
})

const emit = defineEmits<{
    'update:visible': [value: boolean]
}>()

const dialogVisible = ref(props.visible)
const loading = ref(false)

const logisticsData = ref<LogisticsData | null>(null)

const companyMap = ref<LogisticsCompany[]>([])

//获取物流公司
const getLogisticsCompanydata = async () => {
    try {
        const res = await getLogisticsCompany('CourierCompany') as { code: string; data: LogisticsCompany[] }
        if (res.code === '00000' && res.data) {
            companyMap.value = res.data
        }
    } catch (error) {
        console.error('Failed to fetch logistics company data:', error)
    }
}

const getCompanyName = (code?: string) => {
    if (!code) return '-'
    const company = companyMap.value.find((item) => item.code === code)
    return company ? company.name : code
}

const getLogisticsData = async () => {
    if (!props.orderId) return

    loadingStore.show()
    logisticsData.value = null
    try {
        const res = await getLogistics(String(props.orderId)) as { code: string; data: LogisticsData }
        if (res.code === '00000' && res.data) {
            logisticsData.value = res.data
        }
    } catch (error) {
        console.error('Failed to fetch logistics data:', error)
    } finally {
        loadingStore.hide()
    }
}

watch(() => props.visible, (newVal) => {
    dialogVisible.value = newVal
    if (newVal) {
        getLogisticsData()
        getLogisticsCompanydata()
    }
})

watch(dialogVisible, (newVal) => {
    emit('update:visible', newVal)
})

onMounted(() => {
    if (props.visible) {
        getLogisticsData()
        getLogisticsCompanydata()
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

.timeline-content.highlight {
    @apply border border-dashed border-red-500 bg-red-50;
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
    @apply !border-l-2 !border-dashed !border-blue-500;
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
