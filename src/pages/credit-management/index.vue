<template>
    <div class="bg-white pb-4 h-full flex flex-col overflow-auto">
        <div class="text-lg font-semibold px-6 pt-4 pb-2">额度管理</div>
        <div class="mx-6 h-[3px] bg-[#F1F2F6] mb-3"></div>

        <!-- 统计卡片区域 -->
        <div class="grid grid-cols-3 gap-6 px-6 mb-6">
            <div class="bg-[#EEF2FF] rounded-lg p-6 flex items-center">
                <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <div>
                    <div class="text-gray-500 text-sm mb-1">授信总额度</div>
                    <div class="text-2xl font-bold">¥{{ (stats.creditLimit || 0).toLocaleString() }}</div>
                </div>
            </div>
            <div class="bg-[#FFF7ED] rounded-lg p-6 flex items-center">
                <div class="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center mr-4 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </div>
                <div>
                    <div class="text-gray-500 text-sm mb-1">已使用额度</div>
                    <div class="text-2xl font-bold">¥{{ (stats.usedCredit || 0).toLocaleString() }}</div>
                </div>
            </div>
            <div class="bg-[#ECFDF5] rounded-lg p-6 flex items-center">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <div class="text-gray-500 text-sm mb-1">剩余可用额度</div>
                    <div class="text-2xl font-bold">¥{{ (stats.availableCredit || 0).toLocaleString() }}</div>
                </div>
            </div>
        </div>

        <div class="text-base font-semibold px-6 mb-4 flex items-center">
            <div class="w-1 h-4 bg-blue-500 mr-2 rounded"></div>
            授信额度使用记录
        </div>

        <!-- 搜索区域 -->
        <div class="flex flex-wrap items-center justify-between mb-4 px-6">
            <div class="flex flex-wrap items-center gap-2">
                <el-input v-model="form.keyword" placeholder="请输入订单号、操作人" clearable style="width: 220px" />
                <el-date-picker v-model="form.dateRange" type="daterange" range-separator="-"
                    start-placeholder="选择时间 (开始)" end-placeholder="选择时间 (结束)" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD" clearable style="width: 280px" />
                <el-button type="primary" @click="handleSearch"
                    class="ml-2 !bg-[#3b82f6] !border-[#3b82f6]">搜索</el-button>
                <el-button @click="handleReset" class="!bg-[#e2e8f0] !border-[#e2e8f0] !text-gray-600">重置</el-button>
            </div>
            <el-button type="primary" :loading="exportLoading" @click="handleExport"
                class="!bg-[#06b6d4] !border-[#06b6d4]">
                <el-icon class="mr-1" v-if="!exportLoading">
                    <Download />
                </el-icon> 导出Excel
            </el-button>
        </div>

        <!-- 表格区域 -->
        <div class="px-4 flex-1">
            <CommonTable :data="tableData" :columns="columns" :loading="loading" :current-page="currentPage"
                business-type="credit" :page-size="pageSize" :total="total" @current-change="handleCurrentChange"
                @size-change="handleSizeChange">
                <template #amount="{ row }">
                    <span :class="(row.root?.amount || 0) >= 0 ? 'text-blue-500' : 'text-red-500'">
                        {{ (row.root?.amount || 0) >= 0 ? '+' : '' }}{{ (row.root?.amount || 0).toFixed(2) }}
                    </span>
                </template>
            </CommonTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import CommonTable, { type ColumnConfig } from '@/components/CommonTable.vue'
import { exportToExcel, type ExportColumn } from '@/utils/export'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { getCreditList } from '@/api/credit'
import { getUserInfo } from '@/api'
const loading = ref(false)
const stats = ref({
    creditLimit: 0,
    availableCredit: 0,
    usedCredit: 0
})

const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const walletId = ref('')
const form = reactive({
    keyword: '',
    dateRange: [] as string[],
})

// 列配置
const columns: ColumnConfig[] = [
    { prop: 'transactionTime', label: '交易时间', minWidth: 160, formatter: (row: any) => row.transactionTime?.replace('T', ' ') || '' },
    { prop: 'amount', label: '额度', minWidth: 120, slot: 'amount' },
    { prop: 'note', label: '使用场景', minWidth: 300 },
    { prop: 'operaEntityName', label: '操作者', minWidth: 120 },
]

const getStats = async () => {
    try {
        const res: any = await getUserInfo()
        if (res.success) {
            stats.value = res.data.creditAccount
            walletId.value = res.data.wallet.id

        }
    } catch (error) {
        console.error('获取额度统计失败', error)
    }
}

const getList = async () => {
    loading.value = true
    try {
        const params = {
            pageNo: currentPage.value,
            pageSize: pageSize.value,
            walletId: walletId.value,
            searchText: form.keyword,
            searchBeginTime: form.dateRange?.[0] || null,
            searchEndTime: form.dateRange?.[1] || null,
        }
        const res: any = await getCreditList(params)
        if (res.success) {
            tableData.value = res.data.rows
            total.value = res.data.totalRows
        }
    } catch (error) {
        console.error('获取列表失败', error)
        // ElMessage.error('获取列表失败') // 暂时屏蔽错误提示以免干扰
    } finally {
        loading.value = false
    }
}

// 判断是否为增加额度（debit）
const isDebit = (row: any) => {
    // const transactionType = row.root?.transactionType
    // if (transactionType === 'PRE_AUTH_DEBIT') return false
    // if (transactionType === 'FREEZE') return false
    // if (transactionType === 'THAW') return true
    return row.root?.debit !== false
}

const handleSearch = () => { currentPage.value = 1; getList() }
const handleReset = () => { form.keyword = ''; form.dateRange = []; handleSearch() }
const handleSizeChange = (val: number) => { pageSize.value = val; getList() }
const handleCurrentChange = (val: number) => { currentPage.value = val; getList() }

// 导出Excel
const exportLoading = ref(false)
const creditExportColumns: ExportColumn[] = [
    { prop: 'transactionTime', label: '交易时间' },
    {
        prop: 'amount',
        label: '额度',
        formatter: (_v, row: any) => {
            const amount = Number(row?.root?.amount || 0)
            return amount >= 0 ? `+${amount.toFixed(2)}` : amount.toFixed(2)
        }
    },
    { prop: 'note', label: '使用场景' },
    { prop: 'operaEntityName', label: '操作者' }
]

const handleExport = async () => {
    if (tableData.value.length === 0) {
        ElMessage.warning('暂无数据可导出')
        return
    }
    exportLoading.value = true
    try {
        exportToExcel({
            data: tableData.value,
            columns: creditExportColumns,
            filename: '额度使用记录',
            sheetName: '额度数据'
        })
        ElMessage.success('导出成功')
    } catch (error) {
        console.error('导出失败:', error)
        ElMessage.error('导出失败，请重试')
    } finally {
        exportLoading.value = false
    }
}

onMounted(async () => {
    await getStats()
    getList()
})
</script>

<style scoped>
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
    box-shadow: 0 0 0 1px #e2e8f0 inset !important;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover) {
    box-shadow: 0 0 0 1px #cbd5e1 inset !important;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #3b82f6 inset !important;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
    background-color: #3b82f6;
}

:deep(.el-date-editor input::placeholder) {
    color: rgba(85, 85, 85, 1) !important;
}

:deep(.el-date-editor .el-range-input::placeholder) {
    color: rgba(85, 85, 85, 1) !important;
}
</style>
