<template>
  <div class="bg-[rgba(233,238,244,1)] w-full h-screen flex items-center justify-center">
    <div class="w-[900px] h-[560px] bg-white flex">
      <img src="@/assets/images/bg.png" alt="login-bg" class="w-[521px] h-full" />
      <div class="flex-1 flex flex-col items-center px-8">
        <div class="text-center pt-16 text-[26px] font-bold text-[rgba(34, 34, 34, 1)]">
          欢迎登录
        </div>

        <!-- 登录方式 Tab 切换 -->
        <div class="w-full flex justify-center mt-6">
          <div class="login-tabs flex">
            <span class="login-tab px-6 py-2 cursor-pointer text-[15px] transition-all"
              :class="loginMode === 'captcha' ? 'active' : 'inactive'" @click="setLoginMode('captcha')">
              验证码登录
            </span>
            <span class="login-tab px-6 py-2 cursor-pointer text-[15px] transition-all"
              :class="loginMode === 'password' ? 'active' : 'inactive'" @click="setLoginMode('password')">
              密码登录
            </span>
          </div>
        </div>

        <div class="w-full pt-6">
          <!-- 手机号输入 -->
          <el-input class="h-[50px] bg-[rgba(246, 245, 250, 1)]" v-model="phone" type="tel" inputmode="numeric"
            pattern="[0-9]*" @input="onPhoneInput" placeholder="请输入手机号码" maxlength="11" />

          <!-- 验证码登录模式 -->
          <el-input v-if="loginMode === 'captcha'" class="mt-5 h-[50px] bg-[rgba(246, 245, 250, 1)] captcha-input"
            v-model="captcha" maxlength="6" placeholder="请输入验证码">
            <template #append>
              <span class="cursor-pointer" :class="{
                'pointer-events-none opacity-60 cursor-not-allowed':
                  typeof countdown === 'number' || isSendingCode,
              }" @click="getCaptcha">
                {{ countdown === '获取验证码' ? countdown : `${countdown}秒后重试` }}
              </span>
            </template>
          </el-input>

          <!-- 密码登录模式 -->
          <el-input v-else class="mt-5 h-[50px] bg-[rgba(246, 245, 250, 1)]" v-model="password"
            :type="passwordVisible ? 'text' : 'password'" placeholder="请输入密码">
            <template #suffix>
              <span class="cursor-pointer flex items-center h-full" @click="togglePasswordVisible">
                <el-icon v-if="passwordVisible">
                  <View />
                </el-icon>
                <el-icon v-else>
                  <Hide />
                </el-icon>
              </span>
            </template>
          </el-input>
        </div>

        <div class="w-full flex items-center px-2 py-6">
          <el-checkbox v-model="remember" class="custom-checkbox">
            <span class="text-[rgba(102,102,102,1)]">我已阅读并同意</span>
            <span class="cursor-pointer agreement-link"
              @click.prevent.stop="openAgreement('user')">《用户协议》</span>
            <span class="text-[rgba(102,102,102,1)]">和</span>
            <span class="cursor-pointer agreement-link"
              @click.prevent.stop="openAgreement('privacy')">《隐私协议》</span>
          </el-checkbox>
        </div>
        <div class="w-full">
          <el-button class="w-full h-[50px] text-[16px]" :loading="isLoggingIn" @click="handleLogin">登录</el-button>
        </div>
        <!-- <div class="w-full text-right mt-3">
          <span class="register-link cursor-pointer text-[14px]" @click="goToRegister">没有账号？去注册</span>
        </div> -->
      </div>
    </div>

    <!-- 协议弹窗 -->
    <agreement-modal v-model="showAgreement" :type="agreementType" />

    <el-dialog v-model="humanVerificationVisible" title="安全验证" width="400px" align-center :close-on-click-modal="false"
      :close-on-press-escape="false" :show-close="!humanVerificationPassed" class="human-verification-dialog"
      @closed="resetHumanVerification">
      <div class="human-verification-content">
        <p class="human-verification-tip">请按住滑块，拖动到最右侧完成验证</p>
        <div ref="sliderTrack" class="human-verification-slider"
          :class="{ 'is-success': humanVerificationPassed }">
          <div class="human-verification-slider__progress" :style="{ width: sliderProgressWidth }"></div>
          <span class="human-verification-slider__text">
            {{ humanVerificationPassed ? '验证成功' : '向右拖动滑块' }}
          </span>
          <button type="button" class="human-verification-slider__handle" :class="{
            'is-dragging': isSliderDragging,
            'is-success': humanVerificationPassed,
          }" :style="{ transform: `translateX(${sliderOffset}px)` }" role="slider" aria-label="人机安全验证"
            :aria-valuenow="Math.round(sliderProgress)" aria-valuemin="0" aria-valuemax="100"
            :aria-valuetext="humanVerificationPassed ? '验证成功' : '向右拖动滑块完成验证'" @pointerdown="startSliding"
            @pointermove="moveSlider" @pointerup="endSliding" @pointercancel="cancelSliding" @keydown="moveSliderByKey">
            <el-icon>
              <CircleCheck v-if="humanVerificationPassed" />
              <ArrowRight v-else />
            </el-icon>
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { loginByCaptcha, loginByPassword, sendCode } from '@/api'
import AgreementModal from '@/components/modals/AgreementModal.vue'
import { useSessionManager } from '@/utils/sessionManager'
import { ArrowRight, CircleCheck, Hide, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { md5 } from 'js-md5'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'LoginPage',
})

// 登录模式类型
type LoginMode = 'captcha' | 'password'

const sessionManager = useSessionManager()
const router = useRouter()
const SEND_CODE_AUTHORIZATION = '87f4b816c7285c91681ac3b93f47549c'

// 表单数据
const phone = ref('')
const captcha = ref('')
const password = ref('')
const passwordVisible = ref(false)

// 登录按钮防抖
const isLoggingIn = ref(false)

// 登录模式
const loginMode = ref<LoginMode>('captcha')

// 验证码倒计时
const countdown = ref<string | number>('获取验证码')
let timer: ReturnType<typeof setInterval> | null = null
const isSendingCode = ref(false)

const SLIDER_HANDLE_WIDTH = 48
const SLIDER_SUCCESS_THRESHOLD = 0.95
const humanVerificationVisible = ref(false)
const humanVerificationPassed = ref(false)
const sliderTrack = ref<HTMLElement | null>(null)
const sliderOffset = ref(0)
const isSliderDragging = ref(false)
let sliderStartX = 0
let sliderStartOffset = 0
let humanVerificationTimer: ReturnType<typeof setTimeout> | null = null

const sliderMaxOffset = () => {
  return Math.max((sliderTrack.value?.clientWidth ?? 0) - SLIDER_HANDLE_WIDTH, 0)
}

const sliderProgress = computed(() => {
  const maxOffset = sliderMaxOffset()
  return maxOffset === 0 ? 0 : (sliderOffset.value / maxOffset) * 100
})

const sliderProgressWidth = computed(() => {
  const trackWidth = sliderTrack.value?.clientWidth ?? 0
  return `${Math.min(sliderOffset.value + SLIDER_HANDLE_WIDTH / 2, trackWidth)}px`
})

// 协议相关
const remember = ref(false)
const showAgreement = ref(false)
const agreementType = ref<'user' | 'privacy'>('user')

// 切换登录模式
const setLoginMode = (mode: LoginMode) => {
  if (loginMode.value === mode) return
  loginMode.value = mode
  // 清空对应字段
  captcha.value = ''
  password.value = ''
}

// 切换密码可见性
const togglePasswordVisible = () => {
  passwordVisible.value = !passwordVisible.value
}

// 打开协议弹窗
const openAgreement = (type: 'user' | 'privacy') => {
  agreementType.value = type
  showAgreement.value = true
}

// 手机号输入只保留数字并限制为 11 位
const onPhoneInput = () => {
  phone.value = (phone.value || '').replace(/\D/g, '').slice(0, 11)
}

const clearCountdown = () => {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

const clearHumanVerificationTimer = () => {
  if (!humanVerificationTimer) return
  clearTimeout(humanVerificationTimer)
  humanVerificationTimer = null
}

const resetHumanVerification = () => {
  clearHumanVerificationTimer()
  humanVerificationPassed.value = false
  isSliderDragging.value = false
  sliderOffset.value = 0
}

const validateSendCodeForm = (): boolean => {
  if (!remember.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私协议')
    return false
  }
  if (!phone.value) {
    ElMessage.warning('请输入手机号码')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    ElMessage.warning('请输入正确的手机号码')
    return false
  }
  return true
}

const completeHumanVerification = () => {
  if (humanVerificationPassed.value) return

  humanVerificationPassed.value = true
  sliderOffset.value = sliderMaxOffset()
  clearHumanVerificationTimer()
  humanVerificationTimer = setTimeout(() => {
    humanVerificationTimer = null
    humanVerificationVisible.value = false
    void sendCaptcha()
  }, 400)
}

const startSliding = (event: PointerEvent) => {
  if (humanVerificationPassed.value) return

  const handle = event.currentTarget as HTMLElement
  handle.setPointerCapture(event.pointerId)
  isSliderDragging.value = true
  sliderStartX = event.clientX
  sliderStartOffset = sliderOffset.value
}

const moveSlider = (event: PointerEvent) => {
  if (!isSliderDragging.value || humanVerificationPassed.value) return

  const maxOffset = sliderMaxOffset()
  sliderOffset.value = Math.min(Math.max(sliderStartOffset + event.clientX - sliderStartX, 0), maxOffset)
}

const endSliding = (event: PointerEvent) => {
  if (!isSliderDragging.value) return

  moveSlider(event)
  isSliderDragging.value = false
  const handle = event.currentTarget as HTMLElement
  if (handle.hasPointerCapture(event.pointerId)) {
    handle.releasePointerCapture(event.pointerId)
  }

  if (sliderProgress.value >= SLIDER_SUCCESS_THRESHOLD * 100) {
    completeHumanVerification()
    return
  }
  sliderOffset.value = 0
}

const cancelSliding = () => {
  if (!isSliderDragging.value) return
  isSliderDragging.value = false
  sliderOffset.value = 0
}

const moveSliderByKey = (event: KeyboardEvent) => {
  if (humanVerificationPassed.value) return

  const maxOffset = sliderMaxOffset()
  if (event.key === 'ArrowRight') {
    sliderOffset.value = Math.min(sliderOffset.value + maxOffset / 10, maxOffset)
  } else if (event.key === 'ArrowLeft') {
    sliderOffset.value = Math.max(sliderOffset.value - maxOffset / 10, 0)
  } else if (event.key === 'Home') {
    sliderOffset.value = 0
  } else if (event.key === 'End') {
    sliderOffset.value = maxOffset
  } else {
    return
  }

  event.preventDefault()
  if (sliderProgress.value >= SLIDER_SUCCESS_THRESHOLD * 100) {
    completeHumanVerification()
  }
}

// 获取验证码
const getCaptcha = () => {
  if (typeof countdown.value === 'number' || isSendingCode.value) {
    return
  }
  if (!validateSendCodeForm()) return

  resetHumanVerification()
  humanVerificationVisible.value = true
}

const sendCaptcha = async () => {
  if (isSendingCode.value) return

  isSendingCode.value = true
  try {
    const res = await sendCode(phone.value, {
      Authorization: `${SEND_CODE_AUTHORIZATION}${md5(phone.value)}`,
    })
    if (res.code !== '200' && res.code !== 200) {
      ElMessage.error(res.message || '验证码发送失败')
      return
    }

    ElMessage.success('验证码发送成功')
    countdown.value = 60
    clearCountdown()
    timer = setInterval(() => {
      if (typeof countdown.value === 'number') {
        countdown.value -= 1
        if (countdown.value <= 0) {
          countdown.value = '获取验证码'
          clearCountdown()
        }
      }
    }, 1000)
  } catch {
    ElMessage.error('验证码发送失败，请稍后重试')
  } finally {
    isSendingCode.value = false
  }
}

// 表单验证
const validateForm = (): boolean => {
  if (!phone.value) {
    ElMessage.warning('请输入手机号码')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    ElMessage.warning('请输入正确的手机号码')
    return false
  }
  if (loginMode.value === 'captcha' && !captcha.value) {
    ElMessage.warning('请输入验证码')
    return false
  }
  if (loginMode.value === 'password' && !password.value) {
    ElMessage.warning('请输入密码')
    return false
  }
  if (!remember.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私协议')
    return false
  }
  return true
}

// 登录
const handleLogin = async () => {
  if (isLoggingIn.value) return
  if (!validateForm()) return

  isLoggingIn.value = true
  try {
    let res
    if (loginMode.value === 'captcha') {
      res = await loginByCaptcha({
        phone: phone.value,
        captcha: captcha.value,
        isCustomer: true,
        type: 'H5',
      })
    } else {
      res = await loginByPassword({
        account: phone.value,
        password: password.value,
        // isCustomer: true,
        // type: 'H5',
      })
    }

    if (res.code === '200') {
      // 先清除旧的会话状态
      sessionManager.clearSession()

      // 设置新 token
      localStorage.setItem('token', res.data.token)

      // 重置会话状态（初始化新会话）
      sessionManager.resetSession()

      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(res.message)
    }
  } catch {
    console.log("")
  } finally {
    isLoggingIn.value = false
  }
}

onBeforeUnmount(() => {
  clearCountdown()
  clearHumanVerificationTimer()
})
</script>

<style scoped>
:deep(.el-button) {
  background: rgba(49, 125, 254, 1) !important;
  border-color: rgba(49, 125, 254, 1) !important;
  color: white !important;
  border-radius: 10px !important;
}

:deep(.el-input__wrapper) {
  background: rgba(246, 245, 250, 1) !important;
  box-shadow: none !important;
  border-radius: 10px !important;
  border: none !important;
}

:deep(.el-input__inner) {
  background: rgba(246, 245, 250, 1) !important;
  border: none !important;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: none !important;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
}

:deep(.el-input-group__append) {
  background: rgba(246, 245, 250, 1) !important;
  box-shadow: none !important;
  color: rgba(49, 125, 254, 1) !important;
  border: none !important;
}

/* 验证码输入框带边框样式 */
:deep(.captcha-input .el-input__wrapper) {
  border-right: none !important;
  border-radius: 10px 0 0 10px !important;
}

:deep(.captcha-input .el-input-group__append) {
  border-left: none !important;
  border-radius: 0 10px 10px 0 !important;
}

/* 自定义圆形 checkbox 样式 */
:deep(.custom-checkbox .el-checkbox__inner) {
  border-radius: 50% !important;
  width: 18px !important;
  height: 18px !important;
}

:deep(.custom-checkbox .el-checkbox__inner::after) {
  left: 7.5px !important;
  top: 8px !important;
  width: 4px !important;
  height: 8px !important;
}

/* 协议链接下划线样式 */
.agreement-link {
  color: rgba(49, 125, 254, 1) !important;
  text-decoration: none;
}

.agreement-link:hover,
.agreement-link:active,
.agreement-link:visited {
  color: rgba(49, 125, 254, 1);
}

.register-link {
  color: rgba(49, 125, 254, 1);
}

.register-link:hover {
  color: rgba(49, 125, 254, 0.8);
}

/* 登录方式 Tab 样式 */
.login-tabs {
  border-bottom: 1px solid rgba(229, 231, 235, 1);
}

.login-tab {
  position: relative;
}

.login-tab.active {
  color: rgba(49, 125, 254, 1);
  font-weight: 500;
}

.login-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: rgba(49, 125, 254, 1);
  border-radius: 1px;
}

.login-tab.inactive {
  color: rgba(102, 102, 102, 1);
}

.login-tab.inactive:hover {
  color: rgba(49, 125, 254, 0.7);
}

:deep(.human-verification-dialog) {
  border-radius: 8px;
}

:deep(.human-verification-dialog .el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px 8px;
}

:deep(.human-verification-dialog .el-dialog__title) {
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

:deep(.human-verification-dialog .el-dialog__body) {
  padding: 16px 24px 28px;
}

.human-verification-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.human-verification-tip {
  margin: 0 0 18px;
  color: #64748b;
  font-size: 14px;
  line-height: 20px;
}

.human-verification-slider {
  position: relative;
  display: flex;
  align-items: center;
  width: 300px;
  height: 48px;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px solid #dbe3ee;
  border-radius: 6px;
  user-select: none;
}

.human-verification-slider.is-success {
  background: #f0fdf4;
  border-color: #86efac;
}

.human-verification-slider__progress {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: #dcfce7;
  transition: width 0.05s linear;
}

.human-verification-slider__text {
  position: relative;
  z-index: 1;
  width: 100%;
  color: #64748b;
  font-size: 14px;
  line-height: 48px;
  text-align: center;
  pointer-events: none;
}

.is-success .human-verification-slider__text {
  color: #15803d;
}

.human-verification-slider__handle {
  position: absolute;
  z-index: 2;
  top: -1px;
  left: -1px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  color: #317dfe;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: grab;
  touch-action: none;
  transition: transform 0.05s linear, color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.human-verification-slider__handle:focus-visible {
  outline: 2px solid #317dfe;
  outline-offset: -3px;
}

.human-verification-slider__handle.is-dragging {
  cursor: grabbing;
}

.human-verification-slider__handle.is-success {
  color: #fff;
  background: #16a34a;
  border-color: #16a34a;
  cursor: default;
}
</style>
