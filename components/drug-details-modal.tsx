"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, User, FlaskRoundIcon as Flask, CheckCircle, AlertCircle, Verified } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { addProductRating, getProductRatings, hasUserRated, type ProductRating } from "@/lib/ratings"

interface Drug {
  id: string
  name: string
  newPrice: number
  oldPrice: number
  no: string
  updateDate: string
  priceChange: number
  priceChangePercent: number
  originalOrder: number
  activeIngredient?: string // المادة الفعالة
  averageDiscountPercent?: number // متوسط نسبة الخصم
}

interface DrugDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  drug: Drug | null
}

export default function DrugDetailsModal({ isOpen, onClose, drug }: DrugDetailsModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [userName, setUserName] = useState("")
  const [governorate, setGovernorate] = useState("")
  const [isPharmacist, setIsPharmacist] = useState(false)
  const [pharmacyName, setPharmacyName] = useState("")
  const [profilePictureUrl, setProfilePictureUrl] = useState("")
  const [hasRated, setHasRated] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [drugRatings, setDrugRatings] = useState<ProductRating[]>([])
  const [ratingsLoading, setRatingsLoading] = useState(true)

  const resetForm = () => {
    setRating(0)
    setComment("")
    setUserName("")
    setGovernorate("")
    setIsPharmacist(false)
    setPharmacyName("")
    setProfilePictureUrl("")
    setSubmissionMessage(null)
  }

  const fetchAndCheckRatings = async (drugId: string) => {
    setRatingsLoading(true)
    try {
      const rated = await hasUserRated(drugId, "drug")
      setHasRated(rated)
      const ratings = await getProductRatings(drugId)
      setDrugRatings(ratings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())) // Sort by newest
    } catch (error) {
      console.error("Error in fetchAndCheckRatings (DrugDetailsModal):", error)
      setSubmissionMessage({ type: "error", text: "فشل في تحميل التقييمات. يرجى المحاولة لاحقاً." })
    } finally {
      setRatingsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && drug) {
      resetForm()
      fetchAndCheckRatings(drug.id)
    }
  }, [isOpen, drug])

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!drug || rating === 0 || !userName || !governorate || !comment) {
      setSubmissionMessage({ type: "error", text: "الرجاء ملء جميع الحقول المطلوبة واختيار تقييم." })
      return
    }

    setIsSubmitting(true)
    setSubmissionMessage(null)

    const success = await addProductRating(drug.id, {
      rating,
      comment,
      userName,
      governorate,
      isPharmacist,
      pharmacyName: isPharmacist ? pharmacyName : undefined,
      profilePictureUrl: profilePictureUrl || undefined,
    })

    if (success) {
      setSubmissionMessage({ type: "success", text: "تم إرسال تقييمك بنجاح! سيظهر بعد مراجعته." })
      resetForm()
      setHasRated(true) // Mark as rated for this device
      fetchAndCheckRatings(drug.id) // Refresh ratings
    } else {
      setSubmissionMessage({ type: "error", text: "فشل إرسال التقييم. يرجى المحاولة مرة أخرى." })
    }
    setIsSubmitting(false)
  }

  if (!drug) return null

  const averageRating =
    drugRatings.length > 0 ? (drugRatings.reduce((sum, r) => sum + r.rating, 0) / drugRatings.length).toFixed(1) : "0.0"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="fixed left-[50%] top-[50%] z-50 w-[95%] max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg
        flex flex-col h-full max-h-[95vh] overflow-hidden"
      >
        <DialogHeader className="text-right pb-4 flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-blue-700" dir="rtl">
            {drug.name}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600" dir="rtl">
            رقم الدواء: {drug.no} | السعر: {drug.newPrice.toFixed(2)} جنيه
            {drug.activeIngredient && <span className="block mt-1">المادة الفعالة: {drug.activeIngredient}</span>}
            {drug.averageDiscountPercent !== undefined && drug.averageDiscountPercent > 0 && (
              <span className="block mt-1">متوسط نسبة الخصم: {drug.averageDiscountPercent.toFixed(1)}%</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pb-4 pr-2 sm:pr-4">
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-700" dir="rtl">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
              <span>
                متوسط التقييم: {averageRating} ({drugRatings.length} تقييم)
              </span>
            </div>

            {/* User Rating Form */}
            <div className="bg-blue-50 border-blue-200 shadow-sm p-4 rounded-lg">
              <div className="pb-3">
                <h3 className="text-lg font-semibold text-blue-800" dir="rtl">
                  {hasRated ? "لقد قمت بتقييم هذا الدواء بالفعل" : "قيم هذا الدواء"}
                </h3>
              </div>
              <div>
                {submissionMessage && (
                  <div
                    className={`mb-4 p-3 rounded-md flex items-center gap-3 ${submissionMessage.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                  >
                    {submissionMessage.type === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <p
                      className={`text-sm ${submissionMessage.type === "success" ? "text-green-800" : "text-red-800"}`}
                    >
                      {submissionMessage.text}
                    </p>
                  </div>
                )}

                {!hasRated ? (
                  <form onSubmit={handleSubmitRating} className="space-y-4">
                    <div>
                      <Label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">
                        تقييمك <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-1" dir="ltr">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-7 w-7 sm:h-8 sm:w-8 cursor-pointer transition-colors duration-200 ${
                              star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 hover:text-yellow-400"
                            }`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">
                        تعليقك <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="اكتب تعليقك هنا..."
                        rows={3}
                        dir="rtl"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">
                          اسمك <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="userName"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="أدخل اسمك"
                          dir="rtl"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="governorate" className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">
                          محافظتك <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="governorate"
                          value={governorate}
                          onChange={(e) => setGovernorate(e.target.value)}
                          placeholder="مثال: القاهرة"
                          dir="rtl"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2" dir="rtl">
                      <Checkbox
                        id="isPharmacist"
                        checked={isPharmacist}
                        onCheckedChange={(checked) => setIsPharmacist(!!checked)}
                        className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="isPharmacist" className="text-sm font-medium text-gray-700">
                        أنا صيدلي
                      </Label>
                    </div>

                    {isPharmacist && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="pharmacyName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                            dir="rtl"
                          >
                            اسم الصيدلية (اختياري)
                          </Label>
                          <Input
                            id="pharmacyName"
                            value={pharmacyName}
                            onChange={(e) => setPharmacyName(e.target.value)}
                            placeholder="اسم الصيدلية"
                            dir="rtl"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="profilePictureUrl"
                            className="block text-sm font-medium text-gray-700 mb-2"
                            dir="rtl"
                          >
                            رابط صورة شخصية (اختياري)
                          </Label>
                          <Input
                            id="profilePictureUrl"
                            value={profilePictureUrl}
                            onChange={(e) => setProfilePictureUrl(e.target.value)}
                            placeholder="https://example.com/your-photo.jpg"
                            dir="ltr"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                      {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
                    </Button>
                  </form>
                ) : (
                  <p className="text-gray-600 text-center py-4" dir="rtl">
                    شكرًا لتقييمك! يمكنك تقييم هذا الدواء مرة واحدة فقط.
                  </p>
                )}
              </div>
            </div>
            {/* Existing Ratings */}
            <h3 className="text-xl font-bold text-gray-800 mb-4" dir="rtl">
              تقييمات المستخدمين ({drugRatings.length})
            </h3>
            {ratingsLoading ? (
              <div className="text-center text-gray-500 py-4">جاري تحميل التقييمات...</div>
            ) : drugRatings.length === 0 ? (
              <div className="text-center text-gray-500 py-4" dir="rtl">
                لا توجد تقييمات لهذا الدواء بعد. كن أول من يقيم!
              </div>
            ) : (
              <div className="space-y-4">
                {drugRatings.map((r, index) => (
                  <div key={index} className="bg-white border border-gray-200 shadow-sm p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2" dir="rtl">
                        {r.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.profilePictureUrl || "/placeholder.svg"}
                            alt={r.userName}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <User className="h-9 w-9 text-gray-500 p-1 bg-gray-100 rounded-full border border-gray-200" />
                        )}
                        <span className="font-semibold text-gray-800 text-base">{r.userName}</span>
                        {r.isPharmacist && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <Flask className="h-3 w-3 ml-1" />
                            صيدلي
                          </div>
                        )}
                        {r.isVerified && (
                          <Verified className="h-4 w-4 text-blue-500 fill-blue-500" title="موثق من الإدارة" />
                        )}
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0" dir="ltr">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 text-sm leading-relaxed" dir="rtl">
                      {r.comment}
                    </p>
                    <div className="text-xs text-gray-500 flex justify-between items-center" dir="rtl">
                      <span>
                        {r.governorate} {r.pharmacyName && `(${r.pharmacyName})`}
                      </span>
                      <span>{new Date(r.timestamp).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
