import router from '@/router'
import { useSessionManager } from '@/utils/sessionManager'
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'
import type { Response } from './types'

axios.defaults.timeout = 1000 * 600
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// axios实例拦截请求
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    config.headers.Authorization = `${token}`
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// axios实例拦截响应
service.interceptors.response.use(
  (response: AxiosResponse<Response>) => {
    const { code, message } = response.data
    let errMessage = ''
    switch (code) {
      case 0:
        break
      case 'A10003': // token过期
        errMessage = 'Token expired'
        // 使用 session manager 清除所有会话状态
        const sessionManager = useSessionManager()
        sessionManager.handleUnauthorized()
        router.push('/login')
        break
      case 2: // 无权限
        errMessage = 'No permission'
        break
      default:
        errMessage = message
        break
    }
    if (errMessage === 'Token expired' || errMessage === 'No permission')
      ElMessage.error(errMessage)
    return response
  },
  // 非2xx时触发
  (error: AxiosError) => {
    interface ErrorResponse {
      code?: string
      message?: string
    }
    const responseData = error.response?.data as ErrorResponse
    // 处理 500 错误，检查是否是 'A10003' 或 'B0301'
    if (
      error.response?.status === 500 &&
      typeof responseData === 'object' &&
      (responseData.code === 'A10003' || responseData.code === 'B0301')
    ) {
      // 使用 session manager 清除所有会话状态
      const sessionManager = useSessionManager()
      sessionManager.handleUnauthorized()
      router.push('/login')
    } else if (error.response?.status === 401) {
      // 处理 401 未授权
      const sessionManager = useSessionManager()
      sessionManager.handleUnauthorized()
      router.push('/login')
    } else {
      // 其他错误情况，显示错误消息
      ElMessage.error((error.response?.data as { message?: string })?.message || error.message)
    }
    return Promise.reject(error)
  },
)

export type { AxiosRequestConfig, AxiosResponse }

export default service
