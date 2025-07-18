"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, RefreshCw, Search, Pill, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert" // Import Alert and AlertDescription
import { shortageManager, type Shortage } from "@/lib/shortages"
import Link from "next/link"

export default function ShortagesPage() {
  const [shortages, setShortages] = useState<Shortage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchShortages = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await shortageManager.getShortages()
      // Sort by critical first, then by last update date (newest first)
      const sortedData = data.sort((a, b) => {
        if (a.status === "critical" && b.status !== "critical") return -1
        if (a.status !== "critical" && b.status === "critical") return 1
        return new Date(b.lastUpdateDate).getTime() - new Date(a.lastUpdateDate).getTime()
      })
      setShortages(sortedData)
    } catch (err: any) {
      console.error("Error fetching shortages:", err)
      setError("فشل في تحميل نواقص الأدوية. يرجى المحاولة لاحقاً.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShortages()
  }, [])

  const filteredShortages = shortages.filter(
    (shortage) =>
      shortage.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortage.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadgeClass = (status: Shortage["status"]) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200"
      case "moderate":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusText = (status: Shortage["status"]) => {
    switch (status) {
      case "critical":
        return "حرجة"
      case "moderate":
        return "متوسطة"
      case "resolved":
        return "تم حلها"
      default:
        return "غير معروف"
    }
  }

  const criticalShortagesCount = filteredShortages.filter((s) => s.status === "critical").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <Skeleton className="h-16 w-80 mx-auto mb-4" />
            <Skeleton className="h-8 w-96 mx-auto" />
          </div>
          <Skeleton className="h-12 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center shadow-xl border-red-200 bg-red-50">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">خطأ في التحميل</h2>
          <p className="text-red-700">{error}</p>
          <Link href="/">
            <Button className="mt-6 bg-red-600 hover:bg-red-700">العودة للصفحة الرئيسية</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-red-500 to-orange-600 rounded-full">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              نواقص الأدوية
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            قائمة بالأدوية التي تعاني من نقص في السوق المصري، لمساعدة الصيادلة والمرضى.
          </p>
        </div>

        {/* Critical Shortages Alert */}
        {criticalShortagesCount > 0 && (
          <Alert className="mb-8 border-red-200 bg-red-50 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-semibold text-lg">
              يوجد {criticalShortagesCount} نقص حرج في الأدوية. يرجى مراجعة القائمة أدناه.
            </AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث باسم الدواء أو السبب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    dir="rtl"
                  />
                </div>
              </div>
              <Button onClick={fetchShortages} variant="outline" disabled={loading}>
                <RefreshCw className={`ml-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                تحديث القائمة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shortages List */}
        {filteredShortages.length === 0 ? (
          <Card className="text-center py-12 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent>
              <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نواقص أدوية حالياً</h3>
              <p className="text-gray-500">القائمة محدثة ولا يوجد نقص مسجل.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShortages.map((shortage) => (
              <Card
                key={shortage.id}
                className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-800" dir="rtl">
                      {shortage.drugName}
                    </CardTitle>
                    <Badge variant="outline" className={getStatusBadgeClass(shortage.status)}>
                      {getStatusText(shortage.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-700 text-sm leading-relaxed" dir="rtl">
                    <span className="font-semibold">السبب:</span> {shortage.reason}
                  </p>
                  <div className="text-xs text-gray-500 flex justify-between items-center" dir="rtl">
                    <span>تاريخ الإبلاغ: {new Date(shortage.reportDate).toLocaleDateString("ar-EG")}</span>
                    <span>آخر تحديث: {new Date(shortage.lastUpdateDate).toLocaleDateString("ar-EG")}</span>
                  </div>
                  {shortage.reportedBy && (
                    <div className="text-xs text-gray-500" dir="rtl">
                      تم الإبلاغ بواسطة: {shortage.reportedBy}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button size="lg" variant="outline" className="border-gray-200 hover:bg-blue-50 bg-transparent">
              <ArrowLeft className="ml-2 h-5 w-5" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
