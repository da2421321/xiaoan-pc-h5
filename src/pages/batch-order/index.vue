<template>
    <div class="flex w-full mx-auto gap-4 h-full">
        <div class="flex-1 flex flex-col gap-4 overflow-y-auto overflow-x-hidden pr-2 bg-white p-5 shadow-sm">
            <div>
                <div class="pb-2">批量下单</div>
                <div class="h-[3px] bg-[#F1F2F6]"></div>
            </div>

            <div class="batch-order">
                <!-- 下载模板按钮 -->
                <el-button type="primary" @click="handleDownloadTemplate" class="download-btn mb-6">
                    <img src="/src/assets/images/down.png" class="w-6 h-6" />
                    下载模板
                </el-button>

                <!-- 上传区域 -->
                <div class="upload-section mb-6">
                    <el-upload ref="uploadRef" class="upload-area" drag :auto-upload="false" :limit="1"
                        :on-change="handleFileChange" :before-upload="beforeUpload" accept=".xls,.xlsx">
                        <img src="/src/assets/images/upload.png" class="w-[100px] h-[100px] mb-10 mx-auto" />
                        <div class="upload-text">
                            <span class="text-blue-500 cursor-pointer">点击上传</span>或拖拽文件到此处上传
                        </div>
                        <div class="upload-hint">支持xls/xlsx，单个文件不超过10MB</div>
                    </el-upload>
                </div>

                <!-- 提交按钮 -->
                <div class="flex justify-center mb-6">
                    <el-button type="primary" class="submit-btn" :disabled="!hasFile || batchOrderList.length === 0"
                        :loading="submitting" @click="handleSubmitBatch">
                        提交
                    </el-button>
                </div>

                <!-- 订单列表表格 -->
                <div v-if="batchOrderList.length > 0" class="order-table-section">
                    <el-table :data="batchOrderList" :header-cell-style="{
                        background: '#f8fafc',
                        color: 'rgba(85, 85, 85, 1)',
                        fontWeight: '500',
                        height: '48px'
                    }" :row-style="{ color: '#333' }" stripe style="width: 100%" class="common-table-wrapper">
                        <el-table-column prop="price" label="订单金额" width="100">
                            <template #default="{ row }">
                                ¥{{ row.price?.toLocaleString() || 0 }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="realName" label="联系人" width="100" />
                        <el-table-column prop="phone" label="联系电话" width="130" />
                        <el-table-column prop="detail" label="服务地址" min-width="200" show-overflow-tooltip />
                        <el-table-column label="安装时间" width="180">
                            <template #default="{ row }">
                                {{ row.installTime }} {{ row.startTime }}-{{ row.endTime }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="projectName" label="项目分类" width="100" />
                        <el-table-column prop="content" label="订单内容" min-width="120" show-overflow-tooltip />
                        <el-table-column prop="equipmentTypeTxt" label="设备状态" width="100">
                            <template #default="{ row }">
                                <el-tag :type="getDeviceStatusType(row.equipmentType)">
                                    {{ row.equipmentTypeTxt }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="物流信息" width="120">
                            <template #default="{ row }">
                                {{ row.trackingCompanyTxt || '-' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="备注" width="150" show-overflow-tooltip>
                            <template #default="{ row }">
                                <span v-if="row.isException" class="text-red-500">{{ row.exceptionMsg || '-' }}</span>
                                <span v-else>-</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80" fixed="right">
                            <template #default="{ $index }">
                                <el-button type="danger" link @click="handleDeleteOrder($index)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, type UploadFile, type UploadInstance, type UploadRawFile } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { getTemplateFile, uploadOrderFile, batchOrder } from '@/api/order'

defineOptions({
    name: 'BatchOrderPage',
})

interface BatchOrderItem {
    customerNo: string
    price: number
    province: string
    city: string
    area: string
    detail: string
    detailAddress: string
    content: string
    realName: string
    phone: string
    installTime: string
    startTime: string
    endTime: string
    projectName: string
    projectTypeName: string
    itemCode: string
    itemName: string
    equipmentType: string
    equipmentTypeTxt: string
    trackingCompany: string
    trackingCompanyTxt: string
    trackingNumber: string
    serviceType: string
    serviceTypeTxt: string
    workTemplate: string
    workTemplateTxt: string
    isException: boolean
    exceptionMsg: string
    tmpId: number
}

const uploadRef = ref<UploadInstance>()
const hasFile = ref(false)
const submitting = ref(false)
const batchOrderList = ref<BatchOrderItem[]>([])
const currentFile = ref<UploadRawFile | null>(null)

// 下载模板
const handleDownloadTemplate = async () => {
    try {
        const res = await getTemplateFile('0') as { data: { filePath: string } }
        const link = document.createElement('a')
        link.href = res.data.filePath
        link.download = '批量下单模板.xlsx'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        ElMessage.success('模板下载成功')
    } catch (error) {
        console.error('下载模板失败:', error)
        ElMessage.error('下载模板失败')
    }
}

// 文件改变
const handleFileChange = async (file: UploadFile) => {
    if (file.raw) {
        uploadRef.value?.clearFiles()
        currentFile.value = file.raw
        hasFile.value = true
        await uploadAndParseFile(file.raw)
    }
}

// 上传并解析文件
const uploadAndParseFile = async (file: UploadRawFile) => {
    try {
        console.log(file)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('secretFlag', 'N')
        formData.append('fileLocation', '7')
        console.log(formData)
        const res = await uploadOrderFile(formData) as { code: string; data: BatchOrderItem[]; message?: string }
        if (res.code === '00000' && res.data) {
            batchOrderList.value = res.data.map((item, index) => ({
                ...item,
                tmpId: index,
                installTime: item.installTime?.replace(/\//g, '-') || item.installTime
            }))
            ElMessage.success('文件解析成功')
        } else {
            ElMessage.error(res.message || '文件解析失败')
        }
    } catch (error) {
        console.error('上传文件失败:', error)
        ElMessage.error('上传文件失败')
    }
}

// 上传前验证
const beforeUpload = (file: UploadRawFile) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
        ElMessage.warning('文件大小不能超过10MB')
        return false
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!['xls', 'xlsx'].includes(fileExt || '')) {
        ElMessage.warning('只支持xls/xlsx格式文件')
        return false
    }

    return true
}

// 获取设备状态类型 (0: 未寄出, 1: 到位, 2: 已寄出)
const getDeviceStatusType = (status: string) => {
    const map: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
        '0': 'warning',
        '1': 'info',
        '2': 'primary',
    }
    return map[status] || 'info'
}

// 删除订单
const handleDeleteOrder = (index: number) => {
    batchOrderList.value.splice(index, 1)
    ElMessage.success('已删除')
}

// 提交批量下单
const handleSubmitBatch = async () => {
    if (batchOrderList.value.length === 0) {
        ElMessage.warning('请先上传订单文件')
        return
    }

    try {
        submitting.value = true
        const res = await batchOrder(batchOrderList.value) as { code: string; message?: string }
        if (res.code === '00000') {
            ElMessage.success('批量下单成功')
            batchOrderList.value = []
            hasFile.value = false
            currentFile.value = null
            uploadRef.value?.clearFiles()
        } else {
            ElMessage.error(res.message || '批量下单失败')
        }
    } catch (error) {
        console.error('批量下单失败:', error)
        ElMessage.error('批量下单失败')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.batch-order {
    width: 100%;
}

.download-btn {
    background-color: rgba(8, 205, 252, 1) !important;
    border: none;
}

.upload-section {
    width: 100%;
}

.upload-area {
    width: 100%;
}

:deep(.el-upload-dragger) {
    width: 100%;
    padding: 40px 20px;
    border: 2px dashed #dcdfe6;
    background-color: #F5F8FF;
    border-radius: 8px;
    transition: all 0.3s;
}

.upload-icon {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 16px;
}

.upload-text {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
}

.upload-hint {
    font-size: 12px;
    color: #909399;
}

.submit-btn {
    width: 200px;
    height: 40px;
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    border-radius: 10px;
}

.order-table-section {
    margin-top: 20px;
}

:deep(.el-table th) {
    background-color: #f5f7fa !important;
}
</style>
