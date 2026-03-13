<template>
  <div class="flex w-full mx-auto px-3 pb-5 gap-4 h-full">
    <div class="flex-1 flex flex-col gap-4 overflow-y-auto overflow-x-hidden pr-2 bg-white p-5 shadow-sm ">
      <div>
        <div class="pb-2">创建订单</div>
        <div class="h-[3px]  bg-[#F1F2F6]"></div>
      </div>

      <div class="bg-white rounded-xl transition-all duration-300">
        <h3 class="text-base font-semibold mb-2 text-gray-900 relative pb-2">服务类型</h3>
        <div class="flex gap-3 flex-wrap">
          <button v-for="type in serviceTypes" :key="type.value"
            :class="['px-6 h-8 rounded text-sm cursor-pointer transition-all duration-300 font-medium bg-white text-gray-700', { '!bg-[#317DFE] !text-white !border-[#317DFE] shadow-lg': selectedServiceType === type.value }]"
            style="border: 1.5px solid #DCDFE6;" @click="handleServiceTypeChange(type.value)">
            {{ type.label }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl transition-all duration-300">
        <h3 class="text-base font-semibold mb-2 text-gray-900 relative pb-2">服务地址<span
            class="text-red-500 ml-1">*</span></h3>
        <div class="cursor-pointer w-[280px]" @click="showAddressModal = true">
          <el-input v-model="serviceAddressDisplay" placeholder="点击选择服务地址" readonly class="address-input">
            <template #suffix>
              <el-icon class="text-blue-500 text-lg">
                <Location />
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <template v-if="currentOrderType === 'normal'">
        <div class="form-section" v-for="items in templateItems" :key="items.id">
          <div v-if="items.isPay === false && items.items && items.items.length > 0">
            <h3 class="section-title">
              {{ items.name }}
              <span v-if="items.allowEmpty === 0" class="required">*</span>
            </h3>
            <div class="environment-row">
              <div class="form-item" v-for="(item, index) in items.items" :key="`${items.id}-${index}`">
                <!-- type="0" 文本输入 -->
                <template v-if="item.type === '0'">
                  <label>{{ item.name
                    }}<span v-if="items.allowEmpty === 0" class="required">*</span></label>
                  <el-input :model-value="String(formData[`${items.id}-${index}`] || '')"
                    @update:model-value="(val) => (formData[`${items.id}-${index}`] = val)"
                    :placeholder="`请输入${item.name}`" class="select-field" />
                </template>
                <!-- type="1" 单选 -->
                <template v-else-if="item.type === '1'">
                  <label>请选择{{ item.name
                    }}<span v-if="items.allowEmpty === 0" class="required">*</span></label>
                  <el-select v-model="formData[`${items.id}-${index}`]" :placeholder="`请选择${item.name}`"
                    :multiple="false" class="select-field">
                    <el-option v-for="option in item.options" :key="option" :value="option" :label="option"></el-option>
                  </el-select>
                </template>
                <!-- type="2" 多选 -->
                <template v-else-if="item.type === '2'">
                  <label>请选择{{ item.name
                    }}<span v-if="items.allowEmpty === 0" class="required">*</span></label>
                  <el-select v-model="formData[`${items.id}-${index}`]" :placeholder="`请选择${item.name}`"
                    :multiple="true" :collapse-tags="true" :collapse-tags-tooltip="true" class="select-field">
                    <el-option v-for="option in item.options" :key="option" :value="option" :label="option"></el-option>
                  </el-select>
                </template>
              </div>
            </div>
          </div>
          <div v-if="items.isPay === true && items.items && items.items.length > 0">
            <div class="section-header">
              <h3 class="section-title">{{ items.name }}<span v-if="items.allowEmpty === 0" class="required">*</span>
              </h3>
              <span class="subtitle" v-if="items.remark">{{ items.remark }}</span>
              <button class="view-prices" @click="openPriceModal(items)">
                查看价格
                <el-icon class="arrow-icon">
                  <ArrowRight />
                </el-icon>
              </button>
            </div>
            <div class="input-grid">
              <div class="input-item" v-for="(item, index) in items.items" :key="`${items.id}-${index}`">
                <label>{{ item.name }}({{ item.unit || '个' }})<span v-if="items.allowEmpty === 0"
                    class="required">*</span></label>
                <el-input :model-value="getNumberValue(`${items.id}-${index}`)"
                  @update:model-value="(val) => setNumberValue(`${items.id}-${index}`, val)"
                  :placeholder="`请输入${item.name}数量`" type="number" min="0" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-if="currentOrderType === 'custom'">
        <div class="form-section">
          <h3 class="section-title">自定义订单信息</h3>
          <div class="custom-order-row">
            <div class="form-item">
              <label>服务客户<span class="required">*</span></label>
              <el-input v-model="customOrder.customerID" disabled placeholder="请输入客户ID" />
            </div>
            <div class="form-item">
              <label>订单金额(元)<span class="required">*</span></label>
              <el-input v-model="customOrder.amount" type="number" min="0" placeholder="请输入订单金额" />
            </div>
          </div>
          <div class="form-item content-item" style="margin-bottom: 20px">
            <label>订单内容<span class="required">*</span></label>
            <el-input v-model="customOrder.content" type="textarea" placeholder="请输入详细订单内容" class="custom-textarea" />
          </div>
          <div class="form-item attachment-item">
            <label class="attachment-label">订单附件<span class="attachment-note">（最多上传5个文件，支持图片和PDF格式）</span></label>
            <el-upload v-model:file-list="customFileList" :http-request="handleUploadRequest" :limit="5"
              :on-exceed="handleExceed" :on-preview="handlePreview" :before-upload="beforeUpload" accept="image/*,.pdf"
              list-type="picture-card" multiple>
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
          </div>
        </div>
      </template>

      <div class="form-section">
        <h3 class="section-title">联系人信息<span class="required">*</span></h3>
        <div class="contact-row">
          <div class="form-item">
            <label>联系人姓名<span class="required">*</span></label>
            <el-autocomplete ref="contactAutocompleteRef" v-model="contact.name" :fetch-suggestions="queryContactSearch"
              placeholder="请输入联系人姓名" class="w-full" :popper-append-to-body="false">
              <template #default="{ item }">
                <div class="flex items-center justify-between w-full">
                  <span>{{ item.value }}</span>
                  <el-icon class="delete-icon" @click.stop="deleteContactHistory(item.value)">
                    <Close />
                  </el-icon>
                </div>
              </template>
            </el-autocomplete>
          </div>
          <div class="form-item">
            <label>联系人电话<span class="required">*</span></label>
            <el-autocomplete ref="phoneAutocompleteRef" v-model="contact.phone" :fetch-suggestions="queryPhoneSearch"
              placeholder="输入电话" class="w-full" :popper-append-to-body="false">
              <template #default="{ item }">
                <div class="flex items-center justify-between w-full">
                  <span>{{ item.value }}</span>
                  <el-icon class="delete-icon" @click.stop="deletePhoneHistory(item.value)">
                    <Close />
                  </el-icon>
                </div>
              </template>
            </el-autocomplete>
          </div>
          <div class="form-item">
            <label>安装日期<span class="required">*</span></label>
            <el-date-picker v-model="contact.installDate" type="date" placeholder="请选择安装日期" class="select-field"
              format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </div>
        </div>
        <div class="contact-row">
          <div class="form-item mt-3">
            <label>安装时间段<span class="required">*</span></label>
            <el-select v-model="installTimePeriod" placeholder="请选择时间段" class="select-field"
              @change="handleTimePeriodChange">
              <el-option label="早上" value="morning"></el-option>
              <el-option label="下午" value="afternoon"></el-option>
              <el-option label="晚上" value="evening"></el-option>
            </el-select>
          </div>
          <div class="form-item mt-3" v-if="installTimePeriod">
            <label>开始时间<span class="required">*</span></label>
            <el-time-select v-model="installStartTime" :start="getTimeRangeStart()" :end="getTimeRangeEnd()"
              step="00:30" placeholder="请选择开始时间" class="select-field" @change="handleStartTimeChange" />
          </div>
          <div class="form-item mt-3" v-if="installTimePeriod">
            <label>结束时间<span class="required">*</span></label>
            <el-time-select v-model="installEndTime" :start="getEndTimeStart()" :end="getTimeRangeEnd()" step="00:30"
              :min-time="getMinEndTime()" placeholder="请选择结束时间" class="select-field" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-title">设备邮寄<span class="required">*</span></h3>
        <div class="shipping-row">
          <div class="form-item">
            <label>设备邮寄状态<span class="required">*</span></label>
            <el-select v-model="shipping.status" placeholder="请选择" class="select-field">
              <el-option value="0" label="设备到位"></el-option>
              <el-option value="1" label="设备未寄出"></el-option>
              <el-option value="2" label="设备已寄出"></el-option>
            </el-select>
          </div>
          <div class="form-item" v-if="shipping.status === '2'">
            <label>请输入物流单号<span class="required">*</span></label>
            <el-input v-model="shipping.trackingNumber" placeholder="请输入" />
          </div>
          <div class="form-item" v-if="shipping.status === '2'">
            <label>快递公司<span class="required">*</span></label>
            <el-select v-model="shipping.courier" placeholder="请选择" class="select-field">
              <el-option v-for="item in districtList" :key="item.id" :label="item.name" :value="item.code"></el-option>
            </el-select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-title">其他配置<span class="required">*</span></h3>
        <div class="config-row">
          <div class="form-item">
            <label>服务名义<span class="required">*</span></label>
            <div class="service-name-options">
              <button :class="['option-btn', { active: otherConfig.serviceName === '小安派工' }]"
                @click="otherConfig.serviceName = '小安派工'">
                小安派工
              </button>
              <button :class="['option-btn', { active: otherConfig.serviceName === '其他' }]"
                @click="otherConfig.serviceName = '其他'">
                其他
              </button>
            </div>
          </div>
          <div class="form-item flex-grow">
            <label>工单模板<span class="required">*</span></label>
            <div class="template-options">
              <button :class="['option-btn', { active: otherConfig.template === '小安模板' }]"
                @click="otherConfig.template = '小安模板'">
                小安模板
              </button>
              <button :class="['option-btn', { active: otherConfig.template === '不需要模板' }]"
                @click="otherConfig.template = '不需要模板'">
                不需要模板
              </button>
              <button :class="['option-btn', { active: otherConfig.template === '其他' }]"
                @click="otherConfig.template = '其他'">
                其他
              </button>
            </div>
          </div>
        </div>
        <div class="config-row" v-if="otherConfig.serviceName === '其他'">
          <div class="form-item mt-6">
            <label>请输入服务名义<span class="required">*</span></label>
            <el-autocomplete ref="serviceNameAutocompleteRef" v-model="otherConfig.customServiceName"
              :fetch-suggestions="queryServiceNameSearch" placeholder="请输入服务名义" class="w-full"
              :popper-append-to-body="false">
              <template #default="{ item }">
                <div class="flex items-center justify-between w-full">
                  <span>{{ item.value }}</span>
                  <el-icon class="delete-icon" @click.stop="deleteServiceNameHistory(item.value)">
                    <Close />
                  </el-icon>
                </div>
              </template>
            </el-autocomplete>
          </div>
        </div>
        <div class="form-item attachment-item mt-6" v-if="otherConfig.template === '其他'">
          <label class="attachment-label">上传模板文件<span class="attachment-note">（最多上传5个文件，支持图片和PDF格式）</span></label>
          <el-upload v-model:file-list="templateFileList" :http-request="handleUploadRequest" :limit="5"
            :on-exceed="handleExceed" :on-preview="handlePreview" :before-upload="beforeUpload" accept="image/*,.pdf"
            list-type="picture-card" multiple>
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-title">备注信息</h3>
        <div class="form-item remark-item">
          <el-input v-model="remarkInfo.content" type="textarea" placeholder="请输入备注信息" class="custom-textarea" />
        </div>
      </div>

      <div class="form-section">
        <div class="attachment-info">
          <h3 class="section-title">订单附件</h3>
          <span class="attachment-note">（最多上传5个文件，支持图片和PDF格式）</span>
        </div>
        <el-upload v-model:file-list="fileList" :http-request="handleUploadRequest" :limit="5" :on-exceed="handleExceed"
          :on-preview="handlePreview" :before-upload="beforeUpload" accept="image/*,.pdf" list-type="picture-card"
          multiple>
          <el-icon>
            <Plus />
          </el-icon>
        </el-upload>
      </div>

      <div class="form-section">
        <h3 class="section-title">项目名称与编号</h3>
        <div class="shop-row">
          <div class="form-item">
            <label>项目名称</label>
            <el-input v-model="shopInfo.itemName" placeholder="请输入" />
          </div>
          <div class="form-item">
            <label>项目编号</label>
            <el-input v-model="shopInfo.itemCode" placeholder="请输入" />
          </div>
        </div>
        <div class="submit-order-section">
          <button class="submit-order-btn" :disabled="submittingOrder" @click="handlesubmitOrder">
            {{ submittingOrder ? '提交中...' : '提交' }}
          </button>
        </div>
      </div>
    </div>

    <div class="cost-summary">
      <h3 class="summary-title">费用清单</h3>
      <div class="h-[3px]  bg-[#F1F2F6]"></div>
      <div class="cost-details">
        <div class="service-type-row">
          <span class="label">服务类型：</span>
          <span class="value">{{ getServiceTypeName() }}</span>
        </div>
        <template v-if="currentOrderType === 'normal'">
          <div v-for="(costItem, index) in getCostItems()" :key="index" class="cost-item">
            <span class="item-name">{{ costItem.name }}</span>
            <span class="item-quantity">{{ costItem.quantity }}{{ costItem.unit }}</span>
            <span class="item-price">¥ {{ costItem.total.toFixed(2) }}</span>
          </div>
          <div v-if="getCostItems().length === 0" class="cost-item">
            <span class="item-name">暂无费用</span>
            <span class="item-quantity"></span>
            <span class="item-price">¥ 0.00</span>
          </div>
        </template>
        <template v-if="currentOrderType === 'custom'">
          <div class="cost-item" v-if="Number(customOrder.amount) > 0">
            <span class="item-name">自定义金额</span>
            <span class="item-quantity"></span>
            <span class="item-price">¥ {{ Number(customOrder.amount).toFixed(2) }}</span>
          </div>
        </template>
        <div class="total-cost">
          <span class="total-label">合计：</span>
          <span class="total-amount">¥ {{ calculateTotal() }}</span>
        </div>
      </div>
      <button class="submit-btn" :disabled="submittingOrder" @click="handlesubmitOrder">
        {{ submittingOrder ? '提交中...' : '提交订单' }}
      </button>
    </div>

    <!-- 价格查看弹窗 -->
    <el-dialog v-model="priceModalVisible" :title="`${currentPriceGroup?.name || '价格明细'}`" width="600px">
      <div class="price-list">
        <div v-if="currentPriceGroup?.items && currentPriceGroup.items.length > 0">
          <div class="price-item" v-for="(item, index) in currentPriceGroup.items" :key="index">
            <div class="price-item-left">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-unit" v-if="item.unit">({{ item.unit }})</span>
            </div>
            <div class="price-item-right">
              <span class="item-price" v-if="item.price">¥{{ item.price }}</span>
              <span class="item-price no-price" v-else>价格待定</span>
            </div>
          </div>
        </div>
        <div v-else class="no-data">
          <span>暂无价格信息</span>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="priceModalVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <!-- 服务地址弹窗 -->
    <ServiceAddressModal v-model="showAddressModal" @submit="handleAddressSubmit" />

    <!-- 下单成功弹窗 -->
    <OrderSuccessModal v-model="showSuccessModal" :order-info="orderSuccessInfo" />

    <Loading :visible="loadingVisible" :text="loadingText" />
    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="预览" width="800px">
      <img v-if="previewType === 'image'" :src="previewUrl" style="width: 100%" alt="预览" />
      <iframe v-else-if="previewType === 'pdf'" :src="previewUrl" style="width: 100%; height: 500px; border: none" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CategoryDetail',
})
import {
  createOrder,
  getDistrictList,
  getProjectDetail,
  getProjectList,
  getTemplateDetail,
  getUserInfo,
  submitOrder,
  uploadFile,
} from '@/api'
import Loading from '@/components/modals/loading.vue'
import OrderSuccessModal from '@/components/modals/OrderSuccessModal.vue'
import ServiceAddressModal from '@/components/modals/ServiceAddressModal.vue'
import { useOrderFormStore } from '@/stores/orderForm'
import { Plus, Close } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

interface District {
  id: string
  name: string
  code: string
}
interface CreateOrderData {
  payChannel: string
  payType: string
  preOrderNo: string
}
interface TemplateItem {
  name: string
  type: string
  isPay: string
  options: string[]
  unit?: string
  price?: number
}

interface TemplateGroup {
  id: string
  templateId: string
  name: string
  isPay: boolean
  allowEmpty: number
  remark: string | null
  items?: TemplateItem[]
}

const route = useRoute()
const orderFormStore = useOrderFormStore()

const currentOrderType = ref<string>('normal')
const categoryId = ref<string>((route.query.categoryId as string) || '')
const projectInfo = ref<{ id: string; title: string } | null>(null)

// 当前分类的表单数据（从 store 获取）
const currentFormStore = computed(() => orderFormStore.getFormData(categoryId.value))

interface AddressData {
  contact: string
  phone: string
  province: string
  city: string
  district: string
  detailAddress: string
}
const createOrderData = ref<CreateOrderData>({
  payChannel: 'public',
  payType: 'weixin',
  preOrderNo: '',
})
const selectedServiceType = ref<string>('')
const showAddressModal = ref<boolean>(false)
const templateItems = ref<TemplateGroup[]>([])
const serviceTypes = ref<{ label: string; value: string; id: string }[]>([])
const priceModalVisible = ref<boolean>(false)
const currentPriceGroup = ref<TemplateGroup | null>(null)
const districtList = ref<District[]>([])
const showSuccessModal = ref<boolean>(false)
const orderSuccessInfo = ref({
  serviceName: '',
  orderNo: '',
  amount: '',
})

// 使用 computed 双向绑定 store 数据
const serviceAddressDisplay = computed({
  get: () => currentFormStore.value.serviceAddressDisplay,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { serviceAddressDisplay: val })
})
const serviceAddressData = computed({
  get: () => currentFormStore.value.serviceAddressData,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { serviceAddressData: val })
})
const formData = computed({
  get: () => currentFormStore.value.formData,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { formData: val })
})
const contact = computed({
  get: () => currentFormStore.value.contact,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { contact: val })
})
const shipping = computed({
  get: () => currentFormStore.value.shipping,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { shipping: val })
})
const otherConfig = computed({
  get: () => currentFormStore.value.otherConfig,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { otherConfig: val })
})
const remarkInfo = computed({
  get: () => currentFormStore.value.remarkInfo,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { remarkInfo: val })
})
const fileList = computed({
  get: () => currentFormStore.value.fileList,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { fileList: val })
})
const customFileList = computed({
  get: () => currentFormStore.value.customFileList,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { customFileList: val })
})
const templateFileList = computed({
  get: () => currentFormStore.value.templateFileList,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { templateFileList: val })
})
const customOrder = computed({
  get: () => currentFormStore.value.customOrder,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { customOrder: val })
})
const shopInfo = computed({
  get: () => currentFormStore.value.shopInfo,
  set: (val) => orderFormStore.updateFormData(categoryId.value, { shopInfo: val })
})

// 预览相关
const previewDialogVisible = ref(false)
const previewUrl = ref('')
const previewType = ref<'image' | 'pdf' | ''>('')

const pageLoading = ref<boolean>(false)
const submittingOrder = ref<boolean>(false)
const loadingVisible = computed(() => pageLoading.value || submittingOrder.value)
const loadingText = computed(() => (submittingOrder.value ? '订单提交中，请稍候...' : '加载中，请稍候...'))

// autocomplete refs
const contactAutocompleteRef = ref()
const phoneAutocompleteRef = ref()
const serviceNameAutocompleteRef = ref()

// 安装时间段选择相关
const installTimePeriod = ref<string>('')
const installStartTime = ref<string>('')
const installEndTime = ref<string>('')

// 时间段配置
const timePeriodConfig = {
  morning: { start: '09:00', end: '12:30', label: '早上' },
  afternoon: { start: '14:00', end: '18:30', label: '下午' },
  evening: { start: '18:30', end: '23:30', label: '晚上' }
}

// 处理时间段变化
const handleTimePeriodChange = (period: string) => {
  const config = timePeriodConfig[period as keyof typeof timePeriodConfig]
  if (config) {
    installStartTime.value = config.start
    installEndTime.value = config.end
    updateInstallTimeRange()
  }
}

// 处理开始时间变化
const handleStartTimeChange = () => {
  // 如果结束时间早于或等于开始时间，自动调整结束时间
  if (installEndTime.value && installStartTime.value >= installEndTime.value) {
    const [hours, minutes] = installStartTime.value.split(':').map(Number)
    const newMinutes = minutes + 30
    if (newMinutes >= 60) {
      installEndTime.value = `${String(hours + 1).padStart(2, '0')}:${String(newMinutes - 60).padStart(2, '0')}`
    } else {
      installEndTime.value = `${String(hours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
    }
  }
  updateInstallTimeRange()
}

// 获取时间范围的开始时间
const getTimeRangeStart = (): string => {
  if (!installTimePeriod.value) return '09:00'
  const config = timePeriodConfig[installTimePeriod.value as keyof typeof timePeriodConfig]
  return config?.start || '09:00'
}

// 获取时间范围的结束时间
const getTimeRangeEnd = (): string => {
  if (!installTimePeriod.value) return '23:30'
  const config = timePeriodConfig[installTimePeriod.value as keyof typeof timePeriodConfig]
  return config?.end || '23:30'
}

// 获取结束时间选择器的开始时间
const getEndTimeStart = (): string => {
  return installStartTime.value || getTimeRangeStart()
}

// 获取最小结束时间（开始时间 + 30分钟）
const getMinEndTime = (): string => {
  if (!installStartTime.value) return ''
  const [hours, minutes] = installStartTime.value.split(':').map(Number)
  const newMinutes = minutes + 30
  if (newMinutes >= 60) {
    return `${String(hours + 1).padStart(2, '0')}:${String(newMinutes - 60).padStart(2, '0')}`
  }
  return `${String(hours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}

// 更新 contact.installTimeRange 格式为 "HH:mm:ss,HH:mm:ss"
const updateInstallTimeRange = () => {
  if (installStartTime.value && installEndTime.value) {
    contact.value.installTimeRange = `${installStartTime.value}:00,${installEndTime.value}:00`
  }
}

// 监听结束时间变化
watch(installEndTime, () => {
  updateInstallTimeRange()
})

interface CostItem {
  name: string
  quantity: number
  unit: string
  price: number
  total: number
}

const getServiceTypeName = (): string => {
  const serviceType = serviceTypes.value.find(
    (t: { label: string; value: string; id: string }) => t.value === selectedServiceType.value,
  )
  return serviceType?.label || selectedServiceType.value
}

// 辅助函数：获取数字类型的表单值
const getNumberValue = (key: string): number => {
  const value = formData.value[key]
  return typeof value === 'number' ? value : 0
}

// 辅助函数：设置数字类型的表单值
const setNumberValue = (key: string, val: string | number) => {
  formData.value[key] = Number(val) || 0
}

// ========== 输入历史记录功能 ==========
const STORAGE_KEYS = {
  contact: 'address_contact_history', // 与 ServiceAddressModal 共用
  phone: 'address_phone_history', // 与 ServiceAddressModal 共用
  serviceName: 'service_name_history',
}
const MAX_HISTORY_COUNT = 3

// 历史记录响应式变量
const contactHistory = ref<string[]>([])
const phoneHistory = ref<string[]>([])
const serviceNameHistory = ref<string[]>([])

// 从 localStorage 加载历史记录
const loadHistory = () => {
  try {
    const contacts = localStorage.getItem(STORAGE_KEYS.contact)
    const phones = localStorage.getItem(STORAGE_KEYS.phone)
    const serviceNames = localStorage.getItem(STORAGE_KEYS.serviceName)

    contactHistory.value = contacts ? JSON.parse(contacts) : []
    phoneHistory.value = phones ? JSON.parse(phones) : []
    serviceNameHistory.value = serviceNames ? JSON.parse(serviceNames) : []
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 保存单条历史记录
const saveToHistory = (key: string, value: string, historyRef: typeof contactHistory) => {
  if (!value || !value.trim()) return

  const trimmedValue = value.trim()
  // 去重：如果已存在则移到最前面
  const newHistory = historyRef.value.filter(item => item !== trimmedValue)
  newHistory.unshift(trimmedValue)

  // 限制最大数量
  if (newHistory.length > MAX_HISTORY_COUNT) {
    newHistory.splice(MAX_HISTORY_COUNT)
  }

  historyRef.value = newHistory
  localStorage.setItem(key, JSON.stringify(newHistory))
}

// 保存所有输入的历史记录
const saveAllHistory = () => {
  saveToHistory(STORAGE_KEYS.contact, contact.value.name, contactHistory)
  saveToHistory(STORAGE_KEYS.phone, contact.value.phone, phoneHistory)
  saveToHistory(STORAGE_KEYS.serviceName, otherConfig.value.customServiceName, serviceNameHistory)
}

// el-autocomplete 查询函数
const queryContactSearch = (queryString: string, cb: (results: any[]) => void) => {
  // 如果查询字符串为空，显示所有历史记录
  if (!queryString || queryString.trim() === '') {
    cb(contactHistory.value.map((item) => ({ value: item })))
    return
  }

  // 如果查询字符串与历史记录完全匹配，不显示建议
  const exactMatch = contactHistory.value.some(item => item === queryString)
  if (exactMatch) {
    cb([])
    return
  }

  // 否则显示匹配的历史记录
  const results = contactHistory.value
    .filter((item) => item.toLowerCase().includes(queryString.toLowerCase()))
    .map((item) => ({ value: item }))
  cb(results)
}

const queryPhoneSearch = (queryString: string, cb: (results: any[]) => void) => {
  // 如果查询字符串为空，显示所有历史记录
  if (!queryString || queryString.trim() === '') {
    cb(phoneHistory.value.map((item) => ({ value: item })))
    return
  }

  // 如果查询字符串与历史记录完全匹配，不显示建议
  const exactMatch = phoneHistory.value.some(item => item === queryString)
  if (exactMatch) {
    cb([])
    return
  }

  // 否则显示匹配的历史记录
  const results = phoneHistory.value
    .filter((item) => item.includes(queryString))
    .map((item) => ({ value: item }))
  cb(results)
}

const queryServiceNameSearch = (queryString: string, cb: (results: any[]) => void) => {
  // 如果查询字符串为空，显示所有历史记录
  if (!queryString || queryString.trim() === '') {
    cb(serviceNameHistory.value.map((item) => ({ value: item })))
    return
  }

  // 如果查询字符串与历史记录完全匹配，不显示建议
  const exactMatch = serviceNameHistory.value.some(item => item === queryString)
  if (exactMatch) {
    cb([])
    return
  }

  // 否则显示匹配的历史记录
  const results = serviceNameHistory.value
    .filter((item) => item.toLowerCase().includes(queryString.toLowerCase()))
    .map((item) => ({ value: item }))
  cb(results)
}

// 删除历史记录函数
const deleteContactHistory = (value: string) => {
  // 更新数据
  contactHistory.value = contactHistory.value.filter(item => item !== value)
  localStorage.setItem(STORAGE_KEYS.contact, JSON.stringify(contactHistory.value))

  // 立即更新下拉列表
  nextTick(() => {
    if (contactAutocompleteRef.value) {
      if (contactHistory.value.length > 0) {
        // 还有历史记录，更新建议列表
        const currentValue = contact.value.name || ''
        const newSuggestions = contactHistory.value
          .filter((item) => !currentValue || item.toLowerCase().includes(currentValue.toLowerCase()))
          .map((item) => ({ value: item }))

        // 直接更新组件的建议列表
        contactAutocompleteRef.value.suggestions = newSuggestions
      } else {
        // 没有历史记录了，先清空建议列表再关闭，防止缓存旧数据
        contactAutocompleteRef.value.suggestions = []
        contactAutocompleteRef.value.close()
      }
    }
  })
}

const deletePhoneHistory = (value: string) => {
  // 更新数据
  phoneHistory.value = phoneHistory.value.filter(item => item !== value)
  localStorage.setItem(STORAGE_KEYS.phone, JSON.stringify(phoneHistory.value))

  // 立即更新下拉列表
  nextTick(() => {
    if (phoneAutocompleteRef.value) {
      if (phoneHistory.value.length > 0) {
        // 还有历史记录，更新建议列表
        const currentValue = contact.value.phone || ''
        const newSuggestions = phoneHistory.value
          .filter((item) => !currentValue || item.includes(currentValue))
          .map((item) => ({ value: item }))

        // 直接更新组件的建议列表
        phoneAutocompleteRef.value.suggestions = newSuggestions
      } else {
        // 没有历史记录了，先清空建议列表再关闭，防止缓存旧数据
        phoneAutocompleteRef.value.suggestions = []
        phoneAutocompleteRef.value.close()
      }
    }
  })
}

const deleteServiceNameHistory = (value: string) => {
  // 更新数据
  serviceNameHistory.value = serviceNameHistory.value.filter(item => item !== value)
  localStorage.setItem(STORAGE_KEYS.serviceName, JSON.stringify(serviceNameHistory.value))

  // 立即更新下拉列表
  nextTick(() => {
    if (serviceNameAutocompleteRef.value) {
      if (serviceNameHistory.value.length > 0) {
        // 还有历史记录，更新建议列表
        const currentValue = otherConfig.value.customServiceName || ''
        const newSuggestions = serviceNameHistory.value
          .filter((item) => !currentValue || item.toLowerCase().includes(currentValue.toLowerCase()))
          .map((item) => ({ value: item }))

        // 直接更新组件的建议列表
        serviceNameAutocompleteRef.value.suggestions = newSuggestions
      } else {
        // 没有历史记录了，先清空建议列表再关闭，防止缓存旧数据
        serviceNameAutocompleteRef.value.suggestions = []
        serviceNameAutocompleteRef.value.close()
      }
    }
  })
}

const getUserInfos = async () => {
  const res = await getUserInfo()
  if (res.code === '00000') {
    customOrder.value.customerID = res.data.uid
  }
}

const getProjectInfo = async () => {
  if (categoryId.value) {
    try {
      pageLoading.value = true

      // 先获取项目列表，找到当前分类的名称
      const projectListRes = await getProjectList() as { code: string; data: { id: string; name: string }[] }
      let projectTitle = ''
      if (projectListRes.code === '00000' && projectListRes.data) {
        const currentProject = projectListRes.data.find(item => item.id === categoryId.value)
        if (currentProject) {
          projectTitle = currentProject.name
        }
      }

      const res = await getProjectDetail(categoryId.value)
      if (res.code === '00000') {
        // 存储项目基本信息（使用从项目列表获取的名称）
        projectInfo.value = {
          id: categoryId.value,
          title: projectTitle,
        }
        res.data.forEach((item: TemplateGroup) => {
          serviceTypes.value.push({
            label: item.name,
            value: item.templateId,
            id: item.id,
          })
        })
        // 默认选择第一个服务类型
        if (serviceTypes.value.length > 0) {
          await handleServiceTypeChange(serviceTypes.value[0].value)
        }
      }
    } catch (error) {
      console.error('获取项目详情失败:', error)
    } finally {
      pageLoading.value = false
    }
  }
}

const getCostItems = (): CostItem[] => {
  const costItems: CostItem[] = []
  templateItems.value.forEach((group: TemplateGroup) => {
    if (group.isPay && group.items) {
      group.items.forEach((item: TemplateItem, index: number) => {
        const key = `${group.id}-${index}`
        const quantity = Number(formData.value[key]) || 0

        if (quantity > 0 && item.price) {
          costItems.push({
            name: item.name,
            quantity: quantity,
            unit: item.unit || '个',
            price: item.price,
            total: quantity * item.price,
          })
        }
      })
    }
  })

  return costItems
}

const calculateTotal = () => {
  if (currentOrderType.value === 'custom') {
    return (Number(customOrder.value.amount) || 0).toFixed(2)
  }

  const costItems = getCostItems()
  const total = costItems.reduce((sum, item) => sum + item.total, 0)
  return total.toFixed(2)
}

// 处理文件超出限制
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning('最多只能上传5个文件')
}

// 文件上传前验证
const beforeUpload = (file: File) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
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

// 通用文件上传
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
      onSuccess({ url: fileUrl })
      ElMessage.success(`${file.name} 上传成功`)
    } else {
      throw new Error('上传失败，未获取到文件URL')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    onError(error as Error)
    ElMessage.error(`${file.name} 上传失败`)
  } finally {
    loadingMsg.close()
  }
}

// 处理文件预览
const handlePreview: UploadProps['onPreview'] = (file: UploadUserFile) => {
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

const handleServiceTypeChange = async (value: string) => {
  selectedServiceType.value = value
  const res = await getTemplateDetail(value)
  if (res.code === '00000') {
    templateItems.value = res.data
    console.log(templateItems.value)
  }
}

const openPriceModal = (priceGroup: TemplateGroup) => {
  currentPriceGroup.value = priceGroup
  priceModalVisible.value = true
}

const handleAddressSubmit = (data: AddressData) => {
  serviceAddressData.value = data
  // 构建显示文本（省市区现在直接是中文名称）
  const fullAddress = `${data.province} ${data.city} ${data.district} ${data.detailAddress}`
  serviceAddressDisplay.value = fullAddress

  // 自动填充联系人信息（如果联系人信息为空）
  if (!contact.value.name && data.contact) {
    contact.value.name = data.contact
  }
  if (!contact.value.phone && data.phone) {
    contact.value.phone = data.phone
  }

  // 刷新历史记录，确保从弹窗同步最新的数据
  loadHistory()

  ElMessage.success('服务地址已选择')
}

const validateNormalOrder = () => {
  if (!serviceAddressData.value) {
    alert('请选择服务地址')
    return false
  }
  // 验证动态表单必填项
  for (const group of templateItems.value) {
    if (group.allowEmpty === 0 && group.items) {
      for (let index = 0; index < group.items.length; index++) {
        const key = `${group.id}-${index}`
        const value = formData.value[key]
        // 支持字符串、数字和数组类型的验证
        if (!value || (Array.isArray(value) && value.length === 0)) {
          alert(`请填写 ${group.items[index].name}`)
          return false
        }
      }
    }
  }
  return true
}

const validateCustomOrder = () => {
  if (!customOrder.value.customerID) {
    alert('请输入客户ID')
    return false
  }
  if (
    !customOrder.value.amount ||
    isNaN(customOrder.value.amount) ||
    customOrder.value.amount <= 0
  ) {
    alert('请输入有效的订单金额')
    return false
  }
  if (!customOrder.value.content) {
    alert('请输入详细订单内容')
    return false
  }
  return true
}

const validateContactAndShipping = () => {
  if (!contact.value.name) {
    alert('请输入联系人姓名')
    return false
  }
  if (!contact.value.phone) {
    alert('请输入联系人电话')
    return false
  }
  if (!contact.value.installDate) {
    alert('请选择安装日期')
    return false
  }
  if (!installTimePeriod.value) {
    alert('请选择安装时间段')
    return false
  }
  if (!installStartTime.value) {
    alert('请选择开始时间')
    return false
  }
  if (!installEndTime.value) {
    alert('请选择结束时间')
    return false
  }
  if (installStartTime.value >= installEndTime.value) {
    alert('结束时间必须晚于开始时间')
    return false
  }
  if (!contact.value.installTimeRange) {
    alert('请选择安装时间段')
    return false
  }
  if (!shipping.value.status) {
    alert('请选择设备邮寄状态')
    return false
  }
  // 如果设备已寄出，则物流单号和快递公司为必填
  if (shipping.value.status === '2') {
    if (!shipping.value.trackingNumber) {
      alert('设备已寄出时，请输入物流单号')
      return false
    }
    if (!shipping.value.courier) {
      alert('设备已寄出时，请输入快递公司')
      return false
    }
  }
  // 验证服务名义
  if (!otherConfig.value.serviceName) {
    alert('请选择服务名义')
    return false
  }
  if (otherConfig.value.serviceName === '其他' && !otherConfig.value.customServiceName) {
    alert('请输入服务名义')
    return false
  }
  // 验证工单模板
  if (!otherConfig.value.template) {
    alert('请选择工单模板')
    return false
  }
  if (otherConfig.value.template === '其他' && templateFileList.value.length === 0) {
    alert('请上传模板文件')
    return false
  }
  return true
}

const getFormData = () => {
  // 提取开始和结束时间
  let startTime = ''
  let endTime = ''
  let installDate = contact.value.installDate || ''

  if (contact.value.installTimeRange) {
    // 分割时间范围字符串 "09:00:00,12:00:00" -> ["09:00:00", "12:00:00"]
    const timeRange = contact.value.installTimeRange.split(',')
    if (timeRange.length === 2) {
      startTime = timeRange[0].substring(0, 5) // HH:mm
      endTime = timeRange[1].substring(0, 5) // HH:mm
    }
  }

  // 处理工单模板: 0-小安模版，1-其他
  let workTemplateValue = '0' // 默认小安模板
  if (otherConfig.value.template === '其他') {
    workTemplateValue = '1'
  }

  // 处理服务名义: 0-小安派工，1-其他
  let serviceTypeValue = '0'
  let serviceNameValue = ''
  if (otherConfig.value.serviceName === '其他') {
    serviceTypeValue = '1'
    serviceNameValue = otherConfig.value.customServiceName || ''
  }

  // 处理模板文件
  let templateFileValue = null
  if (otherConfig.value.template === '其他' && templateFileList.value.length > 0) {
    templateFileValue = templateFileList.value
      .map((file: UploadUserFile) => file.url || '')
      .filter(Boolean)
      .join(',')
  }

  // 构造 orderDetails
  interface OrderDetail {
    isPay: string
    templateItemId: string
    productName: string
    price?: number
    payNum?: string
    unit?: string
    totalPrice?: string
    optionVal?: string
  }
  const orderDetails: OrderDetail[] = []
  templateItems.value.forEach((group: TemplateGroup) => {
    if (group.items) {
      group.items.forEach((item: TemplateItem, index: number) => {
        const key = `${group.id}-${index}`

        if (group.isPay) {
          // 需要付费的项
          const quantity = Number(formData.value[key]) || 0
          if (quantity > 0) {
            orderDetails.push({
              isPay: '1',
              templateItemId: group.id,
              productName: item.name,
              price: item.price || 0,
              payNum: quantity.toString(),
              unit: item.unit || '个',
              totalPrice: (quantity * (item.price || 0)).toFixed(2),
            })
          }
        } else {
          // 不需要付费的项（选项类）
          const selectedValue = formData.value[key]
          if (selectedValue) {
            // 如果是数组（多选），转换为逗号分隔的字符串
            const optionValue = Array.isArray(selectedValue)
              ? selectedValue.join(',')
              : String(selectedValue)
            orderDetails.push({
              isPay: '0',
              templateItemId: group.id,
              productName: item.name,
              optionVal: optionValue,
            })
          }
        }
      })
    }
  })

  // 处理地址信息
  const addressData = serviceAddressData.value

  // 拼接完整地址：省+市+区+详细地址
  const fullAddress = addressData
    ? `${addressData.province}${addressData.city}${addressData.district}${addressData.detailAddress}`
    : ''

  // 获取当前服务类型的 id
  const currentServiceType = serviceTypes.value.find(
    (t: { label: string; value: string; id: string }) => t.value === selectedServiceType.value,
  )

  const baseData = {
    projectId: projectInfo.value?.id || '',
    projectName: projectInfo.value?.title || '',
    projectTypeId: currentServiceType?.id || '', // 使用服务类型的 id
    projectTypeName: getServiceTypeName(),
    templateId: selectedServiceType.value, // 模板ID (templateId)

    // 地址信息
    province: addressData?.province || '',
    city: addressData?.city || '',
    area: addressData?.district || '',
    detail: fullAddress || '',
    detailAddress: addressData?.detailAddress || '',

    // 联系人信息
    realName: contact.value.name,
    phone: contact.value.phone,

    // 安装时间
    installTime: installDate,
    startTime: startTime,
    endTime: endTime,

    // 设备邮寄
    equipmentType: shipping.value.status,
    trackingNumber: shipping.value.trackingNumber || '',
    trackingCompany: shipping.value.courier || '',

    //客户id
    customerNo: customOrder.value.customerID,
    // 其他配置
    serviceType: serviceTypeValue, // 0-小安派工，1-其他
    serviceName: serviceNameValue, // 当 serviceType=1 时传入自定义名义
    workTemplate: workTemplateValue, // 0-小安模版，1-其他
    templateFile: templateFileValue,

    // 订单详情
    orderDetails: orderDetails,

    // 价格
    price: calculateTotal(),

    // 备注和附件
    remark: remarkInfo.value.content, // 备注信息
    thumps: fileList.value
      .map((file: UploadUserFile) => file.url || '')
      .filter(Boolean)
      .join(','),

    // 店铺信息
    ...shopInfo.value,
  }

  if (currentOrderType.value === 'normal') {
    return {
      ...baseData,
      preOrderType: 'customer',
      type: 0, // 0-普通订单
      saleType: 1,
    }
  } else if (currentOrderType.value === 'custom') {
    return {
      ...baseData,
      preOrderType: 'customer',
      type: 1, // 1-自定义订单
      customerNo: customOrder.value.customerID,
      price: customOrder.value.amount.toString(),
      content: customOrder.value.content,
      // 自定义订单的附件
      thumps: customFileList.value
        .map((file: UploadUserFile) => file.url || '')
        .filter(Boolean)
        .join(','),
      orderDetails: [], // 自定义订单清空 orderDetails
    }
  }

  return baseData
}

// 清空表单数据
const resetFormData = () => {
  // 使用 store 清空当前分类的表单数据
  orderFormStore.clearFormData(categoryId.value)
  // 清空安装时间段相关的本地状态
  installTimePeriod.value = ''
  installStartTime.value = ''
  installEndTime.value = ''
}

const handlesubmitOrder = async () => {
  if (submittingOrder.value) {
    return
  }

  let isValid = false
  if (currentOrderType.value === 'normal') {
    isValid = validateNormalOrder() && validateContactAndShipping()
  } else if (currentOrderType.value === 'custom') {
    isValid = validateCustomOrder() && validateContactAndShipping()
  }

  if (!isValid) {
    return
  }

  submittingOrder.value = true

  try {
    const orderData = getFormData()
    const res = await submitOrder(orderData)
    if (res.code !== '00000') {
      ElMessage.error(res.message || '订单提交失败')
      return
    }

    createOrderData.value.preOrderNo = res.data?.preOrderNo || res.data?.id || ''
    const createOrderRes = await createOrder(createOrderData.value)
    if (createOrderRes.code !== '00000') {
      ElMessage.error(createOrderRes.message || '订单创建失败')
      return
    }

    orderSuccessInfo.value = {
      serviceName: projectInfo.value?.title || '安装维修',
      orderNo: createOrderRes.data?.orderNo || '',
      amount: calculateTotal(),
    }

    saveAllHistory()
    showSuccessModal.value = true
    resetFormData()
  } catch (error) {
    console.error('订单提交失败:', error)
    ElMessage.error('订单提交失败，请稍后重试')
  } finally {
    submittingOrder.value = false
  }
}
const getDistrictListData = async () => {
  const res = await getDistrictList()
  if (res.code === '00000') {
    res.data.forEach((item: { dictId: string; dictName: string; dictCode: string }) => {
      districtList.value.push({
        id: item.dictId,
        name: item.dictName,
        code: item.dictCode,
      })
    })
  }
}

onMounted(async () => {
  loadHistory()
  await getUserInfos()
  await getProjectInfo()
  await getDistrictListData()
})
watch(
  () => route.query.categoryId,
  (newId) => {
    if (newId && typeof newId === 'string') {
      serviceTypes.value = []
      categoryId.value = newId
      // 切换分类时不清空表单，只重新加载项目数据
      selectedServiceType.value = ''
      templateItems.value = []
      // 清空安装时间段相关的本地状态（这些不在 store 中按 categoryId 分开存储）
      installTimePeriod.value = ''
      installStartTime.value = ''
      installEndTime.value = ''
      getProjectInfo()
    }
  },
)
defineExpose({
  getFormData,
})
</script>

<style scoped>
/* Form Layout - Using Tailwind @apply */
.form-section {
  @apply bg-white rounded-xl transition-all duration-300;
}

.section-title {
  @apply text-base font-semibold mb-2 text-gray-900 relative pb-2;
}

.required {
  @apply text-red-500 ml-1;
}

/* 历史记录删除按钮样式 */
.delete-icon {
  color: #999;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s;
}

.delete-icon:hover {
  color: #f56c6c;
}

.service-types {
  @apply flex gap-3 flex-wrap;
}

.service-btn {
  @apply px-6 py-2 border-2 border-gray-200 bg-white rounded-md text-sm cursor-pointer transition-all duration-300 text-gray-600 font-medium shadow-sm;
}

.service-btn:hover {
  @apply border-blue-500 text-blue-500 -translate-y-0.5;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.service-btn.active {
  @apply bg-[#317DFE] text-white border-blue-500;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
}

.address-input-wrapper {
  @apply cursor-pointer min-w-[280px];
}

.address-input {
  @apply cursor-pointer;
}

.address-input :deep(.el-input__wrapper) {
  @apply !cursor-pointer transition-all duration-300;

}

:deep(.el-input__wrapper) {
  min-height: 32px !important;
  font-size: 13px !important;
}

.address-input :deep(.el-input__inner) {
  @apply !cursor-pointer;
}

.address-icon {
  @apply text-blue-500 text-lg;
}

:deep(.el-select .el-select__wrapper) {
  background: #fff !important;
  border: 1.5px solid #dcdfe6 !important;
  padding: 0 12px !important;
  font-size: 13px !important;
  height: 32px !important;
  box-shadow: none !important;
  transition: all 0.3s ease !important;
}



:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.12) !important;
}

/* 确保下拉框的高度固定 */
:deep(.el-select) {
  height: 38px !important;
}

:deep(.el-select .el-input) {
  height: 38px !important;
}

:deep(.el-select .el-input__wrapper .el-input__inner) {
  height: 38px !important;
  line-height: 38px !important;
  background: transparent !important;
  color: #000 !important;
}



.form-item label {
  @apply block mb-2 text-[13px] text-gray-600 font-medium;
}

.select-field {
  @apply w-[200px];
}

.form-item .el-input {
  @apply w-[200px];
}

.form-item .el-date-picker {
  @apply w-[200px];
}

.form-item .el-time-select {
  @apply w-[200px];
}

:deep(.el-date-picker) {
  width: 200px !important;
}

:deep(.el-time-select) {
  width: 200px !important;
}

:deep(.el-select.select-field) {
  width: 200px !important;
}

:deep(.el-date-editor.select-field) {
  width: 200px !important;
}

:deep(.el-date-editor--datetimerange) {
  width: 280px !important;
}

.section-header {
  @apply flex items-center gap-3 mb-4;
}

.section-header .section-title {
  @apply mb-0 pb-0;
}

.subtitle {
  @apply text-[13px] text-gray-500;
}

.view-prices {
  @apply bg-green-100 text-green-700 border-none rounded px-3 py-1.5 cursor-pointer text-[13px] flex items-center gap-1 transition-all duration-200 ml-auto;
}

.view-prices:hover {
  @apply bg-green-200 translate-x-0.5;
}

.arrow-icon {
  @apply text-sm;
}

.environment-row,
.contact-row,
.shipping-row,
.config-row,
.shop-row {
  @apply flex gap-4 flex-wrap;
}

.form-item {
  @apply flex-none w-[200px] min-w-[200px];
}

.form-item.full-width {
  @apply !w-full !max-w-full !min-w-full;
}

.form-item.flex-grow {
  @apply flex-1 w-auto min-w-0 max-w-none;
}

.input-grid {
  @apply flex gap-4 mt-3 flex-wrap;
}

.input-item {
  @apply flex flex-col gap-2 w-[200px];
}

.input-item label {
  @apply text-[13px] text-gray-600 font-medium;
}

.input-item .el-input {
  @apply w-[200px];
}

.service-name-options,
.template-options {
  @apply flex gap-3;
}

.option-btn {
  @apply px-5 h-8 bg-white rounded-md text-[13px] cursor-pointer transition-all duration-300 text-gray-600 font-medium;
  border: 1.5px solid #DCDFE6;
}

.option-btn.active {
  @apply bg-[#317DFE] text-white border-blue-500;
}

.custom-textarea :deep(.el-textarea__inner) {
  width: 100%;
  min-height: 120px !important;
  background: #fff !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 10px 12px !important;
  font-size: 13px !important;
  resize: vertical;
}

.remark-item,
.content-item {
  @apply !w-full !max-w-full !min-w-full;
}

.attachment-info {
  @apply flex items-center gap-1.5 mb-3;
}

.attachment-info .section-title {
  @apply mb-0 pb-0;
}

.attachment-note {
  @apply text-xs text-gray-400;
}

.attachment-label {
  @apply !flex items-center gap-1.5;
}

.attachment-item {
  @apply !w-full !max-w-full !min-w-full;
}

.file-upload-area {
  @apply flex gap-4 flex-wrap;
}

.upload-box {
  @apply w-[120px] h-[120px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-gray-50;
}

.upload-box:hover {
  @apply border-[#317DFE] bg-blue-50;
}

.upload-icon {
  @apply text-[32px] text-gray-400 mb-2;
}

.upload-text {
  @apply text-[13px] text-gray-500;
}

.file-preview-item {
  @apply relative w-[120px] h-[120px] border border-gray-200 rounded-lg overflow-hidden;
}

.preview-image {
  @apply w-full h-full object-cover block;
}

.preview-pdf {
  @apply w-full h-full flex flex-col items-center justify-center gap-1 p-2;
}

.pdf-icon {
  @apply text-[32px];
}

.pdf-name {
  @apply text-[11px] text-gray-500 text-center break-all leading-tight overflow-hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.remove-preview {
  @apply absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white border-none cursor-pointer text-lg leading-none flex items-center justify-center;
}

.remove-preview:hover {
  @apply bg-red-500/90 scale-110;
}

.submit-order-section {
  @apply mt-10 px-10 flex justify-center items-center gap-4;
}

.submit-order-btn {
  @apply py-3 px-10 bg-[#317DFE] text-white border-none rounded-md text-[15px] font-semibold cursor-pointer transition-all duration-300;
  box-shadow: 0 3px 12px rgba(24, 144, 255, 0.25);
}

.submit-order-btn:hover {
  @apply bg-blue-600 -translate-y-0.5;
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

.submit-order-btn:active {
  @apply translate-y-0;
}

.submit-order-btn:disabled,
.submit-order-btn:disabled:hover {
  @apply bg-blue-300 cursor-not-allowed translate-y-0;
  box-shadow: none;
}

.cost-summary {
  @apply w-[330px] bg-white py-5 px-6 shadow-sm h-fit sticky border border-gray-200/60;
}

.summary-title {
  @apply text-lg font-semibold mb-1 text-gray-900 pb-0.5 relative;
}

.cost-details {
  @apply mb-5;
}

.service-type-row {
  @apply flex items-center gap-1.5 py-2.5 mb-3 border-b-2 border-dashed border-gray-200;
}

.service-type-row .label {
  @apply text-[14px] text-gray-500 font-medium;
}

.service-type-row .value {
  @apply text-[13px] text-gray-800 font-semibold;
}

.cost-item {
  @apply grid gap-3 items-center py-2.5 text-[13px] text-gray-800;
  grid-template-columns: 1fr auto auto;
}

.cost-item .item-name {
  @apply text-gray-800 font-normal;
}

.cost-item .item-quantity {
  @apply text-right text-gray-800 min-w-[60px] font-normal;
}

.cost-item .item-price {
  @apply text-right text-gray-800 font-medium min-w-[100px];
}

.cost-item.base-fee {
  @apply border-t border-gray-200 pt-4 mt-3;
}

.total-cost {
  @apply flex justify-between items-center pt-3.5 pb-2 text-[15px] font-semibold mt-3;
}

.total-cost .total-label {
  @apply text-gray-800 text-[15px] font-semibold;
}

.total-amount {
  @apply text-red-500 text-xl font-bold;
}

.submit-btn {
  @apply w-[200px] flex justify-center mx-auto py-3 bg-[#317DFE] text-white border-none rounded-md text-[15px] font-semibold cursor-pointer transition-all duration-300;
  box-shadow: 0 3px 12px rgba(24, 144, 255, 0.25);
}

.submit-btn:hover {
  @apply bg-blue-600 -translate-y-0.5;
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

.submit-btn:active {
  @apply translate-y-0;
}

.submit-btn:disabled,
.submit-btn:disabled:hover {
  @apply bg-blue-300 cursor-not-allowed translate-y-0;
  box-shadow: none;
}

.contact-row {
  @apply !flex-nowrap;
}

.contact-row .form-item {
  @apply flex-none w-[200px] min-w-[200px];
}

.contact-row .form-item .el-select,
.contact-row .form-item .el-date-picker,
.contact-row .form-item .el-time-select,
.contact-row .form-item .el-input {
  width: 200px !important;
}

:deep(.contact-row .el-select),
:deep(.contact-row .el-date-picker),
:deep(.contact-row .el-time-select),
:deep(.contact-row .el-input) {
  width: 200px !important;
}

.shipping-row .form-item {
  @apply flex-none w-[200px] min-w-[200px];
}

.environment-row .form-item,
.shop-row .form-item {
  @apply flex-none w-[200px] min-w-[200px];
}

.custom-order-row {
  @apply flex gap-4 mb-4 flex-wrap;
}

.custom-order-row .form-item {
  @apply flex-none w-[200px] min-w-[200px];
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .service-form {
    @apply flex-col;
  }

  .cost-summary {
    @apply w-full static;
  }
}

@media (max-width: 768px) {
  .service-form {
    @apply p-4;
  }

  .form-section {
    @apply p-5;
  }
}

/* 滚动条美化 */
.cost-details::-webkit-scrollbar {
  @apply w-1.5;
}

.cost-details::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.cost-details::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #1890ff 0%, #52c41a 100%);
  @apply rounded;
}

.cost-details::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #40a9ff 0%, #73d13d 100%);
}

/* 价格弹窗样式 */
.price-list {
  @apply max-h-[500px] overflow-y-auto;
}

.price-item {
  @apply flex justify-between items-center py-4 px-5 border-b border-gray-100 transition-all duration-300;
}

.price-item:hover {
  @apply bg-gray-50;
}

.price-item:last-child {
  @apply border-b-0;
}

.price-item-left {
  @apply flex items-center gap-2;
}

.item-name {
  @apply text-[15px] text-gray-800 font-medium;
}

.item-unit {
  @apply text-[13px] text-gray-400;
}

.price-item-right {
  @apply flex items-center;
}

.item-price {
  @apply text-base text-orange-500 font-semibold;
}

.item-price.no-price {
  @apply text-gray-400 font-normal text-sm;
}

.no-data {
  @apply text-center py-10 text-gray-400 text-sm;
}

:deep(.el-dialog__header) {
  @apply border-b border-gray-100 py-5 px-6;
}

:deep(.el-dialog__title) {
  @apply text-lg font-semibold text-gray-800;
}

:deep(.el-dialog__body) {
  @apply p-0;
}

:deep(.el-dialog__footer) {
  @apply border-t border-gray-100 py-4 px-6;
}

:deep(.el-select-dropdown) {
  @apply text-green-700;
}

/* 调整 el-upload 组件大小 */
:deep(.el-upload--picture-card) {
  @apply w-20 h-20 leading-[80px];
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  @apply w-20 h-20;
}

:deep(.el-upload-list--picture-card .el-upload-list__item-thumbnail) {
  @apply w-full h-full object-cover;
}

:deep(.el-icon.avatar-uploader-icon) {
  @apply text-xl;
}
</style>
