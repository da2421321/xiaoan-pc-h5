export interface Response<T = unknown> {
  code: number | string
  message: string
  data: T
}
