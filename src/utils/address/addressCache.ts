import { getServiceAddress } from '@/api'

interface CityData {
  id: number
  cityId: number
  parentId: number
  name: string
  mergerName: string
  child?: CityData[]
}

interface CacheData {
  data: CityData[]
  timestamp: number
  expiresIn: number // 缓存过期时间（毫秒）
}

class AddressCache {
  private cacheKey = 'address_cache'
  private defaultExpiresIn = 30 * 60 * 1000 // 默认30分钟过期

  /**
   * 获取缓存的地址数据
   */
  getCachedData(): CityData[] | null {
    try {
      const cached = localStorage.getItem(this.cacheKey)
      if (!cached) return null

      const cacheData: CacheData = JSON.parse(cached)
      const now = Date.now()

      // 检查是否过期
      if (now - cacheData.timestamp > cacheData.expiresIn) {
        this.clearCache()
        return null
      }

      return cacheData.data
    } catch (error) {
      console.error('读取地址缓存失败:', error)
      this.clearCache()
      return null
    }
  }

  /**
   * 设置地址数据到缓存
   */
  setCachedData(data: CityData[], expiresIn?: number): void {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        expiresIn: expiresIn || this.defaultExpiresIn,
      }
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error('设置地址缓存失败:', error)
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey)
    } catch (error) {
      console.error('清除地址缓存失败:', error)
    }
  }

  /**
   * 获取地址数据（优先从缓存获取，缓存不存在或过期时从接口获取）
   */
  async getAddressData(forceRefresh = false): Promise<CityData[]> {
    // 如果强制刷新，直接清除缓存
    if (forceRefresh) {
      this.clearCache()
    }

    // 尝试从缓存获取
    const cachedData = this.getCachedData()
    if (cachedData && !forceRefresh) {
      console.log('从缓存获取地址数据')
      return cachedData
    }

    // 缓存不存在或已过期，从接口获取
    console.log('从接口获取地址数据')
    try {
      const res = await getServiceAddress()
      if (res.code === '200' && res.data) {
        // 将数据存入缓存
        this.setCachedData(res.data)
        return res.data
      } else {
        throw new Error('获取地址数据失败')
      }
    } catch (error) {
      console.error('获取地址数据失败:', error)
      throw error
    }
  }

  /**
   * 检查缓存是否存在且未过期
   */
  hasValidCache(): boolean {
    return this.getCachedData() !== null
  }

  /**
   * 获取缓存剩余时间（毫秒）
   */
  getCacheRemainingTime(): number {
    try {
      const cached = localStorage.getItem(this.cacheKey)
      if (!cached) return 0

      const cacheData: CacheData = JSON.parse(cached)
      const now = Date.now()
      const remaining = cacheData.expiresIn - (now - cacheData.timestamp)

      return Math.max(0, remaining)
    } catch (error) {
      console.error('获取缓存剩余时间失败:', error)
      return 0
    }
  }

  /**
   * 格式化缓存剩余时间
   */
  getFormattedCacheTime(): string {
    const remaining = this.getCacheRemainingTime()
    if (remaining <= 0) return '已过期'

    const minutes = Math.floor(remaining / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    if (minutes > 0) {
      return `${minutes}分${seconds}秒`
    } else {
      return `${seconds}秒`
    }
  }
}

// 创建单例实例
export const addressCache = new AddressCache()

// 导出类型
export type { CacheData, CityData }
