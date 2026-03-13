<template>
  <div class="bg-white h-full flex flex-col">
    <!-- 顶部标题栏 -->
    <div class="px-6 pt-4 pb-2 flex justify-between items-center">
      <h1 class="text-lg font-semibold text-gray-800">订单管理</h1>

    </div>
    <div class="mx-6 h-[3px] bg-[#F1F2F6]"></div>
    <!-- 筛选区域 -->
    <div class="px-6 py-3">
      <div class="flex items-center gap-3 flex-wrap">
        <el-select v-model="searchForm.businessType" placeholder="业务类型" clearable size="default" class="!w-28">
          <el-option v-for="item in businessTypeList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>

        <el-select v-model="searchForm.orderStatus" placeholder="订单状态" clearable size="default" class="!w-32">
          <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-date-picker v-model="searchForm.startTime" type="datetime" placeholder="下单时间 (开始)"
          format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" clearable size="default" class="!w-40" />

        <el-date-picker v-model="searchForm.endTime" type="datetime" placeholder="下单时间 (结束)"
          format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" clearable size="default" class="!w-40" />

        <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable size="default" class="!w-36" />
        <el-input v-model="searchForm.itemName" placeholder="项目名称" clearable size="default" class="!w-36" />
        <el-input v-model="searchForm.itemCode" placeholder="项目编号" clearable size="default" class="!w-36" />
        <el-input v-model="searchForm.orderUserName" placeholder="下单人" clearable size="default" class="!w-36" />

        <el-input v-model="searchForm.address" placeholder="请输入关键词" clearable size="default" class="!w-36" />

        <el-button @click="handleSearch" class="!w-20 !h-8 !bg-[#317DFE] !text-white !rounded-md">搜索</el-button>
        <el-button @click="handleReset" style="background-color: rgba(205, 212, 218, 1)"
          class="!w-20 !h-8 !text-[#333]">重置</el-button>
        <el-button type="success" @click="handleExport" :loading="exportLoading"
          class="!h-8 !rounded-md !bg-[#0dcaf0] !border-[#0dcaf0] text-white hover:!bg-[#31d2f2] hover:!border-[#25cff2]">
          <el-icon class="mr-1" v-if="!exportLoading">
            <Upload />
          </el-icon>
          导出Excel
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="flex-1  px-4 py-3">
      <CommonTable :data="orderList" :columns="columns" :loading="loading" :show-pagination="true"
        :current-page="currentPage" business-type="order" :page-size="pageSize" :total="totalOrders"
        :search="handlesearch" :header-cell-style="{ fontSize: '13px', height: '44px' }" class="order-table"
        @current-change="handleCurrentChange" @size-change="handleSizeChange">
        <template #createTime="{ row }">
          <div class="flex flex-col text-sm">
            <span class="text-[#333]">{{ row.createTime }}</span>

          </div>
        </template>

        <template #acceptanceDate="{ row }">
          <div class="flex flex-col text-sm">
            <template v-if="row.acceptanceDate">
              <span class="text-[#333]">{{ row.acceptanceDate }}</span>
            </template>
            <span v-else class="text-gray-400">-</span>
          </div>
        </template>

        <template #status="{ row }">
          <div class="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs"
            :style="getStatusStyle(row.status)">
            {{ row.orderStatus }}
          </div>
        </template>

        <template #contact="{ row }">
          <div class="flex flex-col text-sm">
            <span class="text-[#333]">{{ row.realName || '-' }}</span>
            <span class="text-[#333]">{{ row.userPhone || '-' }}</span>
          </div>
        </template>

        <template #totalPrice="{ row }">
          <span class="text-sm text-red-500">¥{{ formatAmount(row.totalPrice) }}</span>
        </template>

        <template #operation="{ row }">
          <el-button size="small" @click="viewOrder(row)"
            class="!rounded !border-gray-200 !text-gray-600 hover:!text-blue-500 hover:!border-blue-500">
            <el-icon class="mr-1 text-gray-400">
              <View />
            </el-icon>
            查看
          </el-button>
        </template>
      </CommonTable>
    </div>

    <OrderDetailModal v-model:visible="showOrderDetail" :orderId="selectedOrderId" />
  </div>
</template>

<script setup lang="ts">
import { getOrderList, getProjectList } from '@/api'
import CommonTable, { type ColumnConfig } from '@/components/CommonTable.vue'
import OrderDetailModal from '@/pages/order-list/order-detail/OrderDetailModal.vue'
import { useUserStore } from '@/stores/user'
import { exportToExcel, type ExportColumn } from '@/utils/export'
import { Upload, View, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

interface ApiResponse<T> {
  code: string
  data: T
  message?: string
}

interface OrderListData {
  rows: Order[]
  totalRows: number
  totalPage: number
}

interface Order {
  id: number
  orderId: string
  projectTypeName?: string
  projectName?: string
  createTime: string
  installTime?: string
  startTime?: string
  endTime?: string
  status: number
  orderStatus?: string
  userPhone: string
  userAddress: string
  totalPrice: number
  payPrice?: number
  payMethod?: string
  acceptanceDate?: string
}

interface ProjectItem {
  id: string
  name: string
}

defineOptions({
  name: 'OrderList',
})

const props = defineProps<{
  type?: string
  status?: string
}>()

const route = useRoute()
const userStore = useUserStore()

const activeStatus = ref<string>('all')
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const showOrderDetail = ref<boolean>(false)
const selectedOrderId = ref<string>('')
const supplementConfirm = ref<string | undefined>(undefined)
const workConfirm = ref<string | undefined>(undefined)
const loading = ref<boolean>(false)
const handlesearch = ref<boolean>(false)

const searchForm = ref({
  businessType: '',
  orderStatus: 'all',
  startTime: '',
  endTime: '',
  orderId: '',
  itemName: '',
  itemCode: '',
  orderUserName: '',
  address: '',
})

const orderList = ref<Order[]>([])
const totalOrders = ref<number>(0)
const totalPages = ref<number>(0)
const businessTypeList = ref<ProjectItem[]>([])

// 订单状态选项
const orderStatusOptions = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: '0' },
  { label: '已受理', value: '1' },
  { label: '已预约', value: '6' },
  { label: '已出发', value: '7' },
  { label: '服务中', value: '8' },
  { label: '交付完成', value: '9' },
  { label: '待结算', value: '12' },
  { label: '已完成', value: '13' },
  { label: '已取消', value: '14' },
  { label: '异常', value: '16' },
]

const columns: ColumnConfig[] = [
  { prop: 'orderId', label: '订单号', width: 130 },
  { prop: 'projectName', label: '业务类型', width: 120 },
  { prop: 'createTime', label: '下单时间', width: 140, slot: 'createTime' },
  { prop: 'orderUserName', label: '下单人', width: 140 },
  { prop: 'acceptanceDate', label: '完成时间', width: 140, slot: 'acceptanceDate' },
  { prop: 'status', label: '订单状态', width: 100, align: 'center', slot: 'status' },
  { prop: 'userPhone', label: '联系电话', width: 130, slot: 'contact' },
  { prop: 'userAddress', label: '地址', minWidth: 150, showOverflowTooltip: true },
  { prop: 'itemName', label: '项目名称', width: 100, },
  { prop: 'itemCode', label: '项目编号', width: 100, },
  { prop: 'totalPrice', label: '订单总额', width: 100, align: 'right', slot: 'totalPrice' },
  { label: '操作', width: 80, align: 'center', slot: 'operation' },
]

const getOrderListData = async () => {
  loading.value = true
  const params: {
    pageNo: number
    pageSize: number
    status?: number
    projectId?: string
    orderId?: string
    keyWord?: string
    beginDate?: string
    endDate?: string
    supplementConfirm?: string
    workConfirm?: string
    platformType?: string
    itemName?: string
    itemCode?: string
    orderUserName?: string
  } = {
    pageNo: currentPage.value,
    pageSize: pageSize.value,
  }

  params.platformType = '1'
  if (searchForm.value.businessType) {
    params.projectId = searchForm.value.businessType
  }
  if (searchForm.value.orderStatus && searchForm.value.orderStatus !== 'all') {
    params.status = Number(searchForm.value.orderStatus)
  }
  if (searchForm.value.orderId) {
    params.orderId = searchForm.value.orderId
  }
  if (searchForm.value.address) {
    params.keyWord = searchForm.value.address
  }
  if (searchForm.value.startTime) {
    params.beginDate = searchForm.value.startTime
  }
  if (searchForm.value.endTime) {
    params.endDate = searchForm.value.endTime
  }
  if (searchForm.value.itemName) {
    params.itemName = searchForm.value.itemName
  }
  if (searchForm.value.itemCode) {
    params.itemCode = searchForm.value.itemCode
  }
  if (searchForm.value.orderUserName) {
    params.orderUserName = searchForm.value.orderUserName
  }
  if (supplementConfirm.value !== undefined) {
    params.supplementConfirm = '0'
  }
  if (workConfirm.value !== undefined) {
    params.workConfirm = '0'
  }

  try {
    const res = (await getOrderList(params)) as ApiResponse<OrderListData>
    if (res.code === '00000' && res.data) {
      orderList.value = res.data.rows || []
      totalOrders.value = res.data.totalRows || 0
      totalPages.value = res.data.totalPage || 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    orderList.value = []
    totalOrders.value = 0
  } finally {
    loading.value = false
  }
}

const getStatusStyle = (status: number | string) => {
  let style = {
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
  }

  const statusNum = Number(status)

  switch (statusNum) {
    case 0: // 待付款
    case 11:
      style = { color: '#ef4444', backgroundColor: '#fee2e2' }
      break
    case 1: // 待结算
      style = { color: '#0ea5e9', backgroundColor: '#e0f2fe' }
      break
    case 4: // 已取消
    case 15:
      style = { color: '#6b7280', backgroundColor: '#f3f4f6' }
      break
    case 13: // 完成
      style = { color: '#059669', backgroundColor: '#dcfce7' }
      break
    default:
      const colorMap: Record<number, string> = {
        2: '#7c3aed',
        3: '#16a34a',
        4: '#6b7280',
        5: '#d97706',
        6: '#4f46e5',
        7: '#ea580c',
        8: '#db2777',
        9: '#ca8a04',
        10: '#ea580c',
        12: '#6366f1',
        14: '#d97706',
        16: '#b91c1c',
      }
      if (colorMap[statusNum]) {
        style.color = colorMap[statusNum]
        style.backgroundColor = '#f3f4f6'
      }
      break
  }
  return style
}

const getProjectListData = async () => {
  try {
    const res = (await getProjectList()) as ApiResponse<ProjectItem[]>
    if (res.code === '00000' && res.data) {
      businessTypeList.value = res.data || []
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
  }
}

const formatAmount = (amount: number) => {
  return (Number(amount)).toFixed(2)
}

const viewOrder = (order: Order) => {
  selectedOrderId.value = String(order.orderId)
  showOrderDetail.value = true
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
  handlesearch.value = true
  getOrderListData()
}

const handleReset = () => {
  searchForm.value = {
    businessType: '',
    orderStatus: 'all',
    startTime: '',
    endTime: '',
    orderId: '',
    itemName: '',
    itemCode: '',
    orderUserName: '',
    address: '',
  }
  currentPage.value = 1
  getOrderListData()
}

// 导出Excel
const exportLoading = ref(false)
const orderExportColumns: ExportColumn[] = [
  { prop: 'orderId', label: '订单号' },
  { prop: 'projectName', label: '业务类型' },
  { prop: 'createTime', label: '下单时间' },
  { prop: 'installTime', label: '安装时间' },
  { prop: 'orderStatus', label: '订单状态' },
  { prop: 'userPhone', label: '联系电话' },
  { prop: 'userAddress', label: '地址' },
  { prop: 'totalPrice', label: '订单总额', formatter: (v) => `¥${Number(v || 0).toFixed(2)}` }
]

const handleExport = async () => {
  if (orderList.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  exportLoading.value = true
  try {
    exportToExcel({
      data: orderList.value,
      columns: orderExportColumns,
      filename: '订单列表',
      sheetName: '订单数据'
    })
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    exportLoading.value = false
  }
}
watch([pageSize], () => {
  if (currentPage.value === 1) {
    getOrderListData()
  } else {
    currentPage.value = 1
  }
})

watch(currentPage, () => {
  getOrderListData()
})

watch(
  () => searchForm.value.orderStatus,
  (newVal: string | undefined | null) => {
    if (!newVal || newVal === '') {
      searchForm.value.orderStatus = 'all'
    }
  },
)

onMounted(() => {
  // 优先从 props.status 获取（params 方式），兼容 query 方式
  const status = props.status || route.query.status
  const statusMapping: Record<string, string> = {
    all: 'all',
    pending_pay: '1',        // 已受理
    pending_complete: '6',   // 已预约
    pending_settle: '12',    // 待结算
    return: '8',             // 服务中
    cancelled: '9',          // 交付完成
    exception: '16',         // 异常
    completed: '13'          // 已完成
  }

  if (status && statusMapping[status as string]) {
    activeStatus.value = status as string
    searchForm.value.orderStatus = statusMapping[status as string]
  } else {
    searchForm.value.orderStatus = 'all'
  }

  // 通过 props 接收 type 参数（从待办事项跳转）
  if (props.type === 'supplement') {
    supplementConfirm.value = '0'
  } else if (props.type === 'workOrder') {
    workConfirm.value = '0'
  }

  // 兼容旧的 query 方式
  if (route.query.supplementConfirm !== undefined) {
    supplementConfirm.value = route.query.supplementConfirm as string
  }
  if (route.query.workConfirm !== undefined) {
    workConfirm.value = route.query.workConfirm as string
  }

  getProjectListData()
  getOrderListData()
})
</script>

<style scoped>
:deep(.el-table) {
  @apply text-[13px];
}

:deep(.el-table th.el-table__cell) {
  @apply bg-gray-50;
}

:deep(.order-table .el-table__header-wrapper) {
  @apply border border-[#e7e7e7];
}

:deep(.el-button) {
  @apply !ml-0;
}

:deep(.el-button.is-disabled) {
  @apply opacity-50;
}

:deep(.el-date-editor .el-input__wrapper input::placeholder) {
  @apply text-[#555];
}

:deep(.el-select .el-select__placeholder) {
  @apply text-[#555];
}

:deep(.el-table td.el-table__cell) {
  @apply border-b border-[#e7e7e7];
}

:deep(.el-table td.el-table__cell:last-child) {
  border-right: none !important;
}

:deep(.el-table th.el-table__cell:last-child) {
  border-right: none !important;
}

:deep(.el-table--border .el-table__cell) {
  @apply border-[#e7e7e7];
}
</style>
