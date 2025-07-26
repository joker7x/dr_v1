"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Zap, Activity } from "lucide-react"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  apiResponseTime: number
  cacheHitRate: number
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show performance metrics only in development or when specifically enabled
    const showMetrics = process.env.NODE_ENV === 'development' || 
                       localStorage.getItem('show-performance') === 'true'
    setIsVisible(showMetrics)

    if (!showMetrics) return

    const startTime = performance.now()
    
    // Measure initial page load performance
    const measurePageLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation?.loadEventEnd - navigation?.navigationStart || 0
      const renderTime = performance.now() - startTime

      setMetrics(prev => ({
        ...prev,
        loadTime: loadTime / 1000,
        renderTime: renderTime / 1000,
        apiResponseTime: prev?.apiResponseTime || 0,
        cacheHitRate: prev?.cacheHitRate || 0
      }))
    }

    // Measure API response times
    const originalFetch = window.fetch
    let apiCalls = 0
    let totalResponseTime = 0
    let cacheHits = 0

    window.fetch = async (...args) => {
      const start = performance.now()
      const response = await originalFetch(...args)
      const end = performance.now()
      
      apiCalls++
      totalResponseTime += (end - start)
      
      // Check if response came from cache
      if (response.headers.get('cf-cache-status') === 'HIT' || 
          response.headers.get('x-cache') === 'HIT') {
        cacheHits++
      }

      setMetrics(prev => ({
        ...prev,
        loadTime: prev?.loadTime || 0,
        renderTime: prev?.renderTime || 0,
        apiResponseTime: totalResponseTime / apiCalls / 1000,
        cacheHitRate: apiCalls > 0 ? (cacheHits / apiCalls) * 100 : 0
      }))

      return response
    }

    // Initial measurement
    if (document.readyState === 'complete') {
      measurePageLoad()
    } else {
      window.addEventListener('load', measurePageLoad)
    }

    return () => {
      window.removeEventListener('load', measurePageLoad)
      window.fetch = originalFetch
    }
  }, [])

  if (!isVisible || !metrics) return null

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return "text-green-600 bg-green-50 border-green-200"
    if (value <= thresholds[1]) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg border-gray-200 bg-white/95 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">مقاييس الأداء</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-500" />
            <span>تحميل الصفحة:</span>
            <Badge 
              variant="outline" 
              className={getPerformanceColor(metrics.loadTime, [2, 5])}
            >
              {metrics.loadTime.toFixed(2)}ث
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-gray-500" />
            <span>العرض:</span>
            <Badge 
              variant="outline" 
              className={getPerformanceColor(metrics.renderTime, [1, 3])}
            >
              {metrics.renderTime.toFixed(2)}ث
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-gray-500" />
            <span>API:</span>
            <Badge 
              variant="outline" 
              className={getPerformanceColor(metrics.apiResponseTime, [0.5, 2])}
            >
              {metrics.apiResponseTime.toFixed(2)}ث
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <span>📦</span>
            <span>كاش:</span>
            <Badge 
              variant="outline" 
              className={getPerformanceColor(100 - metrics.cacheHitRate, [50, 80])}
            >
              {metrics.cacheHitRate.toFixed(0)}%
            </Badge>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.setItem('show-performance', 'false')
            setIsVisible(false)
          }}
          className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      </CardContent>
    </Card>
  )
}