<template>
    <div class="bg-white pb-4 h-full flex flex-col">
        <div class="mb-6">
            <div class="text-lg font-semibold px-6 pt-4 pb-2">物流查询</div>
            <div class="mx-6 h-[3px] bg-[#F1F2F6] mb-3"></div>
            <div class="mx-6 flex gap-3 items-center">
                <el-input v-model="trackingNumber" type="text" placeholder="请输入快递单号"
                    class="max-w-[300px] py-1 rounded-lg text-base transition-colors duration-300"
                    @keyup.enter="queryLogistics" />
                <el-select v-model="trackingCompanyCode" placeholder="请选择快递公司" class="max-w-[300px] py-1 rounded-lg">
                    <el-option v-for="company in companyMap" :key="company.code" :label="company.name"
                        :value="company.code" />
                </el-select>
                <el-button @click="queryLogistics" class="!w-20 !h-8 !bg-[#317DFE] !text-white !rounded-md">
                    搜索
                </el-button>
                <el-button @click="resetQuery" style="background-color: rgba(205, 212, 218, 1)"
                    class="!w-20 !h-8 !text-[#333]">
                    重置
                </el-button>
            </div>
        </div>

        <template v-if="logisticsData">
            <div class="flex items-center bg-[#F1F2F6] rounded-lg mx-6 px-4 py-3 mb-6">
                <img src="@/assets/images/wuliu.png" alt="物流" class="w-8 h-8 mr-3" />
                <div class="flex items-center text-sm">
                    <span class="text-gray-600">物流公司：</span>
                    <span class="text-gray-900 font-medium mr-6">{{ getCompanyName(logisticsData.companyName)
                        }}</span>
                    <span class="text-gray-600">运单号：</span>
                    <span class="text-gray-900 font-medium">{{ logisticsData.trackingNumber || '-' }}</span>
                </div>
            </div>
            <div class="max-h-[400px] overflow-y-auto pl-3 custom-scrollbar">
                <el-timeline v-if="logisticsData.list?.length" style="max-width: 600px" class="logistics-timeline">
                    <el-timeline-item v-for="(activity, index) in logisticsData.list" :key="index">
                        <div class="timeline-time">{{ activity.ftime }}</div>
                        <div class="timeline-content" :class="{ 'highlight': index === 0 }">
                            {{ activity.context }}
                        </div>
                    </el-timeline-item>
                </el-timeline>
                <div v-else class="text-center text-gray-400 py-10">
                    暂无物流信息
                </div>
            </div>
        </template>
        <div v-else class="py-10 text-gray-400 flex items-center flex-col mx-6">
            <img :src="emptyImage" alt="empty" class="w-16 h-16 mb-4" />
            <div class="text-sm">{{ hasSearched ? '没有搜索到此物流' : '请输入物流单号' }}</div>
        </div>

        <loading :visible="loading" text="查询中..." />
    </div>
</template>

<script setup lang="ts" name="LogisticsQuery">
import { ref, computed, onMounted } from 'vue'
import { getLogisticsCompany, getLogisticsQuery } from '@/api'
import Loading from '@/components/modals/loading.vue'

interface Trace {
    ftime: string
    context: string
}

interface LogisticsData {
    equipmentType: string
    companyName: string
    trackingNumber: string
    list: Trace[]
}

interface LogisticsCompany {
    id: string
    name: string
    code: string
}

const loading = ref(false)
const trackingNumber = ref('')
const trackingCompanyCode = ref('')
const logisticsData = ref<LogisticsData | null>(null)
const companyMap = ref<LogisticsCompany[]>([])
const hasSearched = ref(false)
const emptyImage = new URL('@/assets/images/empty.png', import.meta.url).href

const canQuery = computed(() => trackingNumber.value.trim())

// 获取物流公司列表
const getLogisticsCompanyData = async () => {
    try {
        const res = await getLogisticsCompany('CourierCompany') as { code: string; data: LogisticsCompany[] }
        if (res.code === '00000' && res.data) {
            companyMap.value = res.data

        }
    } catch (error) {
        console.error('获取物流公司列表失败:', error)
    }
}

// 根据code获取物流公司名称
const getCompanyName = (code?: string) => {
    if (!code) return '-'
    console.log("code", code)
    const company = companyMap.value.find((item) => item.code === code)
    return company ? company.name : code
}
// 查询物流信息
const queryLogistics = async () => {
    if (!canQuery.value) return

    loading.value = true
    logisticsData.value = null
    hasSearched.value = true

    try {
        const res = await getLogisticsQuery({
            companyName: getCompanyName(trackingCompanyCode.value),
            trackingNumber: trackingNumber.value,
            companyCode: trackingCompanyCode.value
        }) as { code: string; data: LogisticsData }
        if (res.code === '00000' && res.data) {
            logisticsData.value = res.data
        }
    } catch (error) {
        console.error('查询物流信息失败:', error)
    } finally {
        loading.value = false
    }
}

// 重置查询
const resetQuery = () => {
    trackingNumber.value = ''
    logisticsData.value = null
    hasSearched.value = false
}

onMounted(() => {
    getLogisticsCompanyData()
})
</script>
<style scoped>
.logistics-timeline .el-timeline-item__tail {
    @apply !border-l-2 !border-dashed !border-blue-500;
    left: 5px;
}

.logistics-timeline .el-timeline-item__node {
    @apply bg-blue-500 left-0;
}

.timeline-time {
    @apply text-blue-500 text-[13px] mb-1.5;
}

.timeline-content {
    @apply text-gray-700 text-sm leading-relaxed rounded p-1;
}

.timeline-content.highlight {
    @apply border border-dashed border-red-500 bg-red-50;
}
</style>