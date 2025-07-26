"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Percent, Package, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Drug {
  id: string
  name: string
  newPrice: number
  oldPrice: number
  priceChange: number
  priceChangePercent: number
  averageDiscountPercent?: number
}

interface AnalyticsDashboardProps {
  drugs: Drug[]
  criticalShortagesCount: number
}

export default function AnalyticsDashboard({ drugs, criticalShortagesCount }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    if (!drugs || drugs.length === 0) return null

    // Price distribution analysis
    const priceRanges = [
      { range: "0-50 ج.م", min: 0, max: 50, count: 0 },
      { range: "50-100 ج.م", min: 50, max: 100, count: 0 },
      { range: "100-200 ج.م", min: 100, max: 200, count: 0 },
      { range: "200-500 ج.م", min: 200, max: 500, count: 0 },
      { range: "500+ ج.م", min: 500, max: Infinity, count: 0 }
    ]

    drugs.forEach(drug => {
      const range = priceRanges.find(r => drug.newPrice >= r.min && drug.newPrice < r.max)
      if (range) range.count++
    })

    // Price change analysis
    const priceChanges = {
      increased: drugs.filter(d => d.priceChange > 0).length,
      decreased: drugs.filter(d => d.priceChange < 0).length,
      unchanged: drugs.filter(d => d.priceChange === 0).length
    }

    // Discount analysis
    const drugsWithDiscount = drugs.filter(d => d.averageDiscountPercent && d.averageDiscountPercent > 0)
    const averageDiscount = drugsWithDiscount.length > 0 
      ? drugsWithDiscount.reduce((sum, d) => sum + (d.averageDiscountPercent || 0), 0) / drugsWithDiscount.length
      : 0

    // Top price increases and decreases
    const topIncreases = drugs
      .filter(d => d.priceChange > 0)
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, 5)

    const topDecreases = drugs
      .filter(d => d.priceChange < 0)
      .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
      .slice(0, 5)

    // Statistics
    const totalDrugs = drugs.length
    const averagePrice = drugs.reduce((sum, d) => sum + d.newPrice, 0) / totalDrugs
    const medianPrice = [...drugs].sort((a, b) => a.newPrice - b.newPrice)[Math.floor(totalDrugs / 2)]?.newPrice || 0
    const maxPrice = Math.max(...drugs.map(d => d.newPrice))
    const minPrice = Math.min(...drugs.map(d => d.newPrice))

    return {
      priceRanges: priceRanges.filter(r => r.count > 0),
      priceChanges,
      drugsWithDiscount: drugsWithDiscount.length,
      averageDiscount,
      topIncreases,
      topDecreases,
      stats: {
        totalDrugs,
        averagePrice,
        medianPrice,
        maxPrice,
        minPrice
      }
    }
  }, [drugs])

  if (!analytics) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-8 text-center text-gray-500">
          لا توجد بيانات لعرض التحليلات
        </CardContent>
      </Card>
    )
  }

  const priceChangeData = [
    { name: "ارتفع", value: analytics.priceChanges.increased, color: "#ef4444" },
    { name: "انخفض", value: analytics.priceChanges.decreased, color: "#22c55e" },
    { name: "ثابت", value: analytics.priceChanges.unchanged, color: "#6b7280" }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">إجمالي الأدوية</p>
                <p className="text-2xl font-bold text-blue-800">{analytics.stats.totalDrugs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">متوسط السعر</p>
                <p className="text-2xl font-bold text-green-800">{analytics.stats.averagePrice.toFixed(0)} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Percent className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">متوسط الخصم</p>
                <p className="text-2xl font-bold text-purple-800">{analytics.averageDiscount.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-red-600 font-medium">نواقص حرجة</p>
                <p className="text-2xl font-bold text-red-800">{criticalShortagesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution Chart */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">توزيع الأسعار</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.priceRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelStyle={{ direction: 'rtl' }}
                  formatter={(value) => [`${value} دواء`, 'العدد']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Price Change Pie Chart */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">تغييرات الأسعار</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priceChangeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {priceChangeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} دواء`, 'العدد']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Price Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Increases */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-red-600" />
              أكبر الزيادات في الأسعار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topIncreases.map((drug, index) => (
                <div key={drug.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{drug.name}</p>
                      <p className="text-xs text-gray-600">
                        {drug.oldPrice.toFixed(0)} ← {drug.newPrice.toFixed(0)} ج.م
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    +{drug.priceChangePercent.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Decreases */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-green-600" />
              أكبر الانخفاضات في الأسعار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topDecreases.map((drug, index) => (
                <div key={drug.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{drug.name}</p>
                      <p className="text-xs text-gray-600">
                        {drug.oldPrice.toFixed(0)} ← {drug.newPrice.toFixed(0)} ج.م
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {drug.priceChangePercent.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">إحصائيات إضافية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics.stats.medianPrice.toFixed(0)} ج.م</p>
              <p className="text-sm text-gray-600">السعر الوسيط</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{analytics.stats.maxPrice.toFixed(0)} ج.م</p>
              <p className="text-sm text-gray-600">أعلى سعر</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{analytics.stats.minPrice.toFixed(0)} ج.م</p>
              <p className="text-sm text-gray-600">أقل سعر</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{analytics.drugsWithDiscount}</p>
              <p className="text-sm text-gray-600">أدوية عليها خصم</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}