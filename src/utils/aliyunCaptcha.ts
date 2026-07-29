// 阿里云验证码前端 SDK 地址
const ALIYUN_CAPTCHA_SCRIPT_URL =
  'https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js'

/** 阿里云验证码校验成功后返回给业务接口的完整参数。 */
export interface AliyunCaptchaVerifyParams {
  sceneId: string
  certifyId: string
  deviceToken: string
  data: string
}

/** 初始化阿里云验证码时传入的参数 */
export interface AliyunCaptchaOptions {
  /** 阿里云验证码场景 ID */
  SceneId: string
  /** 验证码交互模式，当前使用弹窗模式 */
  mode: 'popup'
  /** 验证码挂载元素的 CSS 选择器 */
  element: string
  /** 触发验证码的按钮 CSS 选择器 */
  button: string
  /** 完成人机校验后调用，由业务接口返回最终校验结果 */
  captchaVerifyCallback: (
    captchaVerifyParams: AliyunCaptchaVerifyParams | string,
  ) => Promise<AliyunCaptchaVerifyResult>
  /** 业务校验完成后的回调 */
  onBizResultCallback?: (result: boolean) => void
  /** 获取验证码 SDK 实例 */
  getInstance?: (instance: unknown) => void
  /** 验证码界面语言 */
  language?: 'cn'
  /** 滑块验证码的尺寸 */
  slideStyle?: {
    width: number
    height: number
  }
}

/** captchaVerifyCallback 返回给 SDK 的校验结果 */
export interface AliyunCaptchaVerifyResult {
  /** 验证码参数是否校验通过 */
  captchaResult: boolean
  /** 业务操作是否执行成功 */
  bizResult?: boolean
}

/** 加载验证码 SDK 前写入 window 的区域配置 */
export interface AliyunCaptchaConfig {
  /** 阿里云服务区域 */
  region: string
  /** 验证码服务接入前缀 */
  prefix: string
}

// 补充阿里云验证码 SDK 注入到 window 上的全局变量类型
declare global {
  interface Window {
    AliyunCaptchaConfig?: AliyunCaptchaConfig
    initAliyunCaptcha?: (options: AliyunCaptchaOptions) => void
  }
}

// 复用同一个加载任务，避免多次插入 SDK script 标签
let captchaScriptPromise: Promise<void> | null = null
// 记录 SDK 加载完成时间，用于计算初始化前仍需等待的时间
let captchaScriptLoadedAt = 0

/** 加载阿里云验证码 SDK；已加载或正在加载时直接复用现有结果。 */
const loadAliyunCaptchaScript = (config: AliyunCaptchaConfig) => {
  // 阿里云 SDK 执行时会从 window 读取此区域与接入前缀配置。
  window.AliyunCaptchaConfig = config
  // SDK 已加载并已将初始化函数挂到 window 时，无需重复插入 script 标签。
  if (window.initAliyunCaptcha) return Promise.resolve()
  if (captchaScriptPromise) return captchaScriptPromise

  captchaScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = ALIYUN_CAPTCHA_SCRIPT_URL
    script.async = true
    script.onload = () => {
      // 外部 AliyunCaptcha.js 执行后会在 window 上挂载 initAliyunCaptcha。
      if (window.initAliyunCaptcha) {
        captchaScriptLoadedAt = Date.now()
        resolve()
      } else {
        reject(new Error('阿里云验证码初始化函数不可用'))
      }
    }
    script.onerror = () => reject(new Error('Aliyun CAPTCHA script failed to load'))
    // 插入 head 后，浏览器会下载并执行阿里云 CDN 上的 SDK 脚本。
    document.head.appendChild(script)
  })

  return captchaScriptPromise
}

/** 提前加载验证码 SDK，缩短用户触发验证后的等待时间。 */
export const preloadAliyunCaptcha = (config: AliyunCaptchaConfig) => loadAliyunCaptchaScript(config)

/** 加载 SDK，并在 SDK 加载满 2 秒后创建验证码实例。 */
export const initAliyunCaptcha = async (
  config: AliyunCaptchaConfig,
  options: AliyunCaptchaOptions,
) => {
  await loadAliyunCaptchaScript(config)
  // 预加载不足 2 秒时只等待剩余时长，避免每次初始化都固定等待 2 秒
  const remainingDelay = 2000 - (Date.now() - captchaScriptLoadedAt)
  if (remainingDelay > 0) {
    await new Promise<void>((resolve) => window.setTimeout(resolve, remainingDelay))
  }
  if (!window.initAliyunCaptcha) {
    throw new Error('阿里云验证码初始化函数不可用')
  }
  // 调用阿里云 SDK 提供的全局函数，按 options 创建并绑定验证码实例。
  window.initAliyunCaptcha(options)
  // SDK 会在初始化后的事件循环中绑定 button；等待其完成后再允许调用方触发验证码。
  await new Promise<void>((resolve) => window.setTimeout(resolve, 0))
}
