/**
 * 通用接口 - 文件上传、地址、字典等
 */
import http from '@/utils/request'

// 文件上传
export const uploadFile = (data: FormData) => {
  return http.post('/file/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 获取服务地址（城市列表）
export const getServiceAddress = () => {
  return http.get('/front/city/list')
}

// 获取字典列表
export const getDistrictList = () => {
  return http.get(`/dict/list?dictTypeCode=CourierCompany`)
}

// 获取协议内容
export const getAgreement = (data: Record<string, unknown>) => {
  return http.get('/app/article/query', data)
}
