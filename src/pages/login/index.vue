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
            <span
              class="login-tab px-6 py-2 cursor-pointer text-[15px] transition-all"
              :class="loginMode === 'captcha' ? 'active' : 'inactive'"
              @click="setLoginMode('captcha')"
            >
              验证码登录
            </span>
            <span
              class="login-tab px-6 py-2 cursor-pointer text-[15px] transition-all"
              :class="loginMode === 'password' ? 'active' : 'inactive'"
              @click="setLoginMode('password')"
            >
              密码登录
            </span>
          </div>
        </div>

        <div class="w-full pt-6">
          <!-- 手机号输入 -->
          <el-input
            class="h-[50px] bg-[rgba(246, 245, 250, 1)]"
            v-model="phone"
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            @input="onPhoneInput"
            placeholder="请输入手机号码"
            maxlength="11"
          />

          <!-- 验证码登录模式 -->
          <el-input
            v-if="loginMode === 'captcha'"
            class="mt-5 h-[50px] bg-[rgba(246, 245, 250, 1)] captcha-input"
            v-model="captcha"
            maxlength="6"
            placeholder="请输入验证码"
          >
            <template #append>
              <button
                :id="aliyunCaptchaButtonId"
                type="button"
                class="aliyun-captcha-trigger"
                :class="{
                  'opacity-60 cursor-not-allowed': typeof countdown === 'number' || isSendingCode,
                }"
                :disabled="typeof countdown === 'number' || isSendingCode"
                @click="getCaptcha"
              >
                {{
                  aliyunCaptchaState === 'loading'
                    ? '验证加载中'
                    : countdown === '获取验证码'
                      ? countdown
                      : `${countdown}秒后重试`
                }}
              </button>
            </template>
          </el-input>

          <!-- 密码登录模式 -->
          <el-input
            v-else
            class="mt-5 h-[50px] bg-[rgba(246, 245, 250, 1)]"
            v-model="password"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="请输入密码"
          >
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
            <span class="cursor-pointer agreement-link" @click.prevent.stop="openAgreement('user')"
              >《用户协议》</span
            >
            <span class="text-[rgba(102,102,102,1)]">和</span>
            <span
              class="cursor-pointer agreement-link"
              @click.prevent.stop="openAgreement('privacy')"
              >《隐私协议》</span
            >
          </el-checkbox>
        </div>
        <div class="w-full">
          <el-button class="w-full h-[50px] text-[16px]" :loading="isLoggingIn" @click="handleLogin"
            >登录</el-button
          >
        </div>
        <!-- <div class="w-full text-right mt-3">
          <span class="register-link cursor-pointer text-[14px]" @click="goToRegister">没有账号？去注册</span>
        </div> -->
      </div>
    </div>

    <!-- 协议弹窗 -->
    <agreement-modal v-model="showAgreement" :type="agreementType" />

    <div :id="aliyunCaptchaElementId"></div>
  </div>
</template>

<script lang="ts" setup>
import { loginByCaptcha, loginByPassword, sendCode } from '@/api'
import AgreementModal from '@/components/modals/AgreementModal.vue'
import { initAliyunCaptcha, type AliyunCaptchaVerifyParams } from '@/utils/aliyunCaptcha'
import { useSessionManager } from '@/utils/sessionManager'
import { Hide, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { md5 } from 'js-md5'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'LoginPage',
})

// 登录模式类型
type LoginMode = 'captcha' | 'password'

const sessionManager = useSessionManager()
const router = useRouter()
const SEND_CODE_AUTHORIZATION_BASE_URL = 'https://wechat.shenzhenxiaoan.com/'
const ALIYUN_CAPTCHA_SCENE_ID = import.meta.env.VITE_ALIYUN_CAPTCHA_SCENE_ID?.trim() ?? ''
const ALIYUN_CAPTCHA_PREFIX = import.meta.env.VITE_ALIYUN_CAPTCHA_PREFIX?.trim() ?? ''
const ALIYUN_CAPTCHA_REGION = 'cn'

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

const aliyunCaptchaState = ref<'idle' | 'loading' | 'ready'>('idle')
const isAliyunCaptchaConfigured = computed(() =>
  Boolean(ALIYUN_CAPTCHA_SCENE_ID && ALIYUN_CAPTCHA_PREFIX),
)
const aliyunCaptchaElementId = 'aliyun-captcha-element'
const aliyunCaptchaButtonId = 'aliyun-captcha-button'
let isAliyunCaptchaInitialized = false
let captchaInitializationPromise: Promise<boolean> | null = null
let shouldOpenCaptchaWhenReady = false

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

const startCountdown = () => {
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
}

const sendCaptcha = async (captchaVerifyParams: AliyunCaptchaVerifyParams | string) => {
  if (isSendingCode.value) {
    return { captchaResult: false, bizResult: false }
  }

  isSendingCode.value = true
  try {
    const res = await sendCode(phone.value, captchaVerifyParams, {
      Authorization: md5(`${SEND_CODE_AUTHORIZATION_BASE_URL}${phone.value}`),
    })
    if (res.code !== '200' && res.code !== 200) {
      ElMessage.error('验证失败，请重试')
      return { captchaResult: false, bizResult: false }
    }

    // if (!res.data?.captchaVerifyResult) {
    //   ElMessage.error('安全验证未通过，请重试')
    //   return { captchaResult: false, bizResult: false }
    // }
    // if (!res.data.bizResult) {
    //   ElMessage.error(res.message || '验证码发送失败')
    //   return { captchaResult: true, bizResult: false }
    // }

    ElMessage.success('验证码发送成功')
    startCountdown()
    return { captchaResult: true, bizResult: true }
  } catch {
    ElMessage.error('验证码发送失败，请稍后重试')
    return { captchaResult: false, bizResult: false }
  } finally {
    isSendingCode.value = false
  }
}

const handleCaptchaVerify = (captchaVerifyParams: AliyunCaptchaVerifyParams | string) =>
  sendCaptcha(captchaVerifyParams)

const initCaptcha = (showError = true): Promise<boolean> => {
  if (isAliyunCaptchaInitialized) {
    aliyunCaptchaState.value = 'ready'
    return Promise.resolve(true)
  }
  if (captchaInitializationPromise) return captchaInitializationPromise

  aliyunCaptchaState.value = 'loading'
  captchaInitializationPromise = (async () => {
    try {
      await nextTick()
      await initAliyunCaptcha(
        { region: ALIYUN_CAPTCHA_REGION, prefix: ALIYUN_CAPTCHA_PREFIX },
        {
          SceneId: ALIYUN_CAPTCHA_SCENE_ID,
          mode: 'popup',
          element: `#${aliyunCaptchaElementId}`,
          button: `#${aliyunCaptchaButtonId}`,
          language: 'cn',
          slideStyle: { width: 320, height: 40 },
          captchaVerifyCallback: handleCaptchaVerify,
          onBizResultCallback: (result) => {
            if (!result) {
              ElMessage.error('安全验证未通过，请重试')
            }
          },
        },
      )
      isAliyunCaptchaInitialized = true
      aliyunCaptchaState.value = 'ready'

      if (shouldOpenCaptchaWhenReady) {
        shouldOpenCaptchaWhenReady = false
        window.setTimeout(() => document.getElementById(aliyunCaptchaButtonId)?.click(), 0)
      }
      return true
    } catch {
      aliyunCaptchaState.value = 'idle'
      if (showError) {
        ElMessage.error('阿里云验证码加载失败，请稍后重试')
      }
      return false
    } finally {
      captchaInitializationPromise = null
    }
  })()

  return captchaInitializationPromise
}

// 获取验证码
const getCaptcha = (event: MouseEvent) => {
  if (typeof countdown.value === 'number' || isSendingCode.value || !validateSendCodeForm()) {
    event.preventDefault()
    event.stopImmediatePropagation()
    return
  }
  if (!isAliyunCaptchaConfigured.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
    ElMessage.error('阿里云验证码尚未配置')
    return
  }

  if (aliyunCaptchaState.value === 'ready') return

  event.preventDefault()
  event.stopImmediatePropagation()
  shouldOpenCaptchaWhenReady = true
  void initCaptcha()
}

onMounted(() => {
  if (!isAliyunCaptchaConfigured.value) return
  void initCaptcha(false)
})

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
    console.log('')
  } finally {
    isLoggingIn.value = false
  }
}

onBeforeUnmount(() => {
  clearCountdown()
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

.aliyun-captcha-trigger {
  padding: 0;
  color: inherit;
  font: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}
</style>
