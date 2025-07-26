"use client"

import { useState } from "react"
import { Download, FileText, FileSpreadsheet, Printer, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Drug {
  id: string
  name: string
  newPrice: number
  oldPrice: number
  priceChange: number
  priceChangePercent: number
  no: string
  updateDate: string
  averageDiscountPercent?: number
}

interface ExportToolsProps {
  drugs: Drug[]
  filteredDrugs: Drug[]
}

interface ExportOptions {
  format: "pdf" | "excel" | "csv"
  scope: "all" | "filtered"
  includeCharts: boolean
  includePriceHistory: boolean
  includeStatistics: boolean
}

export default function ExportTools({ drugs, filteredDrugs }: ExportToolsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "pdf",
    scope: "filtered",
    includeCharts: false,
    includePriceHistory: true,
    includeStatistics: true
  })

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const dataToExport = exportOptions.scope === "all" ? drugs : filteredDrugs
      
      if (dataToExport.length === 0) {
        toast.error("لا توجد بيانات للتصدير")
        return
      }

      switch (exportOptions.format) {
        case "pdf":
          await exportToPDF(dataToExport)
          break
        case "excel":
          await exportToExcel(dataToExport)
          break
        case "csv":
          await exportToCSV(dataToExport)
          break
      }

      toast.success(`تم تصدير ${dataToExport.length} دواء بنجاح`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("حدث خطأ أثناء التصدير")
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPDF = async (data: Drug[]) => {
    // Dynamic import to reduce bundle size
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()
    
    // Set font for Arabic support (if available)
    try {
      doc.setFont("Arial", "normal")
    } catch (e) {
      // Fallback to default font
    }

    // Title
    doc.setFontSize(16)
    doc.text("تقرير أسعار الأدوية", 20, 20)
    
    // Date
    doc.setFontSize(12)
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 20, 30)
    doc.text(`عدد الأدوية: ${data.length}`, 20, 40)

    // Statistics (if enabled)
    if (exportOptions.includeStatistics) {
      const avgPrice = data.reduce((sum, d) => sum + d.newPrice, 0) / data.length
      const priceIncreases = data.filter(d => d.priceChange > 0).length
      const priceDecreases = data.filter(d => d.priceChange < 0).length
      
      doc.text("إحصائيات سريعة:", 20, 55)
      doc.text(`متوسط السعر: ${avgPrice.toFixed(2)} ج.م`, 30, 65)
      doc.text(`أدوية ارتفعت أسعارها: ${priceIncreases}`, 30, 75)
      doc.text(`أدوية انخفضت أسعارها: ${priceDecreases}`, 30, 85)
    }

    // Table
    const tableData = data.map(drug => [
      drug.name,
      `${drug.newPrice.toFixed(2)} ج.م`,
      `${drug.oldPrice.toFixed(2)} ج.م`,
      `${drug.priceChange >= 0 ? '+' : ''}${drug.priceChange.toFixed(2)} ج.م`,
      `${drug.priceChangePercent >= 0 ? '+' : ''}${drug.priceChangePercent.toFixed(1)}%`,
      drug.updateDate
    ])

    autoTable(doc, {
      head: [['اسم الدواء', 'السعر الجديد', 'السعر السابق', 'التغيير', 'النسبة %', 'تاريخ التحديث']],
      body: tableData,
      startY: exportOptions.includeStatistics ? 95 : 55,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    })

    doc.save(`drug-prices-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportToExcel = async (data: Drug[]) => {
    // Create CSV content with proper formatting for Excel
    const headers = ['اسم الدواء', 'السعر الجديد', 'السعر السابق', 'التغيير', 'النسبة %', 'رقم الدواء', 'تاريخ التحديث', 'نسبة الخصم']
    
    const csvContent = [
      headers.join(','),
      ...data.map(drug => [
        `"${drug.name}"`,
        drug.newPrice.toFixed(2),
        drug.oldPrice.toFixed(2),
        drug.priceChange.toFixed(2),
        drug.priceChangePercent.toFixed(1),
        drug.no,
        drug.updateDate,
        drug.averageDiscountPercent?.toFixed(1) || '0'
      ].join(','))
    ].join('\n')

    // Add BOM for proper Arabic display in Excel
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `drug-prices-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportToCSV = async (data: Drug[]) => {
    const headers = ['Drug Name', 'New Price', 'Old Price', 'Price Change', 'Change %', 'Drug No', 'Update Date', 'Discount %']
    
    const csvContent = [
      headers.join(','),
      ...data.map(drug => [
        `"${drug.name}"`,
        drug.newPrice.toFixed(2),
        drug.oldPrice.toFixed(2),
        drug.priceChange.toFixed(2),
        drug.priceChangePercent.toFixed(1),
        drug.no,
        drug.updateDate,
        drug.averageDiscountPercent?.toFixed(1) || '0'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `drug-prices-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const shareData = async () => {
    const dataToShare = exportOptions.scope === "all" ? drugs : filteredDrugs
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'أسعار الأدوية',
          text: `تقرير أسعار ${dataToShare.length} دواء`,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast.success("تم نسخ الرابط")
    }
  }

  const printPage = () => {
    window.print()
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5 text-blue-600" />
          تصدير البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">تنسيق التصدير</Label>
          <Select 
            value={exportOptions.format} 
            onValueChange={(value: any) => setExportOptions({...exportOptions, format: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  PDF Document
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  Excel (CSV)
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  CSV File
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Scope */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">نطاق البيانات</Label>
          <Select 
            value={exportOptions.scope} 
            onValueChange={(value: any) => setExportOptions({...exportOptions, scope: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="filtered">
                البيانات المفلترة حاليًا ({filteredDrugs.length} دواء)
              </SelectItem>
              <SelectItem value="all">
                جميع البيانات ({drugs.length} دواء)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Options (PDF only) */}
        {exportOptions.format === "pdf" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">خيارات إضافية</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-stats"
                  checked={exportOptions.includeStatistics}
                  onCheckedChange={(checked) => 
                    setExportOptions({...exportOptions, includeStatistics: !!checked})
                  }
                />
                <Label htmlFor="include-stats" className="text-sm">
                  تضمين الإحصائيات
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-history"
                  checked={exportOptions.includePriceHistory}
                  onCheckedChange={(checked) => 
                    setExportOptions({...exportOptions, includePriceHistory: !!checked})
                  }
                />
                <Label htmlFor="include-history" className="text-sm">
                  تضمين تاريخ الأسعار
                </Label>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Export Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "جاري التصدير..." : "تصدير"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={printPage}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
        </div>

        <Button 
          variant="outline" 
          onClick={shareData}
          className="w-full flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          مشاركة
        </Button>

        {/* Export Info */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              {exportOptions.scope === "all" ? drugs.length : filteredDrugs.length} دواء
            </Badge>
            <Badge variant="outline" className="text-xs">
              {exportOptions.format.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            سيتم تصدير البيانات بالتنسيق المحدد
          </p>
        </div>
      </CardContent>
    </Card>
  )
}