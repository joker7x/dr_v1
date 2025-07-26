"use client"

import { useState } from "react"
import { Filter, X, Search, DollarSign, Percent, Pill } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

export interface SearchFilters {
  searchTerm: string
  priceRange: [number, number]
  priceChangeFilter: "all" | "increased" | "decreased" | "unchanged"
  hasDiscount: boolean
  discountRange: [number, number]
  sortBy: "original" | "name" | "price" | "change" | "discount"
  sortOrder: "asc" | "desc"
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  drugCount: number
  maxPrice: number
}

export default function AdvancedSearchFilters({ 
  filters, 
  onFiltersChange, 
  drugCount, 
  maxPrice 
}: AdvancedSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = <K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      priceRange: [0, maxPrice],
      priceChangeFilter: "all",
      hasDiscount: false,
      discountRange: [0, 100],
      sortBy: "original",
      sortOrder: "asc"
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++
    if (filters.priceChangeFilter !== "all") count++
    if (filters.hasDiscount) count++
    if (filters.sortBy !== "original") count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card className="border-gray-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-blue-600" />
            البحث والتصفية المتقدمة
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} مرشح نشط
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {drugCount} دواء
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Basic Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث عن اسم الدواء..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            className="pl-10 text-right"
            dir="rtl"
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {/* Price Range Filter */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-green-600" />
              نطاق السعر (ج.م)
            </Label>
            <div className="px-3">
              <Slider
                min={0}
                max={maxPrice}
                step={10}
                value={filters.priceRange}
                onValueChange={(value) => handleFilterChange("priceRange", value as [number, number])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{filters.priceRange[0]} ج.م</span>
                <span>{filters.priceRange[1]} ج.م</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Price Change Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">تغيير السعر</Label>
            <Select 
              value={filters.priceChangeFilter} 
              onValueChange={(value: any) => handleFilterChange("priceChangeFilter", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التغيير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوية</SelectItem>
                <SelectItem value="increased">ارتفع السعر</SelectItem>
                <SelectItem value="decreased">انخفض السعر</SelectItem>
                <SelectItem value="unchanged">لم يتغير السعر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Discount Filter */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-discount"
                checked={filters.hasDiscount}
                onCheckedChange={(checked) => handleFilterChange("hasDiscount", !!checked)}
              />
              <Label htmlFor="has-discount" className="flex items-center gap-2 text-sm font-medium">
                <Percent className="h-4 w-4 text-purple-600" />
                الأدوية التي عليها خصم فقط
              </Label>
            </div>
            
            {filters.hasDiscount && (
              <div className="px-3">
                <Label className="text-sm text-gray-600 mb-2 block">نطاق الخصم (%)</Label>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={filters.discountRange}
                  onValueChange={(value) => handleFilterChange("discountRange", value as [number, number])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>%{filters.discountRange[0]}</span>
                  <span>%{filters.discountRange[1]}</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Sorting */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">ترتيب حسب</Label>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value: any) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">الترتيب الأصلي</SelectItem>
                  <SelectItem value="name">اسم الدواء</SelectItem>
                  <SelectItem value="price">السعر</SelectItem>
                  <SelectItem value="change">تغيير السعر</SelectItem>
                  <SelectItem value="discount">نسبة الخصم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">الاتجاه</Label>
              <Select 
                value={filters.sortOrder} 
                onValueChange={(value: any) => handleFilterChange("sortOrder", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">تصاعدي</SelectItem>
                  <SelectItem value="desc">تنازلي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              مسح جميع المرشحات
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}