<template>
  <div class="bg-white h-full">
    <div class="bg-white flex flex-col overflow-hidden">
      <!-- 页面标题 -->
      <div class="px-6 py-4">
        <h1 class="text-lg font-semibold text-gray-800  mb-2">对账管理</h1>
        <div class="h-[3px] bg-[#F1F2F6]"></div>
      </div>

      <!-- 搜索区域 -->
      <div class="px-6 pb-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <el-input v-model="searchForm.keyword" placeholder="搜索对账单ID、联系人、联系电话" clearable style="width: 280px"
              size="default" class="search-input">
              <template #prefix>
                <el-icon class="text-gray-400">
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px" size="default">
              <el-option label="全部状态" value="" />
              <el-option label="待确认" value="0" />
              <el-option label="待结算" value="1" />
              <el-option label="部分已结算" value="2" />
              <el-option label="已结算" value="3" />
              <el-option label="费用存疑" value="4" />
              <el-option label="废弃" value="99" />
            </el-select>
            <el-button type="primary" @click="handleSearch" size="default"
              class="!px-6 !rounded !bg-blue-500 hover:!bg-blue-600 !border-none">
              搜索
            </el-button>
            <el-button @click="handleReset" size="default" style="background-color: rgba(205, 212, 218, 1)"
              class="!w-20 !h-8 !text-[#333]">
              重置
            </el-button>
          </div>
          <div class=" text-sm text-gray-500">
            共找到 <span class="text-red-500 font-medium">{{ totalRecords }}</span> 条对账单
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="flex-1 px-4 py-3 overflow-auto">
        <CommonTable :data="reconciliationList" :columns="tableColumns" :loading="loading" :current-page="currentPage"
          :page-size="pageSize" :total="totalRecords" business-type="bill"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '500', height: '48px', fontSize: '13px', borderBottom: '1px solid #ebeef5' }"
          :row-style="{ height: '56px' }" @current-change="handleCurrentChange" @size-change="handleSizeChange">
          <template #accountPeriod="{ row }">
            <span class="text-gray-600 text-sm">{{ formatDateRange(row.startDate, row.endDate) }}</span>
          </template>

          <template #orderTotalAmount="{ row }">
            <span class="text-gray-700 text-sm">¥{{ formatAmount(row.amount) }}</span>
          </template>

          <template #reconciliationAmount="{ row }">
            <span class="text-red-500 font-medium text-sm">¥{{ formatAmount(row.actAmount) }}</span>
          </template>

          <template #createTime="{ row }">
            <div class="flex flex-col">
              <span class="text-gray-700 text-sm">{{ row.createDate?.split(' ')[0] }}</span>
              <span class="text-gray-400 text-xs">{{ row.createDate?.split(' ')[1] }}</span>
            </div>
          </template>

          <template #status="{ row }">
            <div class="bg-gray-100 text-center rounded-[3px] py-1">
              <span :class="getStatusClass(statusMap[row.status])" class="text-sm">{{
                statusMap[row.status]
              }}</span>
            </div>
          </template>
          <template #invoiceStatus="{ row }">
            <div class="bg-gray-100 text-center rounded-[3px] py-1">
              <span :class="getStatusClass(statusMap[row.invoiceStatus])" class="text-sm">{{
                invoiceStatusMap[row.invoiceStatus]
              }}</span>
            </div>
          </template>

          <template #actions="{ row }">
            <el-button link type="default" @click="viewDetail(row)" class="!text-gray-500 hover:!text-blue-500">
              <el-icon class="mr-1">
                <View />
              </el-icon>
              查看
            </el-button>
          </template>
        </CommonTable>
      </div>
    </div>

    <!-- 对账单详情弹窗 -->
    <ReconciliationDetailModal v-model:visible="showDetailModal" :reconciliation-id="selectedReconciliationId"
      @confirm="loadReconciliationList" />
  </div>
</template>

<script setup lang="ts">
import type { ColumnConfig } from '@/components/CommonTable.vue'
import CommonTable from '@/components/CommonTable.vue'
import { Search, View } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import ReconciliationDetailModal from './ReconciliationDetailModal.vue'
import { getReconciliationList } from '@/api/reconciliation'

defineOptions({
  name: 'ReconciliationManagement',
})

// 接口定义
interface ReconciliationItem {
  id: number // 对账单ID 
  billNo: string // 对账单ID
  bodyId: string //主体ID
  companyName: string // 收件公司名称
  startDate: string // 账期开始日期
  endDate: string // 账期结束日期
  orderPrice: number // 订单总金额
  amount: number // 账单原金额 待结算金额
  actAmount: number//实际账单金额 有调整时会变
  settleAmount: number // 已结算金额
  invoiceAmount: number//已开票金额
  billAmount: number // 对账单金额
  linkName: string // 联系人
  linkPhone: string // 电话
  email: string // 邮箱
  createDate: string // 创建时间
  status: number // 状态
}

// 响应式数据
const loading = ref(false)
const reconciliationList = ref<ReconciliationItem[]>([])
const totalRecords = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const showDetailModal = ref(false)
const selectedReconciliationId = ref('')

// 搜索表单
const searchForm = ref({
  keyword: '',
  status: '',
})

// 状态映射
const statusMap: Record<number, string> = {
  0: '待确认',
  1: '待结算',
  2: '部分已结算',
  3: '已结算',
  4: '费用存疑',
  99: '废弃'
}
const invoiceStatusMap: Record<number, string> = {
  0: ' 待开发票 ',
  1: '已开发票',
  2: '不开发票',
}
// 表格列配置
const tableColumns: ColumnConfig[] = [
  {
    prop: 'billNo',
    label: '对账单ID',
    minWidth: 120,
  },
  {
    prop: 'accountPeriod',
    label: '账期',
    minWidth: 180,
    slot: 'accountPeriod',
  },
  {
    prop: 'amount',
    label: '订单总金额',
    minWidth: 120,
    slot: 'orderTotalAmount',
  },
  {
    prop: 'actAmount',
    label: '对账单金额',
    minWidth: 120,
    slot: 'reconciliationAmount',
  },
  {
    prop: 'linkName',
    label: '联系人',
    minWidth: 100,
  },
  {
    prop: 'linkPhone',
    label: '电话',
    minWidth: 130,
  },
  {
    prop: 'createDate',
    label: '创建时间',
    minWidth: 90,
    slot: 'createTime',
  },
  {
    prop: 'status',
    label: '状态',
    minWidth: 100,
    slot: 'status',
    align: 'center',
  },
  {
    prop: 'invoiceStatus',
    label: '发票状态',
    slot: 'invoiceStatus',
    minWidth: 100,
    align: 'center',
  },
  {
    prop: 'actions',
    label: '操作',
    width: 100,
    fixed: 'right',
    slot: 'actions',
  },
]

// 获取对账单列表数据
const loadReconciliationList = async () => {
  loading.value = true
  try {
    const res = (await getReconciliationList({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword || undefined,
      status: searchForm.value.status || undefined,
    }))
    reconciliationList.value = res.data?.rows || []
    totalRecords.value = res.data?.totalRows || 0
  } catch (error) {
    console.error('获取对账单列表失败:', error)
    reconciliationList.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

// 格式化金额
const formatAmount = (amount: number | undefined | null) => {
  if (amount == null) return '0.00'
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化账期范围
const formatDateRange = (startDate: string, endDate: string) => {
  return `${startDate} - ${endDate}`
}

// 获取状态样式类名
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    待确认: 'text-orange-500',
    待结算: 'text-blue-500',
    部分已结算: 'text-cyan-500',
    已结算: 'text-green-500',
    费用存疑: 'text-red-500',
    废弃: 'text-gray-400',
  }
  return classMap[status] || 'text-gray-500'
}


// 查看详情
const viewDetail = (row: ReconciliationItem) => {
  selectedReconciliationId.value = String(row.id)
  showDetailModal.value = true
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadReconciliationList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: '',
  }
  currentPage.value = 1
  loadReconciliationList()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadReconciliationList()
}

// 页码改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadReconciliationList()
}

// 生命周期
onMounted(() => {
  loadReconciliationList()
})
</script>

<style scoped>
/* 搜索输入框样式 */
.search-input :deep(.el-input__wrapper) {
  border-radius: 4px;
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

.search-input :deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

.search-input :deep(.el-input__wrapper:focus-within) {
  border-color: #409eff;
}

/* 下拉选择器样式 */
:deep(.el-select__wrapper) {
  border-radius: 4px;
}

:deep(.el-select .el-select__placeholder) {
  @apply text-[#555];
}
</style>