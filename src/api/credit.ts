/**
 * 额度管理相关接口
 */
import http from '@/utils/request'

// 获取额度统计信息
export const getCreditStats = () => {
    return http.get('/front/credit/stats')
}

// 获取额度使用记录列表
export const getCreditUsageList = (params: Record<string, unknown>) => {
    return http.get('/front/wallet/credit/record/page', params)
}
//额度
export const getCreditList = (params: Record<string, unknown>) => {
    return http.get('/front/h5/wallet/quotaHistory/page', params)
}
