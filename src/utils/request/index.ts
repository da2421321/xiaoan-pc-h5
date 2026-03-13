import service, { AxiosRequestConfig } from './axios'
export * from './types'

export const request = async <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
  const res = await service.request<T>(config)
  return res.data
}

const http = {
  get<T = unknown>(url: string, params = {}, config?: AxiosRequestConfig): Promise<T> {
    return request({ url, params, ...config, method: 'GET' })
  },
  post<T = unknown>(url: string, data = {}, config?: AxiosRequestConfig): Promise<T> {
    return request({ url, data, ...config, method: 'POST' })
  },
  put<T = unknown>(url: string, data = {}, config?: AxiosRequestConfig): Promise<T> {
    return request({ url, data, ...config, method: 'PUT' })
  },
  delete<T = unknown>(url: string, data = {}, config?: AxiosRequestConfig): Promise<T> {
    return request({ url, data, ...config, method: 'DELETE' })
  },
  // 上传文件，指定 'Content-Type': 'multipart/form-data'
  upload<T = unknown>(url: string, data = {}, config?: AxiosRequestConfig): Promise<T> {
    return request({
      url,
      data,
      ...config,
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default http
