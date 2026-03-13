<template>
    <el-dialog v-model="dialogVisible" width="80%" :before-close="handleClose" class="fixed-layout-dialog"
        destroy-on-close :close-on-click-modal="false" top="5vh">
        <template #title>
            <!-- <div class="text-[16px] font-bold pb-2">深圳市科技有限公司</div> -->
            <div class="h-[3px]  bg-[#F1F2F6]"></div>
        </template>
        <div class="w-full p-4">
            <div class="flex flex-col gap-4">


                <div class="p-4 bg-white">
                    <div class="flex items-center gap-3 mb-4 h-4">
                        <div class="w-1 h-full bg-blue-600 rounded-full"></div>
                        <span class="text-base font-bold text-gray-800 leading-none">对账单信息</span>
                    </div>

                    <table class="w-full border-collapse reconciliation-info-table">
                        <tbody>
                            <tr>
                                <td class="label-cell">对账单ID</td>
                                <td class="value-cell">{{ reconciliationDetail.reconciliationId }}</td>
                                <td class="label-cell">联系人</td>
                                <td class="value-cell">{{ reconciliationDetail.contactPerson }}</td>
                            </tr>
                            <tr>
                                <td class="label-cell">收件公司</td>
                                <td class="value-cell">{{ reconciliationDetail.companyName }}</td>
                                <td class="label-cell">电话</td>
                                <td class="value-cell">{{ reconciliationDetail.contactPhone }}</td>
                            </tr>
                            <tr>
                                <td class="label-cell">对账单账期</td>
                                <td class="value-cell">{{ reconciliationDetail.period }}</td>
                                <td class="label-cell">创建时间</td>
                                <td class="value-cell">{{ reconciliationDetail.createTime }}</td>
                            </tr>
                            <tr>
                                <td class="label-cell">订单总金额</td>
                                <td class="value-cell">¥{{ formatAmount(reconciliationDetail.orderTotalAmount) }}</td>
                                <td class="label-cell">状态</td>
                                <td class="value-cell">
                                    <span class="text-blue-500 cursor-pointer hover:underline">{{
                                        reconciliationDetail.status
                                        }}</span>
                                </td>
                            </tr>
                            <tr>
                                <td class="label-cell">对账单金额</td>
                                <td class="value-cell">
                                    <span class="text-red-500 font-medium">¥{{
                                        formatAmount(reconciliationDetail.reconciliationAmount)
                                        }}</span>
                                </td>
                                <td class="label-cell"></td>
                                <td class="value-cell"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>


                <div class="p-4 bg-white">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="h-4 flex items-center gap-3">
                            <div class="w-1 h-full bg-blue-600 rounded-full"></div>
                            <span class="text-base font-bold text-gray-800 leading-none">上传付款凭证</span>
                        </div>
                        <span class="text-xs text-gray-400">（支持格式：PDF、JPG、PNG，可上传多个文件）</span>
                    </div>

                    <div class="mb-4">
                        <el-upload action="#" :auto-upload="true" :show-file-list="false"
                            :http-request="handleUploadRequest" :before-upload="beforeUpload" accept="image/*,.pdf"
                            multiple>
                            <el-button type="primary" class="!bg-blue-500 !border-blue-500 !px-6">
                                <el-icon class="mr-1">
                                    <Upload />
                                </el-icon> 上传付款凭证
                            </el-button>
                        </el-upload>
                    </div>

                    <div class="flex items-center gap-2 mb-4">
                        <div class="h-4 flex items-center gap-3">
                            <div class="w-1 h-full bg-blue-600 rounded-full"></div>
                            <span class="text-base font-bold text-gray-800 leading-none">对账单发票</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-4">
                        <div v-for="file in fileList" :key="file.uid || file.name"
                            class="flex items-center gap-3 p-3 border border-gray-200 rounded bg-white min-w-[320px] shadow-sm">

                            <div class="w-10 h-10 flex items-center justify-center bg-gray-50 rounded shrink-0 overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors"
                                @click="handlePreview(file)">
                                <img v-if="isImageFile(file.name) && file.url" :src="file.url"
                                    class="w-full h-full object-cover" @error="handleImageError" />
                                <div v-else-if="isPdfFile(file.name)"
                                    class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center shadow-sm">
                                    <div class="text-white text-xs font-bold">PDF</div>
                                </div>
                                <svg v-else class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm text-gray-800 font-bold truncate">{{ file.name }}</div>
                                <div class="text-xs text-gray-400 mt-1">上传时间：{{ (file as any).createTime || new
                                    Date().toLocaleString()
                                    }}
                                </div>
                            </div>
                            <div class="flex gap-1">
                                <el-button link type="primary" class="!text-blue-500" @click="handlePreview(file)">
                                    <el-icon class="text-lg">
                                        <View />
                                    </el-icon>
                                </el-button>
                                <el-button link type="primary" class="!text-green-500" @click="handleDownload(file)">
                                    <el-icon class="text-lg">
                                        <Download />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="p-4 bg-white">
                    <div class="flex items-center justify-between mb-4 h-4">
                        <div class="flex items-center gap-3 h-full">
                            <div class="w-1 h-full bg-blue-600 rounded-full"></div>
                            <span class="text-base font-bold text-gray-800 leading-none">费用反馈</span>
                        </div>
                    </div>


                    <div class="flex flex-col mb-6 border border-gray-200 rounded-lg" v-if="chatHistory.length > 0">
                        <div v-for="(msg, index) in chatHistory" :key="msg.id" class="flex flex-col p-3 w-full"
                            :class="{ 'border-b border-gray-200': index !== chatHistory.length - 1 }">

                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-3">
                                    <el-avatar :size="26" class="!bg-gray-100 !text-gray-400 shrink-0">
                                        <el-icon :size="16">
                                            <UserFilled />
                                        </el-icon>
                                    </el-avatar>
                                    <div class="flex items-center gap-2 text-sm">
                                        <span class="font-medium text-[#555555]">{{ msg.sender }}</span>
                                        <span class="text-gray-300">|</span>
                                        <span :class="msg.role === 'admin' ? 'text-gray-500' : 'text-blue-500'">
                                            {{ msg.role === 'admin' ? '管理员' : '客户' }}
                                        </span>
                                    </div>
                                </div>
                                <span class="text-xs text-gray-400">{{ msg.time }}</span>
                            </div>

                            <div class="text-sm text-[#333] leading-relaxed break-all pl-[38px]">
                                {{ msg.content }}
                            </div>
                        </div>
                    </div>


                    <div class="flex gap-4 items-center">
                        <div class="flex-1 relative">
                            <el-input v-model="inputFeedback" placeholder="请输入回复内容" class="feedback-input-styled" />
                        </div>
                        <el-button type="primary" class="!bg-blue-500 !border-blue-500 !px-8 !h-[36px]"
                            @click="sendFeedback">
                            发送
                        </el-button>
                    </div>
                </div>


                <div class="p-4 bg-white">
                    <div class="flex items-center justify-between mb-4 h-4">
                        <div class="flex items-center gap-3 h-full">
                            <div class="w-1 h-full bg-blue-600 rounded-full"></div>
                            <span class="text-base font-bold text-gray-800 leading-none">订单明细</span>
                        </div>
                    </div>

                    <CommonTable :data="orderDetailList.rows" :columns="orderColumns"
                        :total="orderDetailList.totalRows">
                        <template #status="{ row }">
                            <span class="px-2 py-1 rounded text-xs" :class="getStatusClass(row.status)">{{
                                getOrderStatusText(row.status) }}</span>
                        </template>
                        <template #amount="{ row }">
                            {{ formatAmount(row.totalPrice) }}
                        </template>
                        <template #pendingAmount="{ row }">
                            <span class="text-red-500 font-medium">{{ formatAmount((row.billAmount || 0) -
                                (row.billSettAmount || 0))
                                }}</span>
                        </template>
                        <template #contactInfo="{ row }">
                            <div class="flex flex-col leading-tight">
                                <span>{{ row.realName }}</span>
                                <span class="text-gray-400 text-xs">{{ row.userPhone }}</span>
                            </div>
                        </template>
                        <template #viewDetail="{ row }">
                            <el-button link size="small" @click="handleViewOrderDetail(row.orderId)"
                                class="!text-gray-500 hover:!text-blue-500">
                                <div
                                    class="flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5 bg-white shadow-sm hover:border-blue-300 transition-colors">
                                    <el-icon>
                                        <View />
                                    </el-icon>
                                    <span>查看</span>
                                </div>
                            </el-button>
                        </template>
                    </CommonTable>
                </div>

                <div class="h-8"></div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-center items-center w-full gap-4 py-2">
                <el-button color="rgba(49, 125, 254, 1)" class="!px-30   !h-10 !text-white !text-base !rounded-[10px]"
                    style="width: 230px;" :disabled="[1, 2, 3].includes(rawStatus)" @click="handleConfirm">
                    确认对账单
                </el-button>
                <el-button v-if="showCostQuestionButton" color="#DEEAFF"
                    class="!px-6 !h-10 !text-gray-600 !border-none !rounded-[10px]" @click="handleCostQuestion">
                    <div class="flex items-center gap-1">
                        <img src="/src/assets/images/cost-question.png" class="h-5 w-5" />
                        <span style="color:rgba(38, 80, 159, 1)">费用疑问反馈</span>
                    </div>
                </el-button>
            </div>
        </template>

        <OrderDetailModal v-model:visible="showOrderDetail" :orderId="selectedOrderId"></OrderDetailModal>

        <CostQuestionModal v-model:visible="showCostQuestionModal" :reconciliationId="reconciliationId"
            @confirm="handleCostQuestionConfirm" />

        <el-dialog v-model="previewDialogVisible" title="预览" width="800">
            <img v-if="previewType === 'image'" :src="previewUrl" style="width: 100%" alt="预览" />
            <iframe v-else-if="previewType === 'pdf'"
                :src="`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(previewUrl)}`"
                style="width: 100%; height: 500px; border: none" />
        </el-dialog>
    </el-dialog>
</template>

<script setup lang="ts">
import { uploadFile } from '@/api'
import {
    getReconciliationConfirm,
    getReconciliationDetail,
    getReconciliationOrderList,
    getReconciliationReply,
    getReconciliationUpload,
} from '@/api/reconciliation'
import CommonTable from '@/components/CommonTable.vue'
import { useLoadingStore } from '@/stores/loading'
import { Download, UserFilled, View } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import OrderDetailModal from '../order-list/order-detail/OrderDetailModal.vue'
import CostQuestionModal from './CostQuestionModal.vue'

// 动态加载PDF.js
let pdfjsLib: any = null

const loadPDFJS = async () => {
    if (pdfjsLib) return pdfjsLib

    try {
        // 从CDN加载PDF.js
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        document.head.appendChild(script)

        return new Promise((resolve, reject) => {
            script.onload = () => {
                pdfjsLib = (window as any).pdfjsLib
                // 配置worker
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
                resolve(pdfjsLib)
            }
            script.onerror = reject
        })
    } catch (error) {
        console.error('PDF.js加载失败:', error)
        return null
    }
}

// 组件挂载时预加载PDF.js
onMounted(() => {
    loadPDFJS()
})

interface ReconciliationInfo {
    reconciliationId: string
    companyName: string
    period: string
    orderTotalAmount: number
    reconciliationAmount: number
    contactPerson: string
    contactPhone: string
    status: string
    createTime: string
}


interface OrderBillMsgVo {
    id?: number
    billId?: number
    msgType?: number
    userName?: string
    userId?: number
    content?: string
    createTime?: string
    isDeleted?: number
}

const loadingStore = useLoadingStore()

const mapMessageRole = (msgType?: number): 'client' | 'admin' => {
    return msgType === 2 ? 'admin' : 'client'
}


const validateMessageInput = (input: string): boolean => {
    return input.trim().length > 0
}


const parseMessageList = (msgList: OrderBillMsgVo[]): ChatMessage[] => {
    return msgList
        .filter((msg) => msg.isDeleted !== 1)
        .map((msg) => ({
            id: msg.id || Date.now(),
            sender: msg.userName || '',
            role: mapMessageRole(msg.msgType),
            time: msg.createTime || '',
            content: msg.content || '',
        }))
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}

interface OrderItem {
    id?: number
    uid?: number
    orderId?: string
    createTime?: string
    paid?: boolean
    payTime?: string
    payType?: string
    payPrice?: number
    basicPrice?: number
    supplementPrice?: number
    status?: number
    orderStatus?: string
    totalNum?: number
    payPostage?: number
    refundStatus?: number
    refundReason?: string
    refundReasonTime?: string
    refundPrice?: number
    deliveryName?: string
    deliveryType?: string
    deliveryId?: string
    pinkId?: number
    bargainId?: number
    verifyCode?: string
    storeId?: number
    shippingType?: number
    activityType?: string
    type?: number
    proTotalPrice?: number
    bodyId?: number
    acceptBodyId?: number
    templateId?: number
    projectId?: number
    projectTypeId?: number
    projectName?: string
    projectTypeName?: string
    payMethod?: string
    installTime?: string
    startTime?: string
    endTime?: string
    isPreserve?: number
    equipmentType?: string
    totalPrice?: number
    expenditurePrice?: number
    trackingNumber?: string
    serviceType?: string
    workTemplate?: string
    thumps?: string
    itemName?: string
    itemCode?: string
    realName?: string
    userPhone?: string
    userAddress?: string
    province?: string
    city?: string
    orderUserName?: string
    outTradeNo?: string
    techniqueType?: string
    techniqueId?: number
    techniqueName?: string
    expectTime?: string
    completeTime?: string
    mark?: string
    remark?: string
    isChannel?: number
    updateTime?: string
    settleAmount?: number
    billAmount?: number
    billSettAmount?: number
    totalRows?: number
    workTotalFee?: number
    workExpectDate?: string
    acceptBodyName?: string
    customerInfo?: any
    acceptInfo?: any
    orderInfoList?: any[]
}

const props = withDefaults(defineProps<{ visible: boolean; reconciliationId?: string }>(), { visible: false })
const emit = defineEmits(['update:visible', 'confirm'])


const inputFeedback = ref('')
const showOrderDetail = ref(false)
const selectedOrderId = ref<string | number>('')
const showCostQuestionModal = ref(false)

const fileList = ref<UploadUserFile[]>([])
const previewDialogVisible = ref(false)
const previewUrl = ref('')
const previewType = ref<'image' | 'pdf' | ''>('')

const reconciliationDetail = ref<ReconciliationInfo>({
    reconciliationId: '',
    companyName: '',
    period: '',
    orderTotalAmount: 0,
    reconciliationAmount: 0,
    contactPerson: '',
    contactPhone: '',
    status: '',
    createTime: '',
})

// 保存原始状态值，用于控制按钮显示
const rawStatus = ref<number>(0)

// 状态为 3(已结算)、4(费用存疑)、99(废弃) 时隐藏费用疑问反馈按钮
const showCostQuestionButton = computed(() => ![3, 4, 99].includes(rawStatus.value))


interface ChatMessage {
    id: number
    sender: string
    role: 'client' | 'admin'
    time: string
    content: string
}

const chatHistory = ref<ChatMessage[]>([])

const orderColumns: { prop: string; label: string; width?: number; minWidth?: number; fixed?: 'left' | 'right' | boolean; slot?: string; align?: 'left' | 'center' | 'right' }[] = [
    { prop: 'orderId', label: '订单号', width: 140, fixed: 'left' },
    { prop: 'projectTypeName', label: '服务类型', width: 100 },
    { prop: 'projectName', label: '业务类型', width: 100 },
    { prop: 'itemName', label: '项目名称', minWidth: 140 },
    { prop: 'itemCode', label: '项目编号', width: 120 },
    { prop: 'createTime', label: '下单时间', width: 160 },
    { prop: 'status', label: '状态', width: 90, slot: 'status' },
    { prop: 'contactInfo', label: '联系人', width: 120, slot: 'contactInfo' },
    { prop: 'userAddress', label: '安装地址', minWidth: 180 },
    { prop: 'totalPrice', label: '订单金额', width: 110, align: 'right', slot: 'amount' },
    { prop: 'settleAmount', label: '待结算', width: 110, align: 'right', slot: 'pendingAmount' },
    { prop: 'viewDetail', label: '操作', width: 80, align: 'center', fixed: 'right', slot: 'viewDetail' },
]

const orderDetailList = ref<{
    pageNo: number
    pageSize: number
    totalPage: number
    totalRows: number
    rows: OrderItem[]
}>({
    pageNo: 1,
    pageSize: 20,
    totalPage: 0,
    totalRows: 0,
    rows: [],
})

const dialogVisible = computed({
    get: () => props.visible,
    set: (val: boolean) => emit('update:visible', val),
})

const handleClose = () => emit('update:visible', false)

const formatAmount = (num: number) =>
    num ? num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
}

const isPdfFile = (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.pdf')
}

const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    img.style.display = 'none'
}

const orderStatusMap: Record<number, string> = {
    0: '待付款',
    1: '已受理',
    6: '已预约',
    7: '已出发',
    8: '服务中',
    9: '交付完成',
    12: '待结算',
    13: '已完成',
    14: '已取消',
    16: '异常',
}

const getOrderStatusText = (status: number) => orderStatusMap[status] || '未知'

const getStatusClass = (status: number) => {
    if (status === 0) return 'bg-cyan-50 text-cyan-500'
    if (status === 12) return 'bg-green-50 text-green-500'
    if (status === 13 || status === 15) return 'bg-red-50 text-red-500'
    return 'bg-gray-100 text-gray-600'
}

const sendFeedback = async () => {
    if (!validateMessageInput(inputFeedback.value)) return

    const messageContent = inputFeedback.value
    try {
        await getReconciliationReply({
            id: props.reconciliationId,
            message: messageContent,
        })
        ElMessage.success('发送成功')
        inputFeedback.value = ''
        await loadDetail()
    } catch (error) {
        console.error('发送失败:', error)
        ElMessage.error('发送失败')
    }
}

const handleConfirm = () => {
    ElMessageBox.confirm('确认对账单金额无误？', '提示', { type: 'primary' }).then(async () => {
        try {
            await getReconciliationConfirm(props.reconciliationId!)
            ElMessage.success('已确认')
            emit('confirm')
            handleClose()
        } catch (error) {
            console.error('确认失败:', error)
            ElMessage.error('确认失败')
        }
    })
}

const handleCostQuestion = () => {
    showCostQuestionModal.value = true
}

const handleCostQuestionConfirm = () => {
    loadDetail()
    emit('confirm') // 通知父组件刷新列表
}

const handleViewOrderDetail = (orderId: string) => {
    selectedOrderId.value = orderId
    showOrderDetail.value = true
}


const beforeUpload = (file: File) => {
    const maxSize = 10 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']

    if (file.size > maxSize) {
        ElMessage.warning(`${file.name} 文件大小超过 10MB，请选择更小的文件`)
        return false
    }

    if (!allowedTypes.includes(file.type)) {
        ElMessage.warning(`${file.name} 文件类型不支持，仅支持图片和PDF格式`)
        return false
    }

    return true
}

const handleUploadRequest: UploadProps['httpRequest'] = async (options) => {
    const { file, onSuccess, onError } = options

    const loadingMsg = ElMessage({
        message: `正在上传 ${file.name}...`,
        type: 'info',
        duration: 0,
    })

    try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('secretFlag', 'N')
        formData.append('fileLocation', '1')

        const response = await uploadFile(formData)

        const fileUrl = (response as { data?: { fileUrl?: string } }).data?.fileUrl || ''
        if (fileUrl) {
            await getReconciliationUpload({
                billId: props.reconciliationId,
                url: fileUrl,
                fileName: file.name,
            })

            fileList.value.push({
                name: file.name,
                url: fileUrl,
                uid: Date.now(),
                status: 'success',
            })
            onSuccess({ url: fileUrl })

            ElMessage.success(`${file.name} 上传成功`)
        } else {
            throw new Error('上传失败，未获取到文件URL')
        }
    } catch (error) {
        console.error('文件上传失败:', error)
        onError(error as unknown as Parameters<typeof onError>[0])
        ElMessage.error(`${file.name} 上传失败`)
    } finally {
        loadingMsg.close()
    }
}

const handlePreview = (file: UploadUserFile) => {
    const url = file.url || (file.raw ? URL.createObjectURL(file.raw) : '')
    if (!url) return

    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.pdf')) {
        previewType.value = 'pdf'
    } else {
        previewType.value = 'image'
    }

    previewUrl.value = url
    previewDialogVisible.value = true
}

const handleDownload = (file: UploadUserFile) => {
    const url = file.url || (file.raw ? URL.createObjectURL(file.raw) : '')
    if (!url) {
        ElMessage.error('文件链接无效，无法下载')
        return
    }

    try {
        // 创建隐藏的a标签来下载文件
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        ElMessage.success(`${file.name} 下载成功`)
    } catch (error) {
        console.error('下载失败:', error)
        ElMessage.error(`${file.name} 下载失败`)
    }
}


const statusMap: Record<number, string> = {
    0: '待确认',
    1: '待结算',
    2: '部分已结算',
    3: '已结算',
    4: '费用存疑',
    99: '废弃'
}


const loadDetail = async () => {
    if (!props.reconciliationId) return
    loadingStore.show()
    try {
        const res = (await getReconciliationDetail(props.reconciliationId)) as { data: Record<string, unknown> }
        const data = res.data
        rawStatus.value = (data.status as number) || 0
        reconciliationDetail.value = {
            reconciliationId: (data.billNo as string) || '',
            companyName: (data.companyName as string) || '',
            period: `${data.startDate || ''} - ${data.endDate || ''}`,
            orderTotalAmount: (data.amount as number) || 0,
            reconciliationAmount: (data.actAmount as number) || 0,
            contactPerson: (data.linkName as string) || '',
            contactPhone: (data.linkPhone as string) || '',
            status: statusMap[rawStatus.value] || '',
            createTime: (data.createDate as string) || '',
        }

        const msgList = (data.orderBillMsgList as OrderBillMsgVo[]) || []
        chatHistory.value = parseMessageList(msgList)

        const certList = (data.attachList as Array<Record<string, unknown>>) || []
        fileList.value = certList.map((cert) => ({
            name: (cert.fileName as string) || '付款凭证',
            url: (cert.url as string) || '',
            uid: Number(cert.id) || Date.now(),
            status: 'success' as const,
            createTime: (cert.createTime as string) || '',
        }))
    } catch (error) {
        console.error('获取对账单详情失败:', error)
    } finally {
        loadingStore.hide()
    }
}


const loadOrderList = async () => {
    if (!props.reconciliationId) return
    try {
        const res = (await getReconciliationOrderList(props.reconciliationId)) as {
            data: {
                pageNo: number
                pageSize: number
                totalPage: number
                totalRows: number
                rows: OrderItem[]
            }
        }
        orderDetailList.value = {
            pageNo: res.data?.pageNo || 1,
            pageSize: res.data?.pageSize || 20,
            totalPage: res.data?.totalPage || 0,
            totalRows: res.data?.totalRows || 0,
            rows: res.data?.rows || [],
        }
    } catch (error) {
        console.error('获取订单明细失败:', error)
        orderDetailList.value = {
            pageNo: 1,
            pageSize: 20,
            totalPage: 0,
            totalRows: 0,
            rows: [],
        }
    }
}

watch(
    () => props.visible,
    (val) => {
        if (val && props.reconciliationId) {
            loadDetail()
            loadOrderList()
        }
    },
)
</script>

<style>
.fixed-layout-dialog.el-dialog {
    @apply overflow-hidden !p-0;
}

.el-dialog.fixed-layout-dialog {
    display: flex;
    flex-direction: column;
    height: 90vh;
    margin-bottom: 0 !important;
    border-radius: 8px;
    overflow: hidden;
}

.fixed-layout-dialog .el-dialog__header {
    margin-right: 0;
    padding: 15px 20px;
    flex-shrink: 0;
}

.fixed-layout-dialog .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
}

.fixed-layout-dialog .el-dialog__body {
    flex: 1;
    overflow-y: auto !important;
    min-height: 0;
    padding: 0 !important;
}

.fixed-layout-dialog .el-dialog__footer {
    padding: 10px 20px;
    flex-shrink: 0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

}

.reconciliation-info-table {
    width: 100%;
    border: 1px solid #EBEEF5;
    border-collapse: collapse;
}

.reconciliation-info-table td {
    border: 1px solid #EBEEF5;
    padding: 10px 16px;
    font-size: 14px;
    height: 44px;
}

.reconciliation-info-table .label-cell {
    background-color: #FAFAFA;
    color: #606266;
    width: 10%;
    text-align: right;
    font-weight: 400;
}

.reconciliation-info-table .value-cell {
    color: #303133;
    width: 25%;
}

.feedback-input-styled .el-input__wrapper {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    box-shadow: none !important;
    height: 38px;
    border-radius: 4px;
}

.feedback-input-styled .el-input__wrapper:hover {
    border-color: #c0c4cc;
}

.feedback-input-styled .el-input__wrapper.is-focus {
    border-color: #409eff;
}
</style>
