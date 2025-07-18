interface CacheData {
  drugs: any[]
  lastUpdated: string
  timestamp: number
}

const CACHE_KEY = "drugs_cache"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const cacheManager = {
  set: (drugs: any[], lastUpdated: string) => {
    const cacheData: CacheData = {
      drugs,
      lastUpdated,
      timestamp: Date.now(),
    }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn("Failed to cache data:", error)
    }
  },

  get: (): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const cacheData: CacheData = JSON.parse(cached)
      const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION

      if (isExpired) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return cacheData
    } catch (error) {
      console.warn("Failed to get cached data:", error)
      localStorage.removeItem(CACHE_KEY)
      return null
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (error) {
      console.warn("Failed to clear cache:", error)
    }
  },
}
