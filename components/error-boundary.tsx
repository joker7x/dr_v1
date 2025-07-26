"use client"

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // Report error to analytics or error reporting service
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, you would send this to an error reporting service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // For now, just log to localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      existingErrors.push(errorReport)
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10)
      }
      localStorage.setItem('app_errors', JSON.stringify(existingErrors))
    } catch (e) {
      console.error('Failed to save error report:', e)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private sendErrorReport = () => {
    const { error, errorInfo } = this.state
    if (!error) return

    const subject = encodeURIComponent('تقرير خطأ من تطبيق أسعار الأدوية')
    const body = encodeURIComponent(`
تفاصيل الخطأ:
- الرسالة: ${error.message}
- المتصفح: ${navigator.userAgent}
- الصفحة: ${window.location.href}
- الوقت: ${new Date().toISOString()}

Stack Trace:
${error.stack}

Component Stack:
${errorInfo?.componentStack || 'غير متوفر'}
    `)

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-xl border-red-200">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-800 mb-2">
                حدث خطأ غير متوقع
              </CardTitle>
              <p className="text-gray-600">
                نعتذر، حدثت مشكلة أثناء تشغيل التطبيق
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details */}
              <Alert className="border-red-200 bg-red-50">
                <Bug className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>تفاصيل الخطأ:</strong> {this.state.error?.message || 'خطأ غير معروف'}
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة المحاولة
                </Button>

                <Button
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة تحميل الصفحة
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Home className="h-4 w-4" />
                  العودة للرئيسية
                </Button>
              </div>

              {/* Additional Help */}
              <div className="text-center space-y-3 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  إذا استمر الخطأ، يمكنك:
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={this.sendErrorReport}
                    variant="link"
                    size="sm"
                    className="text-blue-600"
                  >
                    إرسال تقرير الخطأ
                  </Button>
                  
                  <Button
                    onClick={() => {
                      localStorage.clear()
                      window.location.reload()
                    }}
                    variant="link"
                    size="sm"
                    className="text-blue-600"
                  >
                    مسح البيانات المؤقتة
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  كود الخطأ: {this.state.error?.name || 'ERR_UNKNOWN'}
                </p>
              </div>

              {/* Developer Info (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-gray-100 p-3 rounded border">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    تفاصيل المطور
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-600 mb-2">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap text-orange-600">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary