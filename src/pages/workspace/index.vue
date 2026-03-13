<template>
  <div class="min-h-screen bg-gray-100 p-3">
    <!-- 顶部欢迎语 -->
    <div class="text-sm text-gray-800 mb-2 pl-5">
      你好，<span class="font-semibold">{{ displayName }}</span>
      <span class="text-gray-400 text-xs ml-2">欢迎回来</span>
    </div>

    <!-- 主内容区域 -->
    <div class="flex flex-col gap-3">
      <!-- 第一行：左侧(快捷操作+订单信息) + 右侧(授信额度) -->
      <div class="flex flex-col lg:flex-row gap-3">
        <!-- 左侧区域 -->
        <div class="flex-1 flex flex-col gap-3">
          <!-- 快捷操作按钮 -->
          <div class="flex flex-col md:flex-row gap-3 h-20">
            <div
              class="flex-1 flex items-center gap-4 px-6 rounded-[6px] text-white cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl bg-cover bg-center bg-no-repeat"
              :style="{ backgroundImage: `url(${createOrderBg})` }" @click="handleQuickOrder">
              <img src="/src/assets/images/ordericon.png" alt="创建订单" class="w-10 h-10" />
              <span class="text-lg font-medium tracking-wide">创建订单</span>
            </div>
            <div
              class="flex-1 flex items-center gap-4 px-6 rounded-[6px] text-white cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl bg-cover bg-center bg-no-repeat"
              :style="{ backgroundImage: `url(${orderlistbg})` }" @click="navigateTo('/order-list')">
              <img src="/src/assets/images/orderlisticon.png" alt="订单管理" class="w-10 h-11" />
              <span class="text-lg font-medium tracking-wide">订单管理</span>
            </div>
            <div v-if="isAdmin"
              class="flex-1 flex items-center gap-4 px-6 rounded-[6px] text-white cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl bg-cover bg-center bg-no-repeat"
              :style="{ backgroundImage: `url(${accountbg})` }" @click="navigateTo('/reconciliation')">
              <img src="/src/assets/images/accounticon.png" alt="对账管理" class="w-10 h-10" />
              <span class="text-lg font-medium tracking-wide">对账管理</span>
            </div>
          </div>

          <!-- 订单信息卡片 -->
          <div class="orderinfo bg-white rounded-lg px-5 pt-3 pb-5 shadow-sm flex-1 flex flex-col justify-center">
            <div class="pb-8">订单信息</div>
            <div class="flex flex-col md:flex-row mb-8">
              <div class="flex-1 mb-4 md:mb-0">
                <div class="text-xs text-gray-400 mb-2">总金额/¥</div>
                <div class="text-3xl font-bold text-gray-800 tracking-tight">
                  {{ formatNumber(Number(orderInfo.totalAmount)) }}
                </div>
              </div>
              <div class="flex-1 mb-4 md:mb-0">
                <div class="text-xs text-gray-400 mb-2">已结算金额/¥</div>
                <div class="text-3xl font-bold text-gray-800 tracking-tight">
                  {{ formatNumber(Number(orderInfo.settledAmount)) }}
                </div>
              </div>
              <div class="flex-1">
                <div class="text-xs text-gray-400 mb-2">未结算金额/¥</div>
                <div class="text-3xl font-bold text-red-500 tracking-tight">
                  {{ formatNumber(Number(orderInfo.pendingAmount)) }}
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="flex items-center justify-between px-4 py-3 bg-[#F1F2FF] rounded-[6px] cursor-pointer"
                @click="navigateToOrders('all')">
                <span class="text-sm text-gray-500">全部</span>
                <span class="text-lg font-bold text-gray-800">{{ orderStats.total }}</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-[#F1F2FF] rounded-[6px] cursor-pointer"
                @click="navigateToOrders('pending_pay')">
                <span class="text-sm text-gray-500">已受理</span>
                <span class="text-lg font-bold text-blue-500">{{ orderStats.pendingPay }}</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-[#F1F2FF] rounded-[6px] cursor-pointer"
                @click="navigateToOrders('pending_complete')">
                <span class="text-sm text-gray-500">已预约</span>
                <span class="text-lg font-bold text-gray-800">{{ orderStats.pendingComplete }}</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-[#F1F2FF] rounded-[6px] cursor-pointer"
                @click="navigateToOrders('pending_settle')">
                <span class="text-sm text-gray-500">待结算</span>
                <span class="text-lg font-bold text-gray-800">{{ orderStats.pendingSettle }}</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-[#F1F2FF] rounded-[6px] cursor-pointer"
                @click="navigateToOrders('return')">
                <span class="text-sm text-gray-500">服务中</span>
                <span class="text-lg font-bold text-gray-800">{{ orderStats.returnOrder }}</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-[#F1F2FF] rounded-[6px] cursor-pointer"
                @click="navigateToOrders('cancelled')">
                <span class="text-sm text-gray-500">交付完成</span>
                <span class="text-lg font-bold text-gray-800">{{ orderStats.cancelled }}</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-[#F1F2FF] rounded-[6px] cursor-pointer"
                @click="navigateToOrders('exception')">
                <span class="text-sm text-gray-500">异常</span>
                <span class="text-lg font-bold text-red-500">{{ orderStats.exception }}</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-[#F1F2FF] rounded-[6px] cursor-pointer"
                @click="navigateToOrders('completed')">
                <span class="text-sm text-gray-500">已完成</span>
                <span class="text-lg font-bold text-gray-800">{{ orderStats.completed }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：授信额度统计 -->
        <div class="w-full lg:w-80 flex flex-col">
          <div class="bg-white rounded-lg p-6 shadow-sm flex-1 flex flex-col h-full">
            <div class="text-base font-bold text-gray-800 mb-1">授信额度统计</div>
            <div class="h-[3px] bg-[#F1F2F6] mb-2"></div>
            <div class="flex items-center justify-center flex-1 min-h-[200px]">
              <div ref="creditChartContainer" class="w-full h-full"></div>
            </div>

            <div class="border-t border-gray-100 pt-6 mt-2">
              <div class="flex items-center mb-4">
                <span class="w-14 text-xs text-gray-400">应付金额</span>
                <div class="flex-1 h-2 bg-gray-100 rounded-full mx-3 overflow-hidden">
                  <div class="h-full rounded-full bg-red-400" style="width: 100%"></div>
                </div>
                <span class="w-20 text-right text-sm font-semibold text-gray-800">¥{{
                  formatNumber(payInfo.totalAmount)
                }}</span>
              </div>
              <div class="flex items-center mb-4">
                <span class="w-14 text-xs text-gray-400">待付金额</span>
                <div class="flex-1 h-2 bg-gray-100 rounded-full mx-3 overflow-hidden">
                  <div class="h-full rounded-full bg-cyan-400" :style="{ width: paymentProgress.pending + '%' }"></div>
                </div>
                <span class="w-20 text-right text-sm font-semibold text-gray-800">¥{{
                  formatNumber(payInfo.pendingAmount)
                }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-14 text-xs text-gray-400">已付金额</span>
                <div class="flex-1 h-2 bg-gray-100 rounded-full mx-3 overflow-hidden">
                  <div class="h-full rounded-full bg-blue-600" :style="{ width: paymentProgress.settled + '%' }"></div>
                </div>
                <span class="w-20 text-right text-sm font-semibold text-gray-800">¥{{
                  formatNumber(payInfo.settledAmount)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行：图表 + 待办事项 -->
      <div class="flex flex-col lg:flex-row gap-3">
        <!-- 左侧图表区域 -->
        <div class="flex-1 flex flex-col md:flex-row gap-3">
          <div class="flex-1 bg-white rounded-lg p-4 shadow-sm">
            <div class="text-sm font-semibold text-gray-800 mb-1 flex items-center justify-between">
              <span>月度订单金额趋势</span>
              <el-icon class="text-gray-400 cursor-pointer">
                <ArrowRight />
              </el-icon>
            </div>
            <div class="h-[3px] bg-[#F1F2F6] mb-2"></div>

            <div class="flex gap-5 mb-2">
              <span class="flex items-center text-xs text-gray-600">
                <i class="w-2.5 h-2.5 rounded-sm mr-1.5 bg-[#2d78f4]"></i>结算金额
              </span>
              <span class="flex items-center text-xs text-gray-600">
                <i class="w-2.5 h-2.5 rounded-sm mr-1.5 bg-[#00d4ff]"></i>订单金额
              </span>
            </div>
            <div ref="lineChartContainer" class="h-56"></div>
          </div>
          <div class="flex-1 bg-white rounded-lg p-4 shadow-sm">
            <div class="text-sm font-semibold text-gray-800 mb-1 flex items-center justify-between">
              <span>月度订单数</span>
              <el-icon class="text-gray-400 cursor-pointer">
                <ArrowRight />
              </el-icon>
            </div>
            <div class="h-[3px] bg-[#F1F2F6] mb-2"></div>
            <div ref="barChartContainer" class="h-56"></div>
          </div>
        </div>

        <!-- 右侧待办事项 -->
        <div class="w-full lg:w-80">
          <div class="bg-white rounded-lg p-4 shadow-sm h-full">
            <div class="text-sm font-semibold text-gray-800 mb-1">待办事项</div>
            <div class="h-[3px] bg-[#F1F2F6] mb-2"></div>
            <div class="max-h-64 overflow-y-auto">
              <div v-for="item in todoList" :key="item.id"
                class="flex items-center py-3.5 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                @click="handleTodoClick(item)">
                <span class="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></span>
                <span class="flex-1 text-sm text-gray-800">{{ item.title }}</span>
                <span class="text-sm text-blue-400 font-medium">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CategoryModal v-model="showCategoryModal" />
    <Loading :visible="isLoading" text="加载中..." />
  </div>
</template>

<script setup lang="ts">
import { getDataOverview, getTodoCount, getOrderPayInfo, getOrderCount } from '@/api'
import accountbg from '@/assets/images/Account.png'
import createOrderBg from '@/assets/images/createorder.png'
import orderlistbg from '@/assets/images/orderlist.png'
import CategoryModal from '@/components/modals/CategoryModal.vue'
import Loading from '@/components/modals/loading.vue'
import { useUserStore } from '@/stores/user'
import { ArrowRight } from '@element-plus/icons-vue'
import type { ECharts } from 'echarts'
import * as echarts from 'echarts'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/api/user'

defineOptions({ name: 'WorkspaceIndex' })

const userStore = useUserStore()
const { displayName, isAdmin } = storeToRefs(userStore)
const router = useRouter()
const lineChartContainer = ref<HTMLElement | null>(null)
const barChartContainer = ref<HTMLElement | null>(null)
const creditChartContainer = ref<HTMLElement | null>(null)
let lineChart: ECharts | null = null
let barChart: ECharts | null = null
let creditChart: ECharts | null = null

const showCategoryModal = ref(false)
const isLoading = ref(false)

const orderInfo = reactive({
  totalAmount: '',
  settledAmount: '',
  pendingAmount: '',
})

// 进度条用的付款信息（来自 getOrderPayInfo）
const payInfo = reactive({
  totalAmount: 0,    // 应付金额
  settledAmount: 0,  // 已付金额
  pendingAmount: 0,  // 待付金额
})

const orderStats = reactive({
  total: '',
  pendingSettle: '',
  pendingPay: '',
  completed: '',
  returnOrder: '',
  exception: '',
  pendingComplete: '',
  cancelled: '',
})

const creditInfo = reactive({
  creditLimit: 0,
  availableCredit: 0,
  frozenBalance: 0
})

const todoList = ref([
  { id: 1, title: '待确认增补数量', count: 12, type: 'supplement' },
  { id: 2, title: '待确认工单数量', count: 12, type: 'workOrder' },
])

const formatNumber = (num: number) => (num ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 0 })

// 计算付款进度百分比（基于 payInfo）
const paymentProgress = computed(() => {
  const total = payInfo.totalAmount || 0
  if (total === 0) return { pending: 0, settled: 0 }
  return {
    pending: Math.round((payInfo.pendingAmount / total) * 100),
    settled: Math.round((payInfo.settledAmount / total) * 100)
  }
})

const handleQuickOrder = () => {
  showCategoryModal.value = true
}
const navigateTo = (path: string) => {
  router.push(path)
}
const navigateToOrders = (status: string) => {
  router.push({ name: 'orderList', params: { status } })
}
const handleTodoClick = (item: any) => {
  router.push({ name: 'orderList', params: { type: item.type } })
}

const fetchOrderPayInfo = async () => {
  try {
    const res = await getOrderPayInfo()
    const { totalAmount, settleAmount, unSettleAmount } = res.data
    // 进度条数据
    payInfo.totalAmount = totalAmount    // 应付金额
    payInfo.settledAmount = settleAmount // 已付金额
    payInfo.pendingAmount = unSettleAmount // 待付金额
  } catch (error) {
    console.error('Error fetching order pay info:', error)
  }
}

const initLineChart = (
  xAxisData: string[] = [],
  totalData: number[] = [],
  settData: number[] = [],
) => {
  if (!lineChartContainer.value) return
  // 检查 DOM 元素是否有有效尺寸
  const { clientWidth, clientHeight } = lineChartContainer.value
  if (clientWidth === 0 || clientHeight === 0) {
    setTimeout(() => initLineChart(xAxisData, totalData, settData), 100)
    return
  }
  if (!lineChart) lineChart = echarts.init(lineChartContainer.value)
  const option = {
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#999' },
      axisTick: { show: false },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: { formatter: (v: number) => '¥' + (v / 10000).toFixed(0) + '万', color: '#999' },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: '订单总额',
        type: 'line',
        data: totalData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#2d78f4', width: 3 },
        itemStyle: { color: '#2d78f4', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(45, 120, 244, 0.2)' },
            { offset: 1, color: 'rgba(45, 120, 244, 0)' },
          ]),
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontSize: 12,
          color: '#2d78f4',
          fontWeight: 'bold',
        },
      },
      {
        name: '已结金额',
        type: 'line',
        data: settData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#00d4ff', width: 3 },
        itemStyle: { color: '#00d4ff', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 212, 255, 0.2)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0)' },
          ]),
        },
        label: {
          show: true,
          position: 'bottom',
          formatter: '{c}',
          fontSize: 12,
          color: '#333',
          fontWeight: 'bold',
        },
      },
    ],
    tooltip: { trigger: 'axis' },
  }
  lineChart.setOption(option)
}

const initBarChart = (xAxisData: string[] = [], countData: number[] = []) => {
  if (!barChartContainer.value) return
  // 检查 DOM 元素是否有有效尺寸
  const { clientWidth, clientHeight } = barChartContainer.value
  if (clientWidth === 0 || clientHeight === 0) {
    setTimeout(() => initBarChart(xAxisData, countData), 100)
    return
  }
  if (!barChart) barChart = echarts.init(barChartContainer.value)
  const option = {
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#999' },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: countData,
        barWidth: 16,
        itemStyle: { color: '#2d78f4', borderRadius: [100, 100, 100, 100] },
        label: { show: true, position: 'top', formatter: '{c}', fontSize: 11, color: '#333' },
      },
    ],
    tooltip: { trigger: 'axis' },
  }
  barChart.setOption(option)
}

const initCreditChart = () => {
  if (!creditChartContainer.value) return
  // 检查 DOM 元素是否有有效尺寸
  const { clientWidth, clientHeight } = creditChartContainer.value
  if (clientWidth === 0 || clientHeight === 0) {
    // 如果尺寸为 0，延迟重试
    setTimeout(initCreditChart, 100)
    return
  }
  if (!creditChart) creditChart = echarts.init(creditChartContainer.value)

  const totalText = formatNumber(creditInfo.creditLimit)
  const usedValue = creditInfo.creditLimit - creditInfo.availableCredit
  const remainingValue = creditInfo.availableCredit

  const option = {
    title: {
      text: `${totalText}\n总计额度`,
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold', color: '#333', lineHeight: 20 },
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: (params: any) => `${params.name}<br/>¥${params.value.toLocaleString()} (${params.percent}%)`,
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'outside',
          formatter: (params: any) => `${params.name}\n¥${params.value.toLocaleString()}`,
          color: '#666',
          fontSize: 10,
          lineHeight: 14,
        },
        labelLine: { show: true, length: 15, length2: 10, lineStyle: { color: '#ccc' } },
        data: [
          { value: usedValue, name: '已用额度', itemStyle: { color: '#00d4ff' } },
          { value: remainingValue, name: '剩余额度', itemStyle: { color: '#2d78f4' } },
        ],
      },
    ],
  }
  creditChart.setOption(option)
}

const fetchData = async () => {
  try {
    const res: any = await getDataOverview()
    if (res.success && res.data) {
      // 订单信息卡片数据
      orderInfo.totalAmount = res.data.totalPrice || 0
      orderInfo.settledAmount = res.data.settTotalPrice || 0
      orderInfo.pendingAmount = res.data.unSettTotalPrice || 0

      const orderMonths = res.data.orderMonthsVoList || []
      const settMonths = res.data.orderMonthsSettVoList || []

      const orderMap = new Map()
      orderMonths.forEach((item: any) => {
        orderMap.set(item.month, item)
      })

      const settMap = new Map()
      settMonths.forEach((item: any) => {
        settMap.set(item.month, item.settTotalPrice)
      })

      const allMonths = new Set([...orderMap.keys(), ...settMap.keys()])
      const sortedMonths = Array.from(allMonths).sort((a: any, b: any) => Number(a) - Number(b))

      const xAxisData: string[] = []
      const totalData: number[] = []
      const settData: number[] = []
      const countData: number[] = []

      sortedMonths.forEach((month: any) => {
        const monthStr = month ? `${month.substring(4)}月` : ''
        xAxisData.push(monthStr)
        const orderItem = orderMap.get(month) || {}
        totalData.push(orderItem.totalPrice || 0)
        countData.push(Number(orderItem.total) || 0)
        const settPrice = settMap.get(month) || 0
        settData.push(settPrice)
      })

      initLineChart(xAxisData, totalData, settData)
      initBarChart(xAxisData, countData)
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchTodoCount = async () => {
  try {
    const res: any = await getTodoCount()
    if (res.success && res.data) {
      if (typeof res.data.unConfirmSupplementTotal !== 'undefined') {
        todoList.value[0].count = res.data.unConfirmSupplementTotal || 0
      }
      if (typeof res.data.unConfirmWorkTotal !== 'undefined') {
        todoList.value[1].count = res.data.unConfirmWorkTotal || 0
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchOrderStats = async () => {
  try {
    const res: any = await getOrderCount()
    if (res.success && res.data) {
      const data = res.data
      orderStats.total = data.totalCount ?? 0           // 全部
      orderStats.pendingPay = data.count0 ?? 0          // 已受理 (status: 1)
      orderStats.pendingComplete = data.count1 ?? 0    // 已预约 (status: 6)
      orderStats.pendingSettle = data.count2 ?? 0      // 待结算 (status: 12)
      orderStats.returnOrder = data.count3 ?? 0        // 服务中 (status: 8)
      orderStats.cancelled = data.count4 ?? 0          // 交付完成 (status: 9)
      orderStats.exception = data.count5 ?? 0          // 异常 (status: 16)
      orderStats.completed = data.count6 ?? 0          // 已完成 (status: 13)
    }
  } catch (e) {
    console.error('Error fetching order stats:', e)
  }
}

const fetchCreditInfo = async () => {
  try {
    const res: any = await getUserInfo()
    if (res.success && res.data?.creditAccount) {
      creditInfo.creditLimit = res.data.creditAccount.creditLimit || 0
      creditInfo.availableCredit = res.data.creditAccount.availableCredit || 0
      creditInfo.frozenBalance = res.data.creditAccount.frozenBalance || 0
      initCreditChart()
    }
  } catch (e) {
    console.error(e)
  }
}

const handleResize = () => {
  lineChart?.resize()
  barChart?.resize()
  creditChart?.resize()
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      fetchData(),
      fetchOrderPayInfo(),
      fetchTodoCount(),
      fetchOrderStats(),
      fetchCreditInfo()
    ])
  } finally {
    isLoading.value = false
  }
  setTimeout(() => {
    if (!lineChart) initLineChart()
    if (!barChart) initBarChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  barChart?.dispose()
  creditChart?.dispose()
})
</script>
<style scoped>
.orderinfo {
  background-image: url('/src/assets/images/titlebg.png');
  background-size: 100% 20%;
  background-repeat: no-repeat;
}
</style>
