<template>
  <el-dialog v-model="dialogVisible" width="500px" @close="handleClose" class="account-dialog ">
    <template #header>
      <div class="dialog-header-bg text-center">
        <span class="text-lg font-bold text-gray-900">{{ title }}</span>
      </div>
    </template>

    <!-- 局部加载组件 -->
    <Loading :visible="loading" text="加载中..." />

    <el-form v-show="!loading" class="flex justify-center flex-col items-center" ref="formRef" :model="form"
      :rules="rules" label-width="80px">
      <el-form-item label="姓名" prop="realName">
        <el-input v-model="form.realName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" :disabled="!!props.userid" />
      </el-form-item>
      <el-form-item label="角色" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色" />
      </el-form-item>
      <el-form-item label="额度类型" prop="creditType">
        <el-select v-model="form.creditType" placeholder="请选择额度类型" class="w-full">
          <el-option label="共享额度" :value="0" />
          <el-option label="指定额度" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.creditType === 1" label="授信额度" prop="quotaAmount">
        <!-- 编辑模式：显示额度值和调整按钮 -->
        <div v-if="props.userid" class="quota-display">
          <el-input v-model="form.quotaAmount" placeholder="请输入额度" type="number" disabled />
          <el-button class="adjust-btn" @click="openQuotaDialog('up')">调整</el-button>
        </div>
        <!-- 新增模式或调整模式：显示输入框 -->
        <div v-else class="flex gap-4">
          <el-input v-model="form.quotaAmount" placeholder="请输入额度" type="number" />
        </div>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" class="w-full">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div v-show="!loading" class="flex pb-3 justify-center">
        <el-button class="w-24" type="primary" @click="handleSubmit">确定</el-button>
        <el-button class="w-24" @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 调整额度弹窗 -->
  <el-dialog v-model="showQuotaInput" width="600px" class="quota-dialog" align-center>
    <template #header>
      <div class="dialog-header-bg">
        <span class="text-lg font-bold text-gray-900">调整授信额度</span>
      </div>
    </template>
    <div class="quota-form">
      <!-- 上调/下调切换 -->
      <div class="adjust-type-tabs">
        <button :class="['tab-btn', adjustType === 'up' ? 'active' : '']" @click="switchAdjustType('up')">上调</button>
        <button :class="['tab-btn', adjustType === 'down' ? 'active' : '']"
          @click="switchAdjustType('down')">下调</button>
      </div>

      <!-- 调整金额 -->
      <div class="form-section">
        <label class="form-label"><span class="required">*</span> 调整额度</label>
        <el-input v-model="newQuotaAmount" placeholder="请输入调整额度" type="number" class="w-full">
          <template #prefix>¥</template>
        </el-input>
      </div>

      <!-- 额度信息 -->
      <div class="quota-info">
        <p>当前授信额度：¥{{ quotaInfo.assignedUserOrderLimit.toLocaleString() }}</p>
        <p>已占用额度：¥{{ quotaInfo.assignedUserOrderUsedLimit.toLocaleString() }}</p>
        <p>可用额度：¥{{ quotaInfo.assignedAvailableLimit.toLocaleString() }}</p>
      </div>

      <!-- 上调限制说明 -->
      <div class="limit-notice" v-if="adjustType === 'up'">
        <div class="notice-header">
          <el-icon>
            <InfoFilled />
          </el-icon>
          <span class="notice-title">上调限制说明：</span>
        </div>
        <p class="notice-content">
          上调金额不能超过主体剩余可用额度。计算方式：主体总额度
          （¥{{ quotaInfo.totalLimit.toLocaleString() }}）- 当前账户指定额度（¥{{ quotaInfo.assignedUserOrderLimit.toLocaleString()
          }}）- 共享额度已使用（¥{{ quotaInfo.sharedClientOrderUsedLimit.toLocaleString() }}）= ¥{{
            quotaInfo.maxChangeLimit.toLocaleString() }}
        </p>
        <p class="max-adjust">最多可上调：¥{{ quotaInfo.maxChangeLimit.toLocaleString() }}</p>
      </div>

      <!-- 下调限制说明 -->
      <div class="limit-notice" v-if="adjustType === 'down'">
        <div class="notice-header">
          <el-icon>
            <InfoFilled />
          </el-icon>
          <span class="notice-title">下调限制说明：</span>
        </div>
        <p class="notice-content">
          下调后的授信额度不能低于已占用额度。计算方式：当前指定额度
          （¥{{ quotaInfo.assignedUserOrderLimit.toLocaleString() }}）- 已占用额度（¥{{
            quotaInfo.assignedUserOrderUsedLimit.toLocaleString() }}）= ¥{{
            maxDownAdjust.toLocaleString() }}
        </p>
        <p class="max-adjust">最多可下调：¥{{ quotaInfo.maxChangeLimit.toLocaleString() }}</p>
      </div>

      <!-- 调整原因 -->
      <div class="form-section">
        <label class="form-label">调整原因</label>
        <el-input v-model="adjustReason" type="textarea" :rows="4" placeholder="请填写调整原因" />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center gap-4 pb-3">
        <el-button class="w-24" @click="cancelQuotaAdjust">取消</el-button>
        <el-button class="w-24" type="primary" @click="confirmQuotaAdjust">确认调整</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'
import { getAccountDetail, addAccount, editAccount, getQuotaDetail, adjustQuota } from '@/api/account'
import Loading from '@/components/modals/loading.vue'

// 加载状态
const loading = ref(false)
// 额度调整相关
const showQuotaInput = ref(false)
const newQuotaAmount = ref<number | null>(null)
const adjustType = ref<'up' | 'down'>('up')
const adjustReason = ref('')

// 额度信息
const quotaInfo = ref({
  totalLimit: 0,              // 客户下单总额度
  usedLimit: 0,               // 客户下单已用额度
  assignedUserOrderLimit: 0,  // 指定用户上限额度（当前授信额度）
  assignedUserOrderUsedLimit: 0, // 指定用户已用额度（已占用额度）
  assignedAvailableLimit: 0,  // 可用额度
  sharedClientOrderTotalLimit: 0, // 共享总额度
  sharedClientOrderUsedLimit: 0,  // 共享已用额度
  maxChangeLimit: 0,          // 最大可调整额度
})

// 最多可下调金额 = 当前指定额度 - 已占用额度
const maxDownAdjust = computed(() => {
  return quotaInfo.value.assignedUserOrderLimit - quotaInfo.value.assignedUserOrderUsedLimit
})
// Props 定义
interface Props {
  userid?: string
  visible: boolean
}
const props = withDefaults(defineProps<Props>(), {
  userid: '',
  visible: false,
})

// Emits 定义
const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

// 弹窗显示控制
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

// 表单引用
const formRef = ref<FormInstance>()

// 弹窗标题
const title = computed(() => (props.userid ? '编辑账号' : '新增账号'))

// 表单数据
const form = ref({
  uid: '',
  realName: '',
  phone: '',
  roleName: '',
  creditType: null as number | null,
  quotaAmount: null as number | null,
  status: null as number | null,
})

// 表单验证规则
const rules: FormRules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请输入角色', trigger: 'blur' }],
  creditType: [{ required: true, message: '请选择额度类型', trigger: 'change' }],
  quotaAmount: [{ required: true, message: '请输入额度', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 重置表单
const resetForm = () => {
  form.value = {
    uid: '',
    realName: '',
    phone: '',
    roleName: '',
    creditType: null,
    quotaAmount: null,
    status: null,
  }
  showQuotaInput.value = false
  newQuotaAmount.value = null
  formRef.value?.clearValidate()
}

// 获取额度详情
const fetchQuotaDetail = async (type: 'up' | 'down') => {
  try {
    const res = await getQuotaDetail({
      uid: Number(props.userid),
      type: type === 'up' ? 1 : 2
    })
    if (res.data) {
      quotaInfo.value = {
        totalLimit: res.data.totalLimit || 0,
        usedLimit: res.data.usedLimit || 0,
        assignedUserOrderLimit: res.data.assignedUserOrderLimit || 0,
        assignedUserOrderUsedLimit: res.data.assignedUserOrderUsedLimit || 0,
        assignedAvailableLimit: res.data.assignedAvailableLimit || 0,
        sharedClientOrderTotalLimit: res.data.sharedClientOrderTotalLimit || 0,
        sharedClientOrderUsedLimit: res.data.sharedClientOrderUsedLimit || 0,
        maxChangeLimit: res.data.maxChangeLimit || 0,
      }
    }
  } catch (error) {
    console.error('获取额度详情失败', error)
  }
}

// 打开调整额度弹窗
const openQuotaDialog = async (type: 'up' | 'down') => {
  adjustType.value = type
  await fetchQuotaDetail(type)
  showQuotaInput.value = true
}

// 切换上调/下调类型
const switchAdjustType = async (type: 'up' | 'down') => {
  if (adjustType.value === type) return
  adjustType.value = type
  await fetchQuotaDetail(type)
}

// 确认调整额度
const confirmQuotaAdjust = async () => {
  if (newQuotaAmount.value === null) return

  try {
    await adjustQuota({
      uid: Number(props.userid),
      type: adjustType.value === 'up' ? 1 : 2,
      addAmount: newQuotaAmount.value,
      remark: adjustReason.value
    })
    // 更新表单中的额度显示
    const amount = Number(newQuotaAmount.value)
    if (adjustType.value === 'up') {
      form.value.quotaAmount = (form.value.quotaAmount || 0) + amount
    } else {
      form.value.quotaAmount = (form.value.quotaAmount || 0) - amount
    }
    showQuotaInput.value = false
    newQuotaAmount.value = null
    adjustReason.value = ''
  } catch (error) {
    console.error('调整额度失败', error)
  }
}

// 取消调整额度
const cancelQuotaAdjust = () => {
  showQuotaInput.value = false
  newQuotaAmount.value = null
  adjustType.value = 'up'
  adjustReason.value = ''
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  emit('update:visible', false)
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  console.log("添加账号", form.value)
  if (props.userid) {
    await editAccount({
      ...form.value,
      phone: form.value.phone
    })
  } else {
    await addAccount({
      ...form.value,
      phone: form.value.phone
    })
  }
  emit('success')
  handleClose()
}

// 账号详情响应类型
interface AccountDetailResponse {
  data: {
    realName: string
    account: string
    roleName: string
    creditType: number
    totalQuota: number | null
    mineQuota: number
    status: number
  }
}

// 监听弹窗打开，编辑模式下加载数据
watch(
  () => props.visible,
  async (val) => {
    resetForm()
    if (val && props.userid) {
      loading.value = true
      try {
        const res = await getAccountDetail(props.userid) as AccountDetailResponse
        form.value = {
          uid: props.userid,
          realName: res.data.realName,
          phone: res.data.account,
          roleName: res.data.roleName,
          creditType: res.data.creditType,
          quotaAmount: res.data.creditType === 1 ? res.data.totalQuota : res.data.mineQuota,
          status: res.data.status,
        }
      } finally {
        loading.value = false
      }
    }
  },
)
</script>

<style scoped>
:deep(.el-form-item__label) {
  align-items: center;
}

:deep(.el-input),
:deep(.el-select) {
  width: 300px;
}

.quota-display {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 300px;
}

.quota-display :deep(.el-input) {
  flex: 1;
}

.quota-value {
  font-size: 16px;
  color: #333;
}

.adjust-btn {
  flex-shrink: 0;
}

/* 调整额度弹窗样式 */
.adjust-type-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  height: 44px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  border-color: #4f46e5;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.form-section {
  margin-bottom: 16px;
}

.form-section :deep(.el-input) {
  width: 100%;
}

.form-section :deep(.el-input__wrapper) {
  box-sizing: border-box;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.form-label .required {
  color: #f56c6c;
  margin-right: 4px;
}

.quota-info {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 16px;
}

.limit-notice {
  background: rgba(79, 70, 229, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #4f46e5;
}

.notice-title {
  font-weight: 600;
  font-size: 14px;
}

.notice-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.max-adjust {
  font-size: 14px;
  color: #f56c6c;
  font-weight: 600;
}
</style>
<style>
.account-dialog.el-dialog,
.quota-dialog.el-dialog {
  @apply overflow-hidden !p-0;
  border-radius: 10px !important;
}

.account-dialog .el-dialog__header,
.quota-dialog .el-dialog__header {
  @apply !p-0 !m-0;
}

.account-dialog .el-dialog__body {
  padding: 20px;
}

.quota-dialog .el-dialog__body {
  padding: 20px 30px;
}

.account-dialog .dialog-header-bg,
.quota-dialog .dialog-header-bg {
  background-image: url('@/assets/images/titlebg.png');
  @apply bg-cover bg-top bg-no-repeat py-5 px-6 pb-2.5 m-0;
}
</style>
