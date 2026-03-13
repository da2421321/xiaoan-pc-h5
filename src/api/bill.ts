/**
 * 账单/钱包相关接口
 */
import http from '@/utils/request'

// 获取账单列表（旧）
export const getBillList = (params: Record<string, unknown>) => {
  return http.get('/front/wallet/bill/page', params)
}

// 获取账单列表
export const getWalletBillList = (params: Record<string, unknown>) => {
  return http.get('/front/bill/queryPage', params)
}

// 获取账单订单明细列表
export const getWalletBillOrderList = (params: Record<string, unknown>) => {
  return http.get('/front/bill/queryBillInfoPage', params)
}

// 获取账单详情
export const getWalletBillDetail = (id: string) => {
  return http.get(`/front/bill/detail?id=${id}`)
}
