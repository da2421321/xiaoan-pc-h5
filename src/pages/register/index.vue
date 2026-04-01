<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">欢迎注册</h1>

      <el-form
        ref="formRef"
        :model="form"
        :rules="currentRules"
        label-position="top"
        require-asterisk-position="right"
        :class="['register-form', step === 2 ? 'register-form-step2' : '']"
      >
        <div v-if="step === 1" class="form-grid">
          <el-form-item label="企业名称" prop="enterpriseName" class="form-item-full">
            <el-input v-model="form.enterpriseName" placeholder="请输入企业名称" />
          </el-form-item>

          <el-form-item label="企业简称" prop="enterpriseShortName">
            <el-input v-model="form.enterpriseShortName" placeholder="请输入企业简称" />
          </el-form-item>
          <el-form-item label="统一社会信用代码" prop="creditCode">
            <el-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" />
          </el-form-item>

          <el-form-item label="营业执照照片" prop="licenseFile" class="form-item-full" required>
            <div class="license-upload" @click="openLicensePicker">
              <input
                ref="licenseInputRef"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                class="hidden-input"
                @change="handleLicenseSelect"
              />
              <el-icon class="upload-icon">
                <UploadFilled />
              </el-icon>
              <p class="upload-main-text">
                {{ form.licenseFile ? `已选择：${form.licenseFile.name}` : '点击上传营业执照' }}
              </p>
              <p class="upload-sub-text">支持 JPG/PNG/PDF，大小不超过 10MB</p>
            </div>
          </el-form-item>
        </div>

        <div v-else class="form-grid">
          <el-form-item label="法人" prop="legalPerson">
            <el-input v-model="form.legalPerson" placeholder="请输入法人姓名" />
          </el-form-item>
          <el-form-item label="法人身份证号码" prop="legalIdCard">
            <el-input v-model="form.legalIdCard" placeholder="请输入法人身份证号码" />
          </el-form-item>

          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请输入确认密码" />
          </el-form-item>

          <el-form-item label="公司地址" prop="companyAddress" class="form-item-full">
            <el-input v-model="form.companyAddress" placeholder="请输入公司地址" />
          </el-form-item>

          <div class="form-divider" />

          <el-form-item label="对公账户号" prop="bankAccount">
            <el-input v-model="form.bankAccount" placeholder="请输入对公账户号" />
          </el-form-item>
          <el-form-item label="对公账户开户行" prop="bankName">
            <el-select v-model="form.bankName" placeholder="请选择对公账户开户行" class="w-full">
              <el-option v-for="item in bankOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </div>
      </el-form>

      <div class="action-row" :class="{ 'double-actions': step === 2 }">
        <el-button v-if="step === 2" class="prev-btn" @click="goPrevStep">上一步</el-button>
        <el-button class="next-btn" type="primary" @click="step === 1 ? goNextStep() : handleSubmit()">
          {{ step === 1 ? '下一步' : '提交' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBankBasePage } from '@/api'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { computed, onMounted, ref } from 'vue'

defineOptions({
  name: 'RegisterPage',
})

interface RegisterForm {
  enterpriseName: string
  enterpriseShortName: string
  creditCode: string
  licenseFile: File | null
  legalPerson: string
  legalIdCard: string
  mobile: string
  password: string
  confirmPassword: string
  email: string
  companyAddress: string
  bankAccount: string
  bankName: string
}

const formRef = ref<FormInstance>()
const licenseInputRef = ref<HTMLInputElement | null>(null)
const step = ref<1 | 2>(1)

const defaultBankOptions = ['中国工商银行', '中国农业银行', '中国银行', '中国建设银行', '交通银行']
const bankOptions = ref<string[]>([...defaultBankOptions])

const form = ref<RegisterForm>({
  enterpriseName: '',
  enterpriseShortName: '',
  creditCode: '',
  licenseFile: null,
  legalPerson: '',
  legalIdCard: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  email: '',
  companyAddress: '',
  bankAccount: '',
  bankName: '',
})

const stepOneRules: FormRules<RegisterForm> = {
  enterpriseName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  enterpriseShortName: [{ required: true, message: '请输入企业简称', trigger: 'blur' }],
  creditCode: [{ required: true, message: '请输入统一社会信用代码', trigger: 'blur' }],
  licenseFile: [
    {
      validator: (_rule, value, callback) => {
        if (value) {
          callback()
          return
        }
        callback(new Error('请上传营业执照照片'))
      },
      trigger: 'change',
    },
  ],
}

const stepTwoRules: FormRules<RegisterForm> = {
  legalPerson: [{ required: true, message: '请输入法人姓名', trigger: 'blur' }],
  legalIdCard: [{ required: true, message: '请输入法人身份证号码', trigger: 'blur' }],
  mobile: [
    { required: true, message: '请输入手机号码，作为登录账号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (!value || value === form.value.password) {
          callback()
          return
        }
        callback(new Error('两次输入的密码不一致'))
      },
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  companyAddress: [{ required: true, message: '请输入公司地址', trigger: 'blur' }],
  bankAccount: [{ required: true, message: '请输入对公账户号', trigger: 'blur' }],
  bankName: [{ required: true, message: '请选择对公账户开户行', trigger: 'change' }],
}

const currentRules = computed(() => (step.value === 1 ? stepOneRules : stepTwoRules))

const validateCurrentStep = async () => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

const openLicensePicker = () => {
  licenseInputRef.value?.click()
}

const handleLicenseSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const maxSize = 10 * 1024 * 1024
  const allowTypes = ['image/jpeg', 'image/png', 'application/pdf']

  if (!allowTypes.includes(file.type)) {
    ElMessage.warning('仅支持 JPG、PNG、PDF 格式')
    target.value = ''
    return
  }
  if (file.size > maxSize) {
    ElMessage.warning('文件大小不能超过 10MB')
    target.value = ''
    return
  }

  form.value.licenseFile = file
  formRef.value?.validateField('licenseFile')
  target.value = ''
}

const goNextStep = async () => {
  const pass = await validateCurrentStep()
  if (!pass) return
  step.value = 2
  formRef.value?.clearValidate()
}

const goPrevStep = () => {
  step.value = 1
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  const pass = await validateCurrentStep()
  if (!pass) return
  ElMessage.success('注册信息已提交')
}

const fetchBankOptions = async () => {
  try {
    const res = await getBankBasePage({ pageNumber: 1, pageSize: 100 })
    const isSuccess = res?.success === true || res?.code === '00000' || res?.code === 0
    if (!isSuccess) {
      ElMessage.warning(res?.message || '获取开户行列表失败，已使用默认列表')
      return
    }

    const rows = res?.data?.rows ?? []
    const loadedOptions = Array.from(
      new Set(
        rows
          .map((item) => item.shortName || item.fullName)
          .filter((item): item is string => Boolean(item)),
      ),
    )

    if (loadedOptions.length > 0) {
      bankOptions.value = loadedOptions
      return
    }

    ElMessage.warning('开户行数据为空，已使用默认列表')
  } catch {
    ElMessage.warning('获取开户行列表失败，已使用默认列表')
  }
}

onMounted(() => {
  fetchBankOptions()
})
</script>

<style scoped>
.register-page {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 94px 24px 60px;
  box-sizing: border-box;
}

.register-page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background: url('@/assets/images/back.png') no-repeat top center;
  background-size: 100% 100%;
}

.register-card {
  max-width: 980px;
  min-height: 560px;
  margin: 0 auto;
  padding: 28px 116px 30px;
  border: 1px solid rgba(214, 223, 237, 1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-sizing: border-box;
}

.register-title {
  margin: 0;
  text-align: center;
  font-size: 40px;
  line-height: 56px;
  font-weight: 600;
  color: rgba(34, 34, 34, 1);
}

.register-form {
  width: 100%;
  max-width: 620px;
  margin-top: 16px;
  margin-left: auto;
  margin-right: auto;
}

.register-form-step2 {
  max-width: 800px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.form-item-full {
  grid-column: 1 / -1;
}

.license-upload {
  height: 126px;
  border: 1px dashed rgba(206, 216, 236, 1);
  border-radius: 8px;
  width: 100%;
  background: rgba(244, 247, 255, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.upload-icon {
  font-size: 22px;
  color: rgba(58, 126, 246, 1);
}

.upload-main-text {
  margin: 8px 0 6px;
  color: rgba(58, 126, 246, 1);
  font-size: 14px;
  line-height: 20px;
}

.upload-sub-text {
  margin: 0;
  color: rgba(118, 126, 145, 1);
  font-size: 12px;
  line-height: 18px;
}

.form-divider {
  grid-column: 1 / -1;
  height: 1px;
  border: 0;
  background: repeating-linear-gradient(to right,
      rgba(214, 223, 237, 1) 0 16px,
      transparent 16px 24px);
  margin: 14px 0 22px;
}

.action-row {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.double-actions {
  gap: 12px;
}

.action-row.double-actions {
  width: 100%;
  max-width: 680px;
  margin: 26px auto 0;
}

.action-row.double-actions .prev-btn {
  width: calc(30% - 6px);
}

.action-row.double-actions .next-btn {
  width: calc(50% - 6px);
}

.prev-btn {
  width: 160px;
  background: rgba(211, 239, 247, 1);
  border-color: rgba(211, 239, 247, 1);
  color: rgba(49, 125, 254, 1);
}

.next-btn {
  width: 244px;
}

:deep(.el-form-item) {
  margin-bottom: 10px;
}

:deep(.el-form-item__error) {
  position: static;
  padding-top: 4px;
  line-height: 18px;
}

:deep(.el-form-item__label) {
  padding-bottom: 8px;
  color: rgba(51, 51, 51, 1);
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  height: 42px;
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid rgba(214, 223, 237, 1);
  background: rgba(255, 255, 255, 1);
}

:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover) {
  box-shadow: none;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focused) {
  border-color: rgba(49, 125, 254, 1);
  box-shadow: none;
}

:deep(.el-button) {
  height: 40px;
  border-radius: 10px;
}

:deep(.next-btn.el-button--primary) {
  background: rgba(49, 125, 254, 1);
  border-color: rgba(49, 125, 254, 1);
}

@media (max-width: 1024px) {
  .register-card {
    padding: 24px 28px;
  }
}

@media (max-width: 768px) {
  .register-page {
    padding: 24px 12px;
  }

  .register-card {
    min-height: auto;
    padding: 20px 16px;
  }

  .register-title {
    font-size: 30px;
    line-height: 42px;
  }

  .register-form {
    max-width: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-item-full {
    grid-column: auto;
  }

  .form-divider {
    grid-column: auto;
  }

  .action-row {
    flex-direction: column;
    gap: 10px;
  }

  .prev-btn,
  .next-btn {
    width: 100%;
  }
}
</style>
