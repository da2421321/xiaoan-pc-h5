/**
 * 用户相关接口 - 登录、验证码、个人信息
 */
import http from '@/utils/request'
import type { Response } from '@/utils/request'

// 验证码登录请求参数
export interface CaptchaLoginParams {
  phone: string
  captcha: string | null
  isCustomer: boolean
  type: string
}

// 密码登录请求参数
export interface PasswordLoginParams {
  account: string
  password: string
  // isCustomer: boolean
  // type: string
}

// 登录响应数据
export interface LoginResponse {
  token: string
}

// 验证码登录
export const loginByCaptcha = (data: CaptchaLoginParams) => {
  return http.post<Response<LoginResponse>>('/front/login/h5/mobile', data)
}

// 密码登录
export const loginByPassword = (data: PasswordLoginParams) => {
  return http.post<Response<LoginResponse>>('/front/login', data)
}

// 兼容旧的 login 函数
export const login = (data: Record<string, unknown>) => {
  return http.post<Response<LoginResponse>>('/front/login/h5/mobile', data)
}

// 发送验证码响应
export interface SendCodeResponse {
  code: string
  message: string
}

// 发送验证码
export const sendCode = (phone: string) => {
  return http.post<Response<null>>(`/front/sendCode?phone=${phone}`)
}

// 获取个人信息
export const getUserInfo = () => {
  return http.get<Response<unknown>>('/front/member')
}

// 修改密码请求参数
export interface ChangePasswordParams {
  account: string      // 登录手机号
  password: string     // 新密码
  oldPassword: string  // 原密码
}

// 修改密码
export const changePassword = (data: ChangePasswordParams) => {
  return http.post('/front/member/resetPwd', data)
}
