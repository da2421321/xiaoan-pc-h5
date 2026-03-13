/**
 * 账号管理相关接口
 */
import http from '@/utils/request'

// 获取账号列表
export const getAccountList = (params: Record<string, unknown>) => {
  return http.get('/front/h5/userList', params)
}
// 获取账号详情
export const getAccountDetail = (uid: string) => {
  return http.get(`/front/h5/userDetail?uid=${uid}`)
}
// 新增账号
export const addAccount = (params: Record<string, unknown>) => {
  return http.post('/front/add', params)
}
// 编辑
export const editAccount = (params: Record<string, unknown>) => {
  return http.post('/front/h5/edit', params)
}
// 查询指定额度详情参数
interface QuotaDetailParams {
  uid: number    // 用户Id，必需
  type: 1 | 2    // 1-上调，2-下调，必需
}

// 查询指定额度详情
export const getQuotaDetail = (params: QuotaDetailParams) => {
  return http.get('/front/h5/getAssignCreditDetail', params)
}
// 调整额度参数
interface AdjustQuotaParams {
  uid: number           // 用户ID
  type: 1 | 2           // 类型 1:增加额度，2:减少额度
  addAmount: number     // 调整额度
  remark?: string       // 调整说明
}

// 调整额度
export const adjustQuota = (params: AdjustQuotaParams) => {
  return http.post('/front/h5/updateCredit', params)
}