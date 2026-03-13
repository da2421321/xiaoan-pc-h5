/**
 * 项目相关接口
 */
import http from '@/utils/request'
import { useUserStore } from '@/stores/user'

// 获取项目列表
export const getProjectList = () => {
  const userStore = useUserStore()
  const bodyId = userStore.userInfo.bodyId
  const params = bodyId ? `?limit=0&bodyId=${bodyId}` : '?limit=0'
  return http.get(`/front/project/list${params}`)
}

// 获取项目详情（类型列表）
export const getProjectDetail = (id: string) => {
  return http.get(`/front/project/type/list?projectId=${id}`)
}

// 获取模板详情
export const getTemplateDetail = (id: string) => {
  return http.get(`/front/order/template/items?templateId=${id}`)
}
