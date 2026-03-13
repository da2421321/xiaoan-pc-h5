<template>
  <el-dialog v-model="dialogVisible" width="1000px" top="20px" class="order-detail-modal !rounded-[10px]"
    :show-close="true" destroy-on-close>
    <template #header>
      <div class="pb-2">订单详情</div>
      <div class="h-[3px] bg-[#F1F2F6]"></div>
    </template>
    <div class="px-4 pb-6">
      <!-- 订单信息 -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <div class="w-1 h-4 bg-blue-500 mr-3 rounded-full"></div>
          订单信息
        </h3>

        <div class="border border-gray-200 rounded-sm text-sm">
          <!-- Row 1 -->
          <div class="flex border-b border-gray-200">
            <div
              class="w-32 bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 flex-shrink-0">
              订单号</div>
            <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.orderId || '-' }}</div>
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 border-l border-gray-200 flex-shrink-0">
              联系电话</div>
            <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.userPhone || '-' }}</div>
          </div>

          <!-- Row 2 -->
          <div class="flex border-b border-gray-200">
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 flex-shrink-0">
              业务类型</div>
            <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.projectTypeName || '-' }}</div>
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 border-l border-gray-200 flex-shrink-0">
              服务地址</div>
            <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.userAddress || '-' }}</div>
          </div>

          <!-- Row 3 -->
          <div class="flex border-b border-gray-200">
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 flex-shrink-0">
              订单状态</div>
            <div class="flex-1 p-3 text-blue-500 flex items-center">{{ orderData?.orderStatusMsg || '-' }}</div>
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 border-l border-gray-200 flex-shrink-0">
              订单总金额</div>
            <div class="flex-1 p-3 text-gray-900 font-bold flex items-center">¥{{ formatAmount(orderData?.totalPrice) }}
            </div>
          </div>

          <!-- Row 4 -->
          <div class="flex border-b border-gray-200">
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 flex-shrink-0">
              下单时间</div>
            <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.createTime || '-' }}</div>
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 border-l border-gray-200 flex-shrink-0">
              已支付金额</div>
            <div class="flex-1 p-3 text-red-500 font-bold flex items-center">¥{{
              formatAmount(orderData?.settlementPrice) }}</div>
          </div>

          <!-- Row 5 -->
          <div class="flex border-b border-gray-200">
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 flex-shrink-0">
              安装时间</div>
            <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.installTime || '-' }}</div>
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 border-l border-gray-200 flex-shrink-0">
              设备状态</div>
            <div class="flex-1 p-3 text-gray-900 flex items-center">{{ equipmentType || '-' }}</div>
          </div>

          <!-- Row 6 -->
          <div class="flex">
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 flex-shrink-0">
              联系人</div>
            <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.realName || '-' }}</div>
            <div
              class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 border-l border-gray-200 flex-shrink-0">
            </div> <!-- Empty Label Cell -->
            <div class="flex-1 p-3 flex items-center gap-2">
              <el-button v-if="orderData?.equipmentType === '2'" type="primary" size="small" class="!px-4"
                @click="handleViewLogistics">
                物流信息
              </el-button>

              <el-button type="primary" size="small" class="!px-4" @click="handleViewDelivey">
                交付信息
              </el-button>
            </div>
          </div>
        </div>
        <div class="flex border-b border-gray-200">
          <div
            class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 flex-shrink-0">
            项目名称</div>
          <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.itemName || '-' }}</div>
          <div
            class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 border-l border-gray-200 flex-shrink-0">
            项目编号</div>
          <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.itemCode || '-' }}</div>
        </div>
        <div class="flex border-b border-gray-200">
          <div
            class="w-32  bg-[#f9f9f9] p-3 text-gray-500 flex items-center justify-end border-r border-gray-200 flex-shrink-0">
            备注</div>
          <div class="flex-1 p-3 text-gray-900 flex items-center">{{ orderData?.remark || '-' }}</div>
        </div>
      </div>

      <!-- 费用明细表格 -->
      <div>
        <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
          <div class="w-1 h-4 bg-blue-500 mr-3 rounded-full"></div>
          费用明细
        </h3>
        <el-table :data="orderInfoList" class="custom-table"
          :header-cell-style="{ backgroundColor: '#f9f9f9', color: '#666', fontWeight: '500', fontSize: '13px' }"
          :cell-style="{ padding: '12px 0', fontSize: '13px' }">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="categoryName" label="费用类型" min-width="100" align="center">
            <template #default="{ row }">
              <span
                :class="{ 'text-blue-500': row.categoryName === '基础费用', 'text-red-500': row.categoryName === '增补费用' }">
                {{ row.categoryName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="storeName" label="费用名称" min-width="120" align="center" />
          <el-table-column prop="remark" label="费用用途" min-width="200" show-overflow-tooltip align="center">
            <template #default="{ row }">
              {{ row.remark || '' }}
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" min-width="120" align="center">
            <template #default="{ row }">
              <span class="font-bold text-gray-700">¥{{ row.price ? Number(row.price).toFixed(2) : '0.00' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="100" align="center" />
          <el-table-column prop="cartNum" label="数量" width="100" align="center" />
          <el-table-column label="创建时间" min-width="200" align="center">
            <template #default="{ row }">
              <div class="flex flex-col items-center justify-center leading-tight">
                <span>{{ row.createTime?.split(' ')[0] || '-' }}</span>
                <span class="text-gray-400 text-xs">{{ row.createTime?.split(' ')[1] || '' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" min-width="120" align="center">
            <template #default="{ row }">
              <span class="font-bold text-gray-900">¥{{ row.subtotal }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 底部合计 -->
        <div class="flex justify-end mt-6 items-center">
          <span class="text-gray-900 font-bold text-lg mr-2">合计:</span>
          <span class="text-2xl font-bold text-gray-900 font-mono">¥{{ calculateTotal(orderInfoList) }}</span>
        </div>
      </div>
      <!-- 订单轨迹 -->
      <div>
        <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
          <div class="w-1 h-4 bg-blue-500 mr-3 rounded-full"></div>
          订单轨迹
        </h3>
        <!-- 订单轨迹时间轴 -->
        <div class="border border-gray-200 rounded-sm p-4">
          <div class="pr-2 custom-scrollbar" :class="trajectoryExpanded ? 'max-h-[300px] overflow-y-auto' : ''">
            <el-timeline v-if="trajectoryList?.length" class="logistics-timeline">
              <el-timeline-item v-for="(activity, index) in displayTrajectoryList" :key="activity.id" :hollow="false"
                color="#3b82f6" size="normal">
                <div class="timeline-time">{{ activity.createDate }}</div>
                <div class="timeline-content" :class="{ 'highlight': index === 0 }">
                  {{ activity.hfRemark == null || activity.hfRemark === '' ? activity.remark : activity.hfRemark }}
                </div>
              </el-timeline-item>
            </el-timeline>
            <div v-else-if="trajectoryLoading" class="text-center text-gray-400 py-6">
              加载中...
            </div>
            <div v-else class="text-center text-gray-400 py-6">
              暂无订单轨迹
            </div>
          </div>
          <!-- 收缩/展开按钮 -->
          <div v-if="trajectoryList?.length > 2" class="text-center mt-3 border-t border-gray-100 pt-3">
            <el-button type="primary" link @click="trajectoryExpanded = !trajectoryExpanded">
              {{ trajectoryExpanded ? '收起' : '展开更多' }}
              <el-icon class="ml-1">
                <arrow-up v-if="trajectoryExpanded" />
                <arrow-down v-else />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
  <Track v-model:visible="TrackdialogVisible" :orderId="orderData?.orderId" />
  <Deliveryinfo v-model:visible="deliveryinfodialogVisible" :orderId="orderData?.id" />
</template>

<script setup lang="ts">
import { getOrderDetail, getOrderWorkflow } from '@/api'
import { ref, watch, computed } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import Track from './Track.vue'

import { useLoadingStore } from '@/stores/loading'
import Deliveryinfo from './Deliveryinfo.vue'

const loadingStore = useLoadingStore()

// API 返回的订单项
interface OrderInfoItem {
  id: number
  attrId?: number
  productId?: number
  templateItemId: string
  isPay: number
  optionVal?: string
  unit?: string
  cartNum: number
  image?: string
  storeName: string
  price: number
  isReply?: number
  sku?: string
  createTime?: string
  createBy?: string
  remark?: string
}

interface OrderInfo {
  id: string
  templateId: string
  name: string
  isPay: boolean
  amount: number
  remark?: string
  items: OrderInfoItem[]
}

// 支付明细项
interface SettlementItem {
  id: string
  settleNo: string
  orderId: string
  orderNo: string
  outTradeNo: string
  payChannel: string
  payType: string
  status: string
  type: string
  typeName: string
  amount: number
  createTime: string
}

// 支付数据
interface SettlementData {
  totalAmount: number
  items: SettlementItem[]
}

// 待支付明细项
interface UnSettlementItem {
  typeName: string
  amount: number
}

// 待支付数据
interface UnSettlementData {
  totalAmount: number
  items: UnSettlementItem[]
}

// API 返回的订单详情
interface ApiOrderDetail {
  id: number
  orderId: string
  realName: string
  userPhone: string
  userAddress: string
  freightPrice: number
  totalPrice: number
  basicPrice: number
  supplementPrice: number
  settlementPrice: number
  unSettlementPrice: number
  proTotalPrice: number
  payPrice: number
  payPostage: number
  deductionPrice: number
  couponId: number
  couponPrice: number
  paid: boolean
  payTime: string
  payType: string
  createTime: string
  status: number
  refundStatus: number
  deliveryName: string
  deliveryType: string
  deliveryId: string
  useIntegral: number
  remark: string
  projectId: number
  projectTypeId: number
  projectName: string
  projectTypeName: string
  payMethod: string
  installTime: string
  startTime: string
  endTime: string
  isPreserve: number
  equipmentType: string
  trackingNumber: string
  serviceType: string
  serviceName: string
  workTemplate: string
  thumps: string
  itemName: string
  itemCode: string
  techniqueType: string
  techniqueId: number
  techniqueName: string
  attachmentFlag: number
  orderInfoList: OrderInfo[]
  orderStatusMsg: string
  templateFile?: string
  settlementData?: SettlementData
  unSettlementData?: UnSettlementData
}

const TrackdialogVisible = ref(false)
const deliveryinfodialogVisible = ref(false)

// 订单轨迹数据
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
  hfRemark: string
  remark: string
}
const trajectoryList = ref<TrajectoryItem[]>([])
const trajectoryLoading = ref(false)
const trajectoryExpanded = ref(false)

// 根据展开状态显示轨迹列表
const displayTrajectoryList = computed(() => {
  if (trajectoryExpanded.value) {
    return trajectoryList.value
  }
  return trajectoryList.value.slice(0, 2)
})
interface Props {
  visible: boolean
  orderId?: number | string
}
const equipmentType = computed(() => {
  return orderData.value?.equipmentType === '0' ? '设备已到位' : orderData.value?.equipmentType === '1' ? '设备未寄出' : orderData.value?.equipmentType === '2' ? '设备已寄出' : ''
})
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  orderId: '',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const dialogVisible = ref(props.visible)
const orderData = ref<ApiOrderDetail | null>(null)
const orderInfoList = ref<any[]>([])

// 监听visible变化
watch(
  () => props.visible,
  (newValue: boolean) => {
    dialogVisible.value = newValue
    if (newValue && props.orderId) {
      loadOrderDetail()
    }
  },
)

watch(dialogVisible, (newValue: boolean) => {
  emit('update:visible', newValue)
})

// 加载订单详情数据
const loadOrderDetail = async () => {
  if (!props.orderId) return

  loadingStore.show()
  try {
    const res = await getOrderDetail(String(props.orderId))
    if (res.code === '00000' && res.data) {
      orderData.value = res.data
      // 直接从 orderInfoList 中提取费用明细数据
      processOrderInfoList()
      // 加载订单轨迹
      loadTrajectory(res.data.id)
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
  } finally {
    loadingStore.hide()
  }
}

// 加载订单轨迹
const loadTrajectory = async (id: number | string) => {
  trajectoryLoading.value = true
  try {
    const res = await getOrderWorkflow(String(id))
    const data = res.data || []
    // 直接倒置数组
    trajectoryList.value = data.reverse()
  } catch (error) {
    console.error('获取订单轨迹失败:', error)
  } finally {
    trajectoryLoading.value = false
  }
}

// 处理 orderInfoList 数据，展平为表格所需格式
const processOrderInfoList = () => {
  if (!orderData.value?.orderInfoList) {
    orderInfoList.value = []
    return
  }

  const flatList: any[] = []
  orderData.value.orderInfoList.forEach((category: OrderInfo) => {
    if (category.items && category.items.length) {
      category.items.forEach((item: OrderInfoItem) => {
        if (item.cartNum >= 1) {
          flatList.push({
            ...item,
            categoryName: category.name,
            categoryId: category.id,
            subtotal: (item.price * item.cartNum).toFixed(2)
          })
        }
      })
    }
  })
  orderInfoList.value = flatList
}

// 格式化金额，添加千位分隔符
const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 计算列表总计
const calculateTotal = (list: any[]) => {
  const sum = list.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
  return formatAmount(sum);
}

// 查看物流信息
const handleViewLogistics = async () => {
  if (orderData.value?.trackingNumber) {
    TrackdialogVisible.value = true
  }
}
const handleViewDelivey = async () => {
  deliveryinfodialogVisible.value = true
}
</script>

<style scoped>
:deep(.el-dialog__header) {
  @apply mr-0 py-5 px-6 border-b border-gray-100;
}

:deep(.el-dialog__body) {
  @apply p-0;
}

:deep(.el-dialog__headerbtn) {
  @apply top-6;
}

:deep(.el-table td.el-table__cell) {
  @apply border-b border-[#e7e7e7];
}

:deep(.el-table--border .el-table__cell) {
  @apply border-[#e7e7e7];
}

:deep(.custom-table) {
  @apply border-l border-r border-[#e7e7e7];
}

:deep(.custom-table .el-table__body-wrapper) {
  @apply border-b border-[#e7e7e7];
}

/* 订单轨迹滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.timeline-time {
  color: #3b82f6;
  font-size: 13px;
  margin-bottom: 6px;
}

.timeline-content {
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.logistics-timeline.el-timeline) {
  padding-left: 24px;
}

:deep(.logistics-timeline .el-timeline-item__tail) {
  border-left-width: 2px !important;
  border-left-style: solid !important;
  border-left-color: #3b82f6 !important;
  left: 5px;
}

:deep(.logistics-timeline .el-timeline-item__node) {
  background-color: #3b82f6;
  left: 0;
}

:deep(.logistics-timeline .el-timeline-item__wrapper) {
  padding-left: 24px;
  top: -3px;
}
</style>