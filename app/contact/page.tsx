"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface ContactContent {
  title: string
  intro: string
  email1: string
  email2: string
  phone1: string
  phone2: string
  address1: string
  address2: string
  workHours1: string
  workHours2: string
  responseTitle: string
  responseText: string
  faqTitle: string
  faqs: { q: string; a: string }[]
}

const defaultContactContent: ContactContent = {
  title: "تواصل معنا",
  intro: "نحن هنا لمساعدتك! تواصل معنا لأي استفسارات أو اقتراحات حول موقع دليل الأدوية",
  email1: "info@drugguide.com",
  email2: "support@drugguide.com",
  phone1: "+20 123 456 7890",
  phone2: "+20 987 654 3210",
  address1: "القاهرة، مصر",
  address2: "شارع التحرير، وسط البلد",
  workHours1: "الأحد - الخميس: 9:00 ص - 6:00 م",
  workHours2: "الجمعة - السبت: 10:00 ص - 4:00 م",
  responseTitle: "استجابة سريعة",
  responseText: "نرد على جميع الاستفسارات خلال 24 ساعة",
  faqTitle: "الأسئلة الشائعة",
  faqs: [
    { q: "كم مرة يتم تحديث الأسعار؟", a: "يتم تحديث أسعار الأدوية يومياً من المصادر الرسمية" },
    { q: "هل الموقع مجاني؟", a: "نعم، جميع خدمات الموقع مجانية بالكامل" },
    { q: "كيف يمكنني الإبلاغ عن خطأ؟", a: "يمكنك التواصل معنا عبر النموذج أعلاه أو البريد الإلكتروني" },
    { q: "هل تتوفر خدمة العملاء؟", a: "نعم، فريق الدعم متاح طوال أيام الأسبوع" },
  ],
}

export default function ContactPage() {
  const [content, setContent] = useState<ContactContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      try {
        const response = await fetch("https://dwalast-default-rtdb.firebaseio.com/pages/contact.json")
        if (!response.ok) throw new Error("فشل في تحميل محتوى الصفحة")
        const data = await response.json()
        if (data) {
          setContent({ ...defaultContactContent, ...data }) // Merge with defaults
        } else {
          setContent(defaultContactContent) // Use default if no data
        }
      } catch (err: any) {
        console.error("Error fetching contact page content:", err)
        setError("فشل في تحميل محتوى الصفحة. يرجى المحاولة لاحقاً.")
        setContent(defaultContactContent) // Fallback to default on error
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitted(true)
    setIsSubmitting(false)
    setFormData({ name: "", email: "", subject: "", message: "" })

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <Skeleton className="h-16 w-64 mx-auto mb-4" />
            <Skeleton className="h-8 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
          <Skeleton className="h-48 w-full mt-12" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center shadow-xl border-red-200 bg-red-50">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
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
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {content?.title}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{content?.intro}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Phone className="h-6 w-6 text-blue-600" />
                  معلومات التواصل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">البريد الإلكتروني</h4>
                    <p className="text-gray-600">{content?.email1}</p>
                    <p className="text-gray-600">{content?.email2}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <Phone className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">الهاتف</h4>
                    <p className="text-gray-600">{content?.phone1}</p>
                    <p className="text-gray-600">{content?.phone2}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">العنوان</h4>
                    <p className="text-gray-600">{content?.address1}</p>
                    <p className="text-gray-600">{content?.address2}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">ساعات العمل</h4>
                    <p className="text-gray-600">{content?.workHours1}</p>
                    <p className="text-gray-600">{content?.workHours2}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-3">{content?.responseTitle}</h3>
                <p className="mb-4 opacity-90">{content?.responseText}</p>
                <Badge variant="secondary" className="bg-white text-blue-600">
                  دعم فني متخصص
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Send className="h-6 w-6 text-blue-600" />
                  أرسل رسالة
                </CardTitle>
                <p className="text-gray-600">املأ النموذج أدناه وسنتواصل معك في أقرب وقت</p>
              </CardHeader>
              <CardContent>
                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-800">تم إرسال الرسالة بنجاح!</h4>
                      <p className="text-green-600">سنتواصل معك قريباً</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الكامل *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                        placeholder="أدخل اسمك الكامل"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      موضوع الرسالة *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                      placeholder="ما هو موضوع رسالتك؟"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      الرسالة *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
                      placeholder="اكتب رسالتك هنا..."
                      dir="rtl"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="ml-2 h-4 w-4" />
                          إرسال الرسالة
                        </>
                      )}
                    </Button>

                    <Link href="/">
                      <Button variant="outline" size="lg" className="border-gray-200 hover:bg-gray-50 bg-transparent">
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        العودة للصفحة الرئيسية
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-12 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 text-center">{content?.faqTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content?.faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{faq.q}</h4>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
