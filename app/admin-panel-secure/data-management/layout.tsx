import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة البيانات - لوحة التحكم',
  description: 'إدارة بيانات الأدوية واستيراد وتصدير المعلومات',
}

export default function DataManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {children}
    </div>
  )
}