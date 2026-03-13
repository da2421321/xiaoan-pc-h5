/**
 * 数据统计相关接口
 */
import http from '@/utils/request'

// 获取数据概览
export const getDataOverview = () => {
  return http.get('/front/stat/getMonthsStat')
}

// 获取待办事项数量
export const getTodoCount = () => {
  return http.get('/front/xa/order/get/unConfirmStat')
}
