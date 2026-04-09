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
  account: string
  password: string
  oldPassword: string
}

// 修改密码
export const changePassword = (data: ChangePasswordParams) => {
  return http.post('/front/member/resetPwd', data)
}

export interface EditMemberPersonInfoParams {
  type?: string
  name?: string
  contactMan?: string
  contactPhone?: string
  contactEmail?: string
  subName?: string
  creditCode?: string
  legalPerson?: string
  cardNo?: string
  license?: string
  companyAddress?: string
  corporateAccount?: string
  corporateBank?: string
}

export interface EditMemberBodyParams {
  id?: number
  userRose?: string
  type?: string
  name?: string
  personName?: string
  personPhone?: string
  personNumber?: string
  relation?: string
  contactMan?: string
  contactPhone?: string
  provinceId?: string
  province?: string
  cityId?: string
  city?: string
  areaId?: string
  area?: string
  mergerName?: string
  address?: string
}

export interface EditMemberProfileParams {
  uid?: number
  userRose: string
  avatar?: string
  personInfo?: EditMemberPersonInfoParams
  body?: EditMemberBodyParams
}

// 修改个人信息
export const editMemberProfile = (data: EditMemberProfileParams) => {
  return http.post<Response<null>>('/front/member/edit', data)
}

// 企业注册请求参数
export interface RegisterCustomerParams {
  type?: string
  enterpriseName: string
  enterpriseAbbreviation: string
  unifiedSocialCreditCode: string
  businessLicensePhoto: string
  captcha: string
  legalPerson: string
  legalPersonIdCardNumber: string
  phoneNumber: string
  password: string
  email: string
  companyAddress: string
  corporateAccountNumber: string
  corporateAccountBank: string
}

// 企业注册
export const registerCustomer = (data: RegisterCustomerParams) => {
  return http.post<Response<null>>('/front/register/customer', data)
}
