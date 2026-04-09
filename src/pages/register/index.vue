<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">欢迎注册</h1>

      <el-form ref="formRef" :model="form" :rules="currentRules" label-position="top" require-asterisk-position="right"
        :class="['register-form', 'register-form-step2']">
        <div v-if="step === 1" class="form-grid">
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号码，作为登录账号" maxlength="11" class="phone-input-with-code">
              <template #suffix>
                <span class="captcha-action" :class="{ 'is-disabled': typeof countdown === 'number' }"
                  @click="handleSendCode">
                  {{ typeof countdown === 'number' ? `${countdown}s` : countdown }}
                </span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="captchaCode">
            <el-input v-model="form.captchaCode" placeholder="请输入验证码" maxlength="6" />
          </el-form-item>

          <el-form-item label="设置密码" prop="password" class="form-item-full">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="再次输入密码" prop="confirmPassword" class="form-item-full">
            <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
          </el-form-item>
        </div>

        <div v-else-if="step === 2" class="form-grid">
          <el-form-item label="企业名称" prop="enterpriseName" class="form-item-full">
            <el-input v-model="form.enterpriseName" placeholder="请输入企业名称" />
          </el-form-item>

          <el-form-item label="企业简称" prop="enterpriseShortName">
            <el-input v-model="form.enterpriseShortName" placeholder="请输入企业简称" />
          </el-form-item>
          <el-form-item label="统一社会信用代码" prop="creditCode">
            <el-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" />
          </el-form-item>

          <el-form-item label="营业执照照片" prop="licenseFile" class="form-item-full">
            <div class="license-upload" @click="openLicensePicker">
              <input ref="licenseInputRef" type="file" accept=".jpg,.jpeg,.png,.pdf" class="hidden-input"
                @change="handleLicenseSelect" />
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

          <el-form-item label="邮箱" prop="email" class="form-item-full">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
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

      <div class="action-row" :class="{ 'double-actions': step !== 1 }">
        <el-button v-if="step !== 1" class="prev-btn" :disabled="submitLoading" @click="goPrevStep">上一步</el-button>
        <el-button class="next-btn" type="primary" :loading="submitLoading"
          @click="step < 3 ? goNextStep() : handleSubmit()">
          {{ step < 3 ? '下一步' : '提交' }} </el-button>
      </div>

      <div v-if="step === 1" class="login-link-row">
        <span class="login-link-text">已有账号？</span>
        <span class="login-link-btn" @click="router.push('/login')">去登录</span>
      </div>
    </div>

    <Loading :visible="successDialogVisible" text="注册成功" :show-spinner="false" text-class="register-success-text" />
  </div>
</template>

<script setup lang="ts">
import { getBankBasePage, registerCustomer, sendCode, uploadFileByUnToken } from '@/api'
import Loading from '@/components/modals/loading.vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

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
  captchaCode: string
  email: string
  companyAddress: string
  bankAccount: string
  bankName: string
}

const formRef = ref<FormInstance>()
const licenseInputRef = ref<HTMLInputElement | null>(null)
const step = ref<1 | 2 | 3>(1)
const submitLoading = ref(false)
const successDialogVisible = ref(false)
const router = useRouter()
const countdown = ref<string | number>('获取验证码')
let timer: ReturnType<typeof setInterval> | null = null
let successRedirectTimer: ReturnType<typeof setTimeout> | null = null

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
  captchaCode: '',
  email: '',
  companyAddress: '',
  bankAccount: '',
  bankName: '',
})

const stepOneRules: FormRules<RegisterForm> = {}

const stepTwoRules: FormRules<RegisterForm> = {
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
}

const stepThreeRules: FormRules<RegisterForm> = {
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
  mobile: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const currentRules = computed(() => {
  if (step.value === 1) return stepThreeRules
  if (step.value === 2) return stepOneRules
  return stepTwoRules
})

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
  if (step.value === 1) {
    step.value = 2
  } else if (step.value === 2) {
    step.value = 3
  }
  formRef.value?.clearValidate()
}

const goPrevStep = () => {
  if (step.value === 3) {
    step.value = 2
  } else if (step.value === 2) {
    step.value = 1
  }
  formRef.value?.clearValidate()
}

const clearCountdown = () => {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

const clearSuccessRedirectTimer = () => {
  if (!successRedirectTimer) return
  clearTimeout(successRedirectTimer)
  successRedirectTimer = null
}

const handleSendCode = async () => {
  if (typeof countdown.value === 'number') return
  if (!/^1[3-9]\d{9}$/.test(form.value.mobile)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    const res = await sendCode(form.value.mobile)
    if (res.code !== '200' && res.code !== 200) {
      ElMessage.error(res.message || '验证码发送失败')
      return
    }

    ElMessage.success('验证码发送成功')
    countdown.value = 60
    clearCountdown()
    timer = setInterval(() => {
      if (typeof countdown.value !== 'number') return
      countdown.value -= 1
      if (countdown.value <= 0) {
        countdown.value = '获取验证码'
        clearCountdown()
      }
    }, 1000)
  } catch {
    ElMessage.error('验证码发送失败，请稍后重试')
  }
}

const isRequestSuccess = (res: { code?: number | string; success?: boolean }) => {
  return (
    res?.success === true ||
    res?.code === 0 ||
    res?.code === '0' ||
    res?.code === '00000' ||
    res?.code === 200 ||
    res?.code === '200'
  )
}

const uploadLicenseFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('secretFlag', 'N')
  formData.append('fileLocation', '1')

  const uploadRes = await uploadFileByUnToken(formData)
  const fileUrl = (uploadRes as { data?: { fileUrl?: string } })?.data?.fileUrl || ''
  if (!fileUrl) {
    throw new Error('营业执照上传失败，请重试')
  }
  return fileUrl
}

const showRegisterSuccessDialog = () => {
  successDialogVisible.value = true
  clearSuccessRedirectTimer()
  successRedirectTimer = setTimeout(() => {
    successDialogVisible.value = false
    router.push('/login')
  }, 2000)
}

const handleSubmit = async () => {
  if (submitLoading.value) return

  const pass = await validateCurrentStep()
  if (!pass) return

  submitLoading.value = true
  try {
    const businessLicensePhoto = form.value.licenseFile ? await uploadLicenseFile(form.value.licenseFile) : ''

    const res = await registerCustomer({
      enterpriseName: form.value.enterpriseName,
      enterpriseAbbreviation: form.value.enterpriseShortName,
      unifiedSocialCreditCode: form.value.creditCode,
      businessLicensePhoto,
      captcha: form.value.captchaCode,
      legalPerson: form.value.legalPerson,
      legalPersonIdCardNumber: form.value.legalIdCard,
      phoneNumber: form.value.mobile,
      password: form.value.password,
      email: form.value.email,
      companyAddress: form.value.companyAddress,
      corporateAccountNumber: form.value.bankAccount,
      corporateAccountBank: form.value.bankName,
    })

    if (!isRequestSuccess(res as { code?: number | string; success?: boolean })) {
      ElMessage.error(res?.message || '注册失败，请稍后重试')
      return
    }

    showRegisterSuccessDialog()
  } catch (error) {
    const message = (error as { message?: string })?.message || '注册失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    submitLoading.value = false
  }
}

const fetchBankOptions = async () => {
  try {
    const res = await getBankBasePage({ pageNumber: 1, pageSize: 100 })
    const isSuccess = res?.success === true || res?.code === '00000' || res?.code === 0
    if (!isSuccess) {
      ElMessage.warning(res?.message || '获取开户行列表失败，已使用默认列表')
      bankOptions.value = [...defaultBankOptions]
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

    bankOptions.value = loadedOptions.length > 0 ? loadedOptions : [...defaultBankOptions]
  } catch {
    ElMessage.warning('获取开户行列表失败，已使用默认列表')
    bankOptions.value = [...defaultBankOptions]
  }
}

onMounted(() => {
  fetchBankOptions()
})

onBeforeUnmount(() => {
  clearCountdown()
  clearSuccessRedirectTimer()
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
  background: url('@/assets/images/backx.png') no-repeat top center;
  background-size: 100% 100%;
}

.register-card {
  position: relative;
  max-width: 980px;
  min-height: 560px;
  margin: 0 auto;
  padding: 28px 116px 48px;
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
  padding-bottom: 90px;
  box-sizing: border-box;
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
  height: 2px;
  border: 0;
  background: repeating-linear-gradient(to right,
      rgba(214, 223, 237, 1) 0 7px,
      transparent 7px 24px);
  margin: 22px 0 30px;
}

.action-row {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 28px;
  display: flex;
  justify-content: center;
}

.double-actions {
  gap: 12px;
}

.action-row.double-actions {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
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

:deep(.is-local .loading-text.register-success-text) {
  font-size: 16px;
}

.captcha-action {
  color: rgba(49, 125, 254, 1);
  user-select: none;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  margin-right: 4px;
}

.captcha-action.is-disabled {
  color: rgba(49, 125, 254, 1);
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: -60px;
}

.login-link-text {
  font-size: 14px;
  color: rgba(102, 102, 102, 1);
}

.login-link-btn {
  font-size: 14px;
  color: rgba(49, 125, 254, 1);
  cursor: pointer;
  user-select: none;
}

:deep(.phone-input-with-code .el-input__inner) {
  padding-right: 60px;
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
    padding: 20px 16px 30px;
  }

  .register-title {
    font-size: 30px;
    line-height: 42px;
  }

  .register-form {
    max-width: none;
    padding-bottom: 108px;
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
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 20px;
    flex-direction: column;
    gap: 10px;
  }

  .action-row.double-actions {
    width: auto;
    max-width: none;
    margin: 0;
  }

  .prev-btn,
  .next-btn {
    width: 100%;
  }

  .login-link-row {
    margin-top: -88px;
    margin-bottom: 8px;
  }
}
</style>
