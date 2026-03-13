<template>
    <el-dialog v-model="dialogVisible" width="800px" class="!rounded-[20px]" :show-close="true">
        <template #header>
            <div>
                <span class="text-[18px] font-medium">授信额度明细</span>
                <p class="text-[14px] text-[#317DFE] pt-1">查看授信额度使用记录和明细</p>
            </div>
        </template>

        <!-- 额度信息卡片 -->
        <div class="flex items-center h-24 bg-[#F9FAFB] rounded-lg p-6 gap-4 border border-gray-100">
            <div class="flex-1">
                <p class="text-[14px] text-gray-500 mb-2">授信总额度</p>
                <p class="text-[28px] font-semibold text-gray-800">¥{{ formatMoney(totalCredit) }}</p>
            </div>

            <div class="flex-1">
                <p class="text-[14px] text-gray-500 mb-2">剩余可用额度</p>
                <p class="text-[28px] font-semibold text-[#317DFE]">¥{{ formatMoney(availableCredit) }}</p>
            </div>
        </div>

        <!-- 使用记录 -->
        <div class="pt-6">
            <div class="flex items-center">
                <p class="text-[14px] font-medium text-gray-700">授信额度使用记录</p>
                <el-input v-model="searchKeyword" class="ml-auto !w-52" placeholder="搜索..." clearable>
                    <template #suffix>
                        <el-icon class="text-gray-400">
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
                <el-button class="ml-3" @click="handleExport">
                    <el-icon class="mr-1">
                        <Download />
                    </el-icon>
                    导出
                </el-button>
            </div>

            <!-- 表格 -->
            <div class="mt-4">
                <el-table :data="filteredRecords" style="width: 100%"
                    :header-cell-style="{ background: '#F8FAFC', color: '#64748B' }">
                    <el-table-column prop="transactionTime" label="交易时间" width="180" />
                    <el-table-column prop="amount" label="使用额度" width="120">
                        <template #default="{ row }">
                            <span :class="row.amount > 0 ? 'text-green-500' : 'text-red-500'">
                                {{ row.amount > 0 ? '+' : '' }}{{ row.amount.toFixed(2) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="scene" label="使用场景" min-width="200" />
                    <el-table-column prop="operator" label="操作人" width="100" />
                </el-table>

                <!-- 分页 -->
                <div class="flex items-center justify-between mt-4 text-[14px] text-gray-500">
                    <span>显示 {{ startIndex }} 到 {{ endIndex }} 条，共 {{ total }} 条记录</span>
                    <div class="flex items-center gap-2">
                        <span>每页显示:</span>
                        <el-select v-model="pageSize" class="!w-20" size="small">
                            <el-option :value="5" label="5" />
                            <el-option :value="10" label="10" />
                            <el-option :value="20" label="20" />
                        </el-select>
                        <span>条</span>
                        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total"
                            background layout="prev, pager, next" :pager-count="5" />
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { Search, Download } from '@element-plus/icons-vue'

interface CreditRecord {
    transactionTime: string
    amount: number
    scene: string
    operator: string
}

const props = defineProps<{
    visible: boolean
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
})

// 额度数据
const totalCredit = ref(100000)
const availableCredit = ref(65000)

// 搜索和分页
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(216)

// 模拟数据
const records = ref<CreditRecord[]>([
    { transactionTime: '2025-11-07 20:48:15', amount: 20.00, scene: '完全解冻金额 [20.0000].', operator: '小安系统' },
    { transactionTime: '2025-11-05 23:25:58', amount: 100.00, scene: '完全解冻金额 [100.0000].', operator: '小安系统' },
    { transactionTime: '2025-11-04 16:59:31', amount: 0.01, scene: '完全解冻金额 [0.0100].', operator: '小安系统' },
    { transactionTime: '2025-11-08 07:58:00', amount: -11.11, scene: '授信客户额度下单', operator: '小安系统' },
    { transactionTime: '2025-11-08 07:53:39', amount: -10.00, scene: '授信客户额度下单', operator: '小安系统' },
])

// 过滤后的记录
const filteredRecords = computed(() => {
    if (!searchKeyword.value) return records.value
    const keyword = searchKeyword.value.toLowerCase()
    return records.value.filter(r =>
        r.scene.toLowerCase().includes(keyword) ||
        r.operator.toLowerCase().includes(keyword) ||
        r.transactionTime.includes(keyword)
    )
})

// 分页计算
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, total.value))

// 格式化金额
const formatMoney = (value: number) => {
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 导出
const handleExport = () => {
    console.log('导出数据')
}

watch(() => props.visible, (val) => {
    if (val) {
        currentPage.value = 1
        searchKeyword.value = ''
    }
})
</script>

<style scoped>
:deep(.el-dialog__header) {
    padding-bottom: 10px;
    border-bottom: none;
}

:deep(.el-table th.el-table__cell) {
    background-color: #f8fafc;
    color: #64748b;
    font-weight: 500;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
    background-color: #317DFE;
}

:deep(.el-input__wrapper) {
    border-radius: 8px;
}

:deep(.el-select .el-input__wrapper) {
    border-radius: 4px;
}
</style>
