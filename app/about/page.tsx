"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Target, Users, Shield, Zap, Heart, Award, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface AboutContent {
  title: string
  intro: string
  missionTitle: string
  missionText: string
  features: { title: string; description: string }[]
  stats: { value: string; label: string }[]
  teamIntro: string
  teamMedical: string
  teamDev: string
}

const defaultAboutContent: AboutContent = {
  title: "عن موقع دليل الأدوية",
  intro: "منصة شاملة لمتابعة أسعار الأدوية في مصر، نهدف لتوفير معلومات دقيقة ومحدثة لمساعدة المرضى والصيادلة",
  missionTitle: "رسالتنا",
  missionText:
    "نسعى لتوفير منصة موثوقة وسهلة الاستخدام لمتابعة أسعار الأدوية في السوق المصري، مما يساعد المواطنين على اتخاذ قرارات مدروسة بشأن احتياجاتهم الطبية",
  features: [
    {
      title: "تحديث فوري",
      description: "نوفر أحدث أسعار الأدوية من مصادر موثوقة مع تحديث مستمر للبيانات لضمان دقة المعلومات",
    },
    {
      title: "معلومات موثوقة",
      description: "جميع البيانات مستمدة من مصادر رسمية ومعتمدة لضمان الحصول على معلومات دقيقة وموثوقة",
    },
    {
      title: "سهولة الاستخدام",
      description: "واجهة بسيطة ومفهومة تتيح للجميع البحث والعثور على المعلومات المطلوبة بسهولة ويسر",
    },
  ],
  stats: [
    { value: "1000+", label: "دواء مسجل" },
    { value: "50+", label: "شركة أدوية" },
    { value: "24/7", label: "تحديث مستمر" },
  ],
  teamIntro: "فريق متخصص من الصيادلة والمطورين يعمل على توفير أفضل خدمة للمستخدمين",
  teamMedical: "صيادلة معتمدون يراجعون البيانات ويضمنون دقة المعلومات الطبية",
  teamDev: "مطورون متخصصون في تقنيات الويب الحديثة لضمان أفضل تجربة للمستخدم",
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      try {
        const response = await fetch("https://dwalast-default-rtdb.firebaseio.com/pages/about.json")
        if (!response.ok) throw new Error("فشل في تحميل محتوى الصفحة")
        const data = await response.json()
        if (data) {
          setContent({ ...defaultAboutContent, ...data }) // Merge with defaults
        } else {
          setContent(defaultAboutContent) // Use default if no data
        }
      } catch (err: any) {
        console.error("Error fetching about page content:", err)
        setError("فشل في تحميل محتوى الصفحة. يرجى المحاولة لاحقاً.")
        setContent(defaultAboutContent) // Fallback to default on error
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <Skeleton className="h-16 w-64 mx-auto mb-4" />
            <Skeleton className="h-8 w-96 mx-auto" />
          </div>
          <Skeleton className="h-48 w-full mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-32 w-full mb-12" />
          <Skeleton className="h-48 w-full" />
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
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {content?.title}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{content?.intro}</p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12 shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Target className="h-8 w-8" />
              <h2 className="text-3xl font-bold">{content?.missionTitle}</h2>
            </div>
            <p className="text-xl leading-relaxed">{content?.missionText}</p>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {content?.features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:scale-105"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  {index === 0 && <Zap className="h-8 w-8 text-blue-600" />}
                  {index === 1 && <Shield className="h-8 w-8 text-green-600" />}
                  {index === 2 && <Users className="h-8 w-8 text-purple-600" />}
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <h3 className="text-3xl font-bold text-center mb-8">إحصائيات الموقع</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {content?.stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="mb-12 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="h-8 w-8 text-blue-600" />
              <h3 className="text-3xl font-bold text-gray-800">فريق العمل</h3>
            </div>
            <p className="text-gray-600 text-lg">{content?.teamIntro}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <h4 className="text-xl font-bold text-gray-800 mb-2">الفريق الطبي</h4>
                <p className="text-gray-600">{content?.teamMedical}</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <h4 className="text-xl font-bold text-gray-800 mb-2">فريق التطوير</h4>
                <p className="text-gray-600">{content?.teamDev}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center shadow-xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <h3 className="text-3xl font-bold mb-4">ابدأ البحث الآن</h3>
            <p className="text-xl mb-6 opacity-90">اكتشف أسعار الأدوية وقارن بينها لاتخاذ أفضل القرارات الطبية</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  <ArrowLeft className="ml-2 h-5 w-5" />
                  العودة للصفحة الرئيسية
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
