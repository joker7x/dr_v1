"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Pill, 
  Building2, 
  Info, 
  AlertTriangle, 
  Shield, 
  Thermometer,
  Calendar,
  Barcode,
  Camera,
  TrendingUp,
  TrendingDown,
  Star,
  MapPin,
  Phone,
  ExternalLink,
  Share2,
  Heart,
  Bookmark,
  Clock
} from "lucide-react"
import { toast } from "sonner"
import { dataImportManager, type DrugData } from "@/lib/data-import"

interface EnhancedDrug {
  id: string
  name: string
  newPrice: number
  oldPrice: number
  no: string
  updateDate: string
  priceChange: number
  priceChangePercent: number
  originalOrder: number
  activeIngredient?: string
  averageDiscountPercent?: number
  // Enhanced fields
  manufacturer?: string
  category?: string
  description?: string
  dosage?: string
  sideEffects?: string
  contraindications?: string
  interactions?: string
  storageConditions?: string
  expiryWarning?: number
  imageUrl?: string
  barcode?: string
  isAvailable?: boolean
  pharmacyNotes?: string
  lastModified?: string
}

interface EnhancedDrugDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  drug: EnhancedDrug | null
}

export default function EnhancedDrugDetailsModal({ 
  isOpen, 
  onClose, 
  drug 
}: EnhancedDrugDetailsModalProps) {
  const [drugDetails, setDrugDetails] = useState<EnhancedDrug | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Load additional drug details when modal opens
  useEffect(() => {
    if (drug && isOpen) {
      loadDrugDetails(drug.id)
      checkFavoriteStatus(drug.id)
    }
  }, [drug, isOpen])

  const loadDrugDetails = async (drugId: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from the API
      // For now, we'll use the existing drug data
      setDrugDetails(drug)
    } catch (error) {
      console.error('Error loading drug details:', error)
      toast.error("فشل في تحميل تفاصيل الدواء")
    } finally {
      setIsLoading(false)
    }
  }

  const checkFavoriteStatus = (drugId: string) => {
    const favorites = JSON.parse(localStorage.getItem('favorite_drugs') || '[]')
    setIsFavorite(favorites.includes(drugId))
  }

  const toggleFavorite = () => {
    if (!drug) return
    
    const favorites = JSON.parse(localStorage.getItem('favorite_drugs') || '[]')
    let newFavorites
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== drug.id)
      toast.success("تم إزالة الدواء من المفضلة")
    } else {
      newFavorites = [...favorites, drug.id]
      toast.success("تم إضافة الدواء للمفضلة")
    }
    
    localStorage.setItem('favorite_drugs', JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  const shareDrug = async () => {
    if (!drug) return
    
    const shareData = {
      title: `معلومات دواء ${drug.name}`,
      text: `${drug.name} - السعر: ${drug.newPrice.toFixed(2)} ج.م`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`
      await navigator.clipboard.writeText(text)
      toast.success("تم نسخ معلومات الدواء")
    }
  }

  const searchNearbyPharmacies = () => {
    if (!drug) return
    
    // Open Google Maps search for nearby pharmacies
    const query = encodeURIComponent(`صيدليات قريبة مني ${drug.name}`)
    const mapsUrl = `https://www.google.com/maps/search/${query}`
    window.open(mapsUrl, '_blank')
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ج.م`
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-red-600 bg-red-50 border-red-200"
    if (change < 0) return "text-green-600 bg-green-50 border-green-200"
    return "text-gray-600 bg-gray-50 border-gray-200"
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'antibiotics': return '🦠'
      case 'painkillers': return '💊'
      case 'vitamins': return '🌟'
      case 'heart': return '❤️'
      case 'diabetes': return '🩺'
      case 'respiratory': return '🫁'
      default: return '💊'
    }
  }

  const getCategoryName = (category?: string) => {
    const categories: Record<string, string> = {
      'antibiotics': 'مضادات حيوية',
      'painkillers': 'مسكنات',
      'vitamins': 'فيتامينات',
      'heart': 'أدوية القلب',
      'diabetes': 'أدوية السكري',
      'respiratory': 'أدوية الجهاز التنفسي'
    }
    return categories[category || ''] || 'أخرى'
  }

  if (!drug) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {drug.name}
              </DialogTitle>
              <DialogDescription>
                {drug.activeIngredient && (
                  <span className="text-gray-600">المادة الفعالة: {drug.activeIngredient}</span>
                )}
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className={isFavorite ? "text-red-600" : "text-gray-400"}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareDrug}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] overflow-auto">
          <div className="space-y-6">
            {/* Price Information Card */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 font-medium">السعر الحالي</p>
                    <p className="text-2xl font-bold text-blue-800">{formatPrice(drug.newPrice)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-medium">السعر السابق</p>
                    <p className="text-lg font-medium text-gray-700">{formatPrice(drug.oldPrice)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-medium">التغيير</p>
                    <div className="flex items-center justify-center gap-1">
                      {drug.priceChange > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : drug.priceChange < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : null}
                      <span className={drug.priceChange >= 0 ? "text-red-600" : "text-green-600"}>
                        {drug.priceChange >= 0 ? "+" : ""}{drug.priceChangePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  {drug.averageDiscountPercent && drug.averageDiscountPercent > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-purple-600 font-medium">متوسط الخصم</p>
                      <p className="text-lg font-bold text-purple-700">{drug.averageDiscountPercent.toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drug.manufacturer && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">الشركة المصنعة</p>
                        <p className="font-medium">{drug.manufacturer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {drug.category && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(drug.category)}</span>
                      <div>
                        <p className="text-sm text-gray-600">الفئة</p>
                        <p className="font-medium">{getCategoryName(drug.category)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {drug.barcode && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Barcode className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">الرمز الشريطي</p>
                        <p className="font-mono text-sm">{drug.barcode}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">آخر تحديث</p>
                      <p className="font-medium">{drug.updateDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">الوصف</TabsTrigger>
                <TabsTrigger value="usage">الاستخدام</TabsTrigger>
                <TabsTrigger value="warnings">تحذيرات</TabsTrigger>
                <TabsTrigger value="storage">التخزين</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                {drug.description ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="h-5 w-5" />
                        وصف الدواء
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{drug.description}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد معلومات وصفية متاحة حالياً</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="usage" className="space-y-4">
                {drug.dosage ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Pill className="h-5 w-5 text-blue-600" />
                        طريقة الاستخدام والجرعة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed">{drug.dosage}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد معلومات عن طريقة الاستخدام متاحة حالياً</p>
                      <p className="text-sm text-amber-600 mt-2">يرجى استشارة الطبيب أو الصيدلي</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="warnings" className="space-y-4">
                <div className="grid gap-4">
                  {drug.sideEffects && (
                    <Card className="border-orange-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
                          <AlertTriangle className="h-5 w-5" />
                          الآثار الجانبية
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <p className="text-gray-700">{drug.sideEffects}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {drug.contraindications && (
                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                          <Shield className="h-5 w-5" />
                          موانع الاستعمال
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-gray-700">{drug.contraindications}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {drug.interactions && (
                    <Card className="border-purple-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-purple-700">
                          <AlertTriangle className="h-5 w-5" />
                          التفاعلات الدوائية
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-gray-700">{drug.interactions}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!drug.sideEffects && !drug.contraindications && !drug.interactions && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد معلومات تحذيرية متاحة حالياً</p>
                        <p className="text-sm text-amber-600 mt-2">يرجى استشارة الطبيب قبل الاستخدام</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="storage" className="space-y-4">
                {drug.storageConditions ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Thermometer className="h-5 w-5 text-blue-600" />
                        شروط التخزين
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed">{drug.storageConditions}</p>
                      </div>
                      
                      {drug.expiryWarning && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-amber-700">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">تحذير انتهاء الصلاحية</span>
                          </div>
                          <p className="text-sm text-amber-600 mt-1">
                            يرجى التحقق من تاريخ انتهاء الصلاحية قبل الاستخدام
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Thermometer className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد معلومات عن شروط التخزين متاحة حالياً</p>
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>نصائح عامة للتخزين:</strong><br />
                          • احفظ الدواء في مكان بارد وجاف<br />
                          • تجنب أشعة الشمس المباشرة<br />
                          • احتفظ بالدواء في عبوته الأصلية
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Pharmacy Notes */}
            {drug.pharmacyNotes && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                    <MapPin className="h-5 w-5" />
                    ملاحظات الصيدلية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-800">{drug.pharmacyNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button
                onClick={searchNearbyPharmacies}
                className="flex items-center gap-2"
                variant="outline"
              >
                <MapPin className="h-4 w-4" />
                البحث عن صيدليات قريبة
              </Button>
              
              <Button
                onClick={() => window.open(`tel:16123`, '_self')}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Phone className="h-4 w-4" />
                اتصل بالخط الساخن للأدوية
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}