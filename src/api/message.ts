/**
 * 消息中心相关接口
 */
import http from '@/utils/request'

// 获取消息列表
export const getMessageList = (params: Record<string, unknown>) => {
  return http.get('/front/message/list', params)
}

// 获取消息详情
export const getMessageDetail = (id: string) => {
  return http.get(`/front/message/detail?id=${id}`)
}

// 设置消息已读
export const setMessageRead = (params: Record<string, unknown>) => {
  return http.post('/front/message/setRead', params)
}

// 设置全部消息已读
export const setAllMessageRead = () => {
  return http.post('/front/message/setTotalRead')
}

//未读消息数量
export const getUnreadMessageCount = () => {
  return http.get('/front/message/readCount')
}
