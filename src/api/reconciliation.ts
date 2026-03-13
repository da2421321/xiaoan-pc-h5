/**
 * 对账管理相关接口
 */
import http from '@/utils/request'

// 获取对账单列表
export const getReconciliationList = (params: Record<string, unknown>) => {
  return http.get('/front/bill/queryPage', params)
}

//账单订单明细列表
export const getReconciliationOrderList = (id: number | string) => {
  return http.get(`/front/bill/queryBillInfoPage?id=${id}`)
}


//账单详情
export const getReconciliationDetail = (id: number | string) => {
  return http.get(`/front/bill/detail?id=${id}`)
}
//费用存疑
export const getReconciliationSuspicious = (params: Record<string, unknown>) => {
  return http.post('/front/bill/feedback', params)
}
//回复反馈信息
export const getReconciliationReply = (params: Record<string, unknown>) => {
  return http.post('/front/bill/addMsg', params)
}
//确认账单
export const getReconciliationConfirm = (id: number | string) => {
  return http.post('/front/bill/confirmBill', { id })
}
//上传支付凭证
export const getReconciliationUpload = (params: Record<string, unknown>) => {
  return http.post('/front/bill/addPaycert', params)
}

