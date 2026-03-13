/**
 * 订单相关接口
 */
import http from '@/utils/request'

// 预提交订单
export const submitOrder = (data: Record<string, unknown>) => {
  return http.post('/front/xa/order/pre/order', data)
}

// 创建订单
export const createOrder = (data: Record<string, unknown>) => {
  return http.post('/front/xa/order/create', data)
}

// 获取订单列表
export const getOrderList = (params: Record<string, unknown>) => {
  return http.get('/front/xa/order/h5/list', params)
}

// 获取订单详情
export const getOrderDetail = (id: string) => {
  return http.get(`/front/xa/order/detail?orderId=${id}`)
}

// 获取订单清单
export const getOrderListItems = (id: string) => {
  return http.get(`/front/xa/order/detail/items?id=${id}`)
}

// 获取订单轨迹
export const getOrderLogistics = (orderId: string) => {
  return http.get(`/front/xa/order/logistics?orderId=${orderId}`)
}

// 获取订单交付信息
export const getOrderDelivery = (orderId: string) => {
  return http.get(`/front/work/getShowWorkContent?orderId=${orderId}`)
}

// 获取物流信息
export const getLogistics = (orderId: string) => {
  return http.get(`/front/xa/order/detail/wuliu?orderId=${orderId}`)
}

// 获取物流公司列表
export const getLogisticsCompany = (CourierCompany: string) => {
  return http.get(`/front/user/getDictListByCode?dictCode=${CourierCompany}`)
}
//物流查询
export const getLogisticsQuery = (data: Record<string, unknown>) => {
  return http.get('/front/xa/order/wuliu/detail', data)
}
// 待确认工单更新
export const getworkConfirm = () => {
  return http.get('/front/xa/order/update/workConfirm')
}

// 待增补更新
export const getsupplementConfirm = () => {
  return http.get('/front/xa/order/update/supplementConfirm')
}

// 下载批量下单模板
export const getTemplateFile = (type: string) => {
  return http.get(`/front/xa/order/getTemplateFile?type=${type}`)
}

// 上传批量下单文件
export const uploadOrderFile = (data: FormData) => {
  return http.upload('/front/xa/order/upload', data)
}

// 批量下单
export const batchOrder = (data: unknown) => {
  return http.post('/front/xa/order/batchOrder', data as Record<string, unknown>)
}
//获取订单工作流
export const getOrderWorkflow = (orderId: string) => {
  return http.get(`/front/xa/order/flowList?orderId=${orderId}`)
}
//地址解析
export const getSmartAddress = (address: string) => {
  return http.get(`/front/xa/order/resolut/address?address=${address}`)
}
//工作台订单支付信息
export const getOrderPayInfo = () => {
  return http.get('/front/xa/order/workbench/payInfo')
}
//订单数量统计
export const getOrderCount = () => {
  return http.get('/front/xa/order/h5/orderCount')
}

