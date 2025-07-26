"use client"

import { useState, useRef } from "react"
import { 
  Upload, 
  Download, 
  Database, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  File,
  BarChart3,
  Settings,
  Trash2,
  Edit,
  Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { dataImportManager, type ImportResult, type DrugData } from "@/lib/data-import"

export default function DataManagementPage() {
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Import from file
  const handleFileImport = async () => {
    if (!selectedFile) {
      toast.error("يرجى اختيار ملف للاستيراد")
      return
    }

    setIsImporting(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      let result: ImportResult
      
      if (selectedFile.name.endsWith('.csv')) {
        // Handle CSV import
        const csvText = await selectedFile.text()
        const validation = dataImportManager.validateCSV(csvText)
        
        if (!validation.valid) {
          setImportResult({
            success: false,
            message: "ملف CSV غير صالح",
            importedCount: 0,
            errorCount: validation.errors.length,
            errors: validation.errors
          })
          return
        }
        
        const jsonData = dataImportManager.csvToJson(csvText)
        result = await dataImportManager.importFromFile(
          new File([JSON.stringify(jsonData)], 'converted.json', { type: 'application/json' })
        )
      } else {
        // Handle JSON import
        result = await dataImportManager.importFromFile(selectedFile)
      }

      clearInterval(progressInterval)
      setUploadProgress(100)
      setImportResult(result)
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: "خطأ في عملية الاستيراد",
        importedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : "خطأ غير معروف"]
      })
      toast.error("فشل في استيراد البيانات")
    } finally {
      setIsImporting(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  // Import from Firebase
  const handleFirebaseSync = async () => {
    setIsSyncing(true)
    try {
      const result = await dataImportManager.importFromFirebase()
      setImportResult(result)
      
      if (result.success) {
        toast.success("تم مزامنة البيانات من Firebase بنجاح")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("فشل في مزامنة البيانات")
    } finally {
      setIsSyncing(false)
    }
  }

  // Export data
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await dataImportManager.exportToFile()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `drugs-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success("تم تصدير البيانات بنجاح")
    } catch (error) {
      toast.error("فشل في تصدير البيانات")
    } finally {
      setIsExporting(false)
    }
  }

  // File selection handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validTypes = ['application/json', 'text/csv', '.json', '.csv']
      const isValid = validTypes.some(type => 
        file.type === type || file.name.toLowerCase().endsWith(type.replace('.', ''))
      )
      
      if (isValid) {
        setSelectedFile(file)
        setImportResult(null)
      } else {
        toast.error("نوع الملف غير مدعوم. يرجى اختيار ملف JSON أو CSV")
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة البيانات</h1>
        <p className="text-gray-600">استيراد وتصدير بيانات الأدوية وإدارة المعلومات التفصيلية</p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import">استيراد البيانات</TabsTrigger>
          <TabsTrigger value="export">تصدير البيانات</TabsTrigger>
          <TabsTrigger value="sync">المزامنة</TabsTrigger>
          <TabsTrigger value="manage">إدارة الأدوية</TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                استيراد بيانات الأدوية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload" className="text-sm font-medium">
                    اختر ملف البيانات
                  </Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <File className="h-4 w-4" />
                      اختيار ملف
                    </Button>
                    {selectedFile && (
                      <Badge variant="outline" className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {selectedFile.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Import Mode */}
                <div>
                  <Label className="text-sm font-medium">وضع الاستيراد</Label>
                  <Select value={importMode} onValueChange={(value: any) => setImportMode(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replace">استبدال البيانات الحالية</SelectItem>
                      <SelectItem value="merge">دمج مع البيانات الحالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Progress Bar */}
                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>جاري الاستيراد...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {/* Import Button */}
                <Button
                  onClick={handleFileImport}
                  disabled={!selectedFile || isImporting}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري الاستيراد...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      استيراد البيانات
                    </>
                  )}
                </Button>
              </div>

              {/* Import Result */}
              {importResult && (
                <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={importResult.success ? "text-green-800" : "text-red-800"}>
                    <div className="space-y-2">
                      <p className="font-medium">{importResult.message}</p>
                      {importResult.importedCount > 0 && (
                        <p>تم استيراد {importResult.importedCount} دواء</p>
                      )}
                      {importResult.errorCount > 0 && (
                        <p>عدد الأخطاء: {importResult.errorCount}</p>
                      )}
                      {importResult.errors.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">عرض الأخطاء</summary>
                          <ul className="mt-2 text-sm list-disc list-inside">
                            {importResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Format Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">تنسيق الملفات المدعومة:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>JSON:</strong> ملف JSON يحتوي على بيانات الأدوية</li>
                  <li><strong>CSV:</strong> ملف CSV مع الأعمدة المطلوبة: name, newPrice, oldPrice</li>
                  <li><strong>الأعمدة الاختيارية:</strong> manufacturer, category, description, dosage, sideEffects</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                تصدير بيانات الأدوية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                تصدير جميع بيانات الأدوية الحالية بتنسيق JSON للنسخ الاحتياطي أو النقل
              </p>
              
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    تصدير البيانات
                  </>
                )}
              </Button>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">معلومات التصدير:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• يتم تصدير جميع البيانات بتنسيق JSON</li>
                  <li>• يتضمن التصدير تاريخ الإنشاء وعدد الأدوية</li>
                  <li>• يمكن استخدام الملف المصدر للاستيراد لاحقاً</li>
                  <li>• يحتوي على جميع المعلومات التفصيلية للأدوية</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                مزامنة البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                مزامنة البيانات من Firebase أو مصادر خارجية في الخلفية
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleFirebaseSync}
                  disabled={isSyncing}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  {isSyncing ? (
                    <RefreshCw className="h-6 w-6 mb-2 animate-spin" />
                  ) : (
                    <Database className="h-6 w-6 mb-2" />
                  )}
                  <span>مزامنة من Firebase</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  disabled
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>مزامنة من API خارجي</span>
                  <span className="text-xs text-gray-500">(قريباً)</span>
                </Button>
              </div>

              <Separator />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">ملاحظات المزامنة:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• المزامنة تتم في الخلفية دون تأثير على المستخدمين</li>
                  <li>• يتم الاحتفاظ بنسخة احتياطية قبل المزامنة</li>
                  <li>• المزامنة الآلية تحدث كل 6 ساعات</li>
                  <li>• يمكن جدولة المزامنة لأوقات محددة</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drug Management Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                إدارة الأدوية المتقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                إدارة المعلومات التفصيلية للأدوية وإضافة معلومات جديدة
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex-col">
                      <Plus className="h-6 w-6 mb-2" />
                      <span>إضافة دواء جديد</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>إضافة دواء جديد</DialogTitle>
                    </DialogHeader>
                    <AddDrugForm />
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="h-20 flex-col">
                  <Edit className="h-6 w-6 mb-2" />
                  <span>تعديل معلومات الأدوية</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-6 w-6 mb-2" />
                  <span>حذف الأدوية</span>
                </Button>
              </div>

              <Separator />

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">المعلومات التفصيلية المدعومة:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-800">
                  <div>• اسم الشركة المصنعة</div>
                  <div>• فئة الدواء</div>
                  <div>• وصف مفصل</div>
                  <div>• طريقة الاستخدام</div>
                  <div>• الآثار الجانبية</div>
                  <div>• موانع الاستعمال</div>
                  <div>• التفاعلات الدوائية</div>
                  <div>• شروط التخزين</div>
                  <div>• تحذيرات انتهاء الصلاحية</div>
                  <div>• رمز شريطي</div>
                  <div>• صورة المنتج</div>
                  <div>• ملاحظات الصيدلية</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Add Drug Form Component
function AddDrugForm() {
  const [formData, setFormData] = useState({
    name: '',
    newPrice: '',
    oldPrice: '',
    manufacturer: '',
    category: '',
    description: '',
    dosage: '',
    sideEffects: '',
    contraindications: '',
    interactions: '',
    storageConditions: '',
    activeIngredient: '',
    barcode: '',
    imageUrl: '',
    pharmacyNotes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const drugData = {
        ...formData,
        newPrice: parseFloat(formData.newPrice) || 0,
        oldPrice: parseFloat(formData.oldPrice) || 0,
        no: Date.now().toString(),
        updateDate: new Date().toLocaleDateString('ar-EG'),
        priceChange: (parseFloat(formData.newPrice) || 0) - (parseFloat(formData.oldPrice) || 0),
        priceChangePercent: parseFloat(formData.oldPrice) > 0 
          ? (((parseFloat(formData.newPrice) || 0) - (parseFloat(formData.oldPrice) || 0)) / (parseFloat(formData.oldPrice) || 0)) * 100 
          : 0,
        originalOrder: 0,
        isAvailable: true
      }

      const result = await dataImportManager.addDrug(drugData)
      
      if (result) {
        toast.success("تم إضافة الدواء بنجاح")
        // Reset form
        setFormData({
          name: '', newPrice: '', oldPrice: '', manufacturer: '', category: '',
          description: '', dosage: '', sideEffects: '', contraindications: '',
          interactions: '', storageConditions: '', activeIngredient: '',
          barcode: '', imageUrl: '', pharmacyNotes: ''
        })
      } else {
        toast.error("فشل في إضافة الدواء")
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة الدواء")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">اسم الدواء *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="manufacturer">الشركة المصنعة</Label>
          <Input
            id="manufacturer"
            value={formData.manufacturer}
            onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="newPrice">السعر الحالي *</Label>
          <Input
            id="newPrice"
            type="number"
            step="0.01"
            value={formData.newPrice}
            onChange={(e) => setFormData({...formData, newPrice: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="oldPrice">السعر السابق</Label>
          <Input
            id="oldPrice"
            type="number"
            step="0.01"
            value={formData.oldPrice}
            onChange={(e) => setFormData({...formData, oldPrice: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="category">الفئة</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="antibiotics">مضادات حيوية</SelectItem>
              <SelectItem value="painkillers">مسكنات</SelectItem>
              <SelectItem value="vitamins">فيتامينات</SelectItem>
              <SelectItem value="heart">أدوية القلب</SelectItem>
              <SelectItem value="diabetes">أدوية السكري</SelectItem>
              <SelectItem value="respiratory">أدوية الجهاز التنفسي</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="activeIngredient">المادة الفعالة</Label>
          <Input
            id="activeIngredient"
            value={formData.activeIngredient}
            onChange={(e) => setFormData({...formData, activeIngredient: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="dosage">طريقة الاستخدام والجرعة</Label>
        <Textarea
          id="dosage"
          value={formData.dosage}
          onChange={(e) => setFormData({...formData, dosage: e.target.value})}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sideEffects">الآثار الجانبية</Label>
          <Textarea
            id="sideEffects"
            value={formData.sideEffects}
            onChange={(e) => setFormData({...formData, sideEffects: e.target.value})}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="contraindications">موانع الاستعمال</Label>
          <Textarea
            id="contraindications"
            value={formData.contraindications}
            onChange={(e) => setFormData({...formData, contraindications: e.target.value})}
            rows={3}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        إضافة الدواء
      </Button>
    </form>
  )
}