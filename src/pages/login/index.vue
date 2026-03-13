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
                'pointer-events-none opacity-60 cursor-not-allowed': typeof countdown === 'number',
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
            <span class="text-[rgba(49, 125, 254, 1)] cursor-pointer agreement-link"
              @click.prevent.stop="openAgreement('user')">《用户协议》</span>
            <span class="text-[rgba(102,102,102,1)]">和</span>
            <span class="text-[rgba(49, 125, 254, 1)] cursor-pointer agreement-link"
              @click.prevent.stop="openAgreement('privacy')">《隐私协议》</span>
          </el-checkbox>
        </div>
        <div class="w-full">
          <el-button class="w-full h-[50px] text-[16px]" :loading="isLoggingIn" @click="handleLogin">登录</el-button>
        </div>
      </div>
    </div>

    <!-- 协议弹窗 -->
    <agreement-modal v-model="showAgreement" :type="agreementType" />
  </div>
</template>

<script lang="ts" setup>
import { loginByCaptcha, loginByPassword, sendCode } from '@/api'
import AgreementModal from '@/components/modals/AgreementModal.vue'
import { useUserStore } from '@/stores/user'
import { useSessionManager } from '@/utils/sessionManager'
import { Hide, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'LoginPage',
})

// 登录模式类型
type LoginMode = 'captcha' | 'password'

const userStore = useUserStore()
const sessionManager = useSessionManager()
const router = useRouter()

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

// 获取验证码
const getCaptcha = async () => {
  if (typeof countdown.value === 'number') {
    return
  }
  if (!phone.value) {
    ElMessage.warning('请输入手机号码')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    ElMessage.warning('请输入正确的手机号码')
    return
  }

  const res = await sendCode(phone.value)
  if (res.code === '200') {
    ElMessage.success('验证码发送成功')
    countdown.value = 60

    timer = setInterval(() => {
      if (typeof countdown.value === 'number') {
        countdown.value -= 1
        if (countdown.value === 0) {
          countdown.value = '获取验证码'
          if (timer) {
            clearInterval(timer)
            timer = null
          }
        }
      }
    }, 1000)
  } else {
    ElMessage.error(res.message)
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
  } catch (error) {
    console.log("")
  } finally {
    isLoggingIn.value = false
  }
}
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
  text-decoration: none;
}

.agreement-link:hover {
  color: rgba(49, 125, 254, 1);
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
</style>
