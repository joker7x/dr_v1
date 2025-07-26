import { v4 as uuidv4 } from "uuid"

export interface DrugData {
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
  // New detailed information fields
  manufacturer?: string
  category?: string
  description?: string
  dosage?: string
  sideEffects?: string
  contraindications?: string
  interactions?: string
  storageConditions?: string
  expiryWarning?: number // days before expiry
  imageUrl?: string
  barcode?: string
  isAvailable?: boolean
  pharmacyNotes?: string
}

export interface ImportResult {
  success: boolean
  message: string
  importedCount: number
  errorCount: number
  errors: string[]
}

const FIREBASE_BASE_URL = "https://dwalast-default-rtdb.firebaseio.com"

export const dataImportManager = {
  // Import from JSON file
  importFromFile: async (file: File): Promise<ImportResult> => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (!data || typeof data !== 'object') {
        return {
          success: false,
          message: "ملف غير صالح - يجب أن يكون ملف JSON صحيح",
          importedCount: 0,
          errorCount: 1,
          errors: ["تنسيق الملف غير صحيح"]
        }
      }

      return await processImportData(data)
    } catch (error) {
      return {
        success: false,
        message: "خطأ في قراءة الملف",
        importedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : "خطأ غير معروف"]
      }
    }
  },

  // Import from Firebase (background sync)
  importFromFirebase: async (): Promise<ImportResult> => {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/drugs.json`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (!data) {
        return {
          success: false,
          message: "لا توجد بيانات في Firebase",
          importedCount: 0,
          errorCount: 0,
          errors: []
        }
      }

      return await processImportData(data)
    } catch (error) {
      return {
        success: false,
        message: "فشل في الاتصال بـ Firebase",
        importedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : "خطأ في الشبكة"]
      }
    }
  },

  // Export current data to JSON
  exportToFile: async (): Promise<Blob> => {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/drugs.json`)
      const data = await response.json()
      
      const exportData = {
        exportDate: new Date().toISOString(),
        drugCount: Object.keys(data || {}).length,
        drugs: data
      }

      return new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
    } catch (error) {
      throw new Error("فشل في تصدير البيانات")
    }
  },

  // Update drug information
  updateDrugInfo: async (drugId: string, updates: Partial<DrugData>): Promise<boolean> => {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/drugs/${drugId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          lastModified: new Date().toISOString()
        })
      })
      return response.ok
    } catch (error) {
      console.error('Error updating drug info:', error)
      return false
    }
  },

  // Add new drug
  addDrug: async (drugData: Omit<DrugData, 'id'>): Promise<string | null> => {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/drugs.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...drugData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.name // Firebase returns the key
      }
      return null
    } catch (error) {
      console.error('Error adding drug:', error)
      return null
    }
  },

  // Delete drug
  deleteDrug: async (drugId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/drugs/${drugId}.json`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Error deleting drug:', error)
      return false
    }
  },

  // Validate CSV format for import
  validateCSV: (csvText: string): { valid: boolean; errors: string[] } => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const errors: string[] = []
    
    if (lines.length < 2) {
      errors.push("الملف يجب أن يحتوي على رأس الجدول وسطر واحد على الأقل من البيانات")
    }
    
    const headers = lines[0].split(',').map(h => h.trim())
    const requiredHeaders = ['name', 'newPrice', 'oldPrice']
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      errors.push(`الأعمدة المطلوبة مفقودة: ${missingHeaders.join(', ')}`)
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Convert CSV to JSON for import
  csvToJson: (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const obj: any = { originalOrder: index }
      
      headers.forEach((header, i) => {
        if (values[i] !== undefined) {
          // Convert numeric fields
          if (['newPrice', 'oldPrice', 'averageDiscountPercent', 'expiryWarning'].includes(header)) {
            obj[header] = parseFloat(values[i]) || 0
          } else if (header === 'isAvailable') {
            obj[header] = values[i].toLowerCase() === 'true'
          } else {
            obj[header] = values[i]
          }
        }
      })
      
      // Generate required fields if missing
      if (!obj.id) obj.id = uuidv4()
      if (!obj.no) obj.no = (index + 1).toString()
      if (!obj.updateDate) obj.updateDate = new Date().toLocaleDateString('ar-EG')
      
      // Calculate price change
      const newPrice = obj.newPrice || 0
      const oldPrice = obj.oldPrice || 0
      obj.priceChange = newPrice - oldPrice
      obj.priceChangePercent = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0
      
      return obj
    })
  }
}

// Process imported data and save to Firebase
async function processImportData(data: any): Promise<ImportResult> {
  let importedCount = 0
  let errorCount = 0
  const errors: string[] = []
  
  try {
    // Handle different data formats
    let drugsData: any = {}
    
    if (Array.isArray(data)) {
      // Convert array to object with indices as keys
      data.forEach((drug, index) => {
        if (drug && typeof drug === 'object' && drug.name) {
          drugsData[index.toString()] = drug
        }
      })
    } else if (data.drugs) {
      // Handle export format with metadata
      drugsData = data.drugs
    } else {
      // Assume it's already in the correct format
      drugsData = data
    }
    
    // Validate and process each drug
    for (const [key, drugData] of Object.entries(drugsData)) {
      try {
        if (!drugData || typeof drugData !== 'object') {
          errorCount++
          errors.push(`السطر ${key}: بيانات غير صالحة`)
          continue
        }
        
        const drug = drugData as any
        if (!drug.name || !drug.name.trim()) {
          errorCount++
          errors.push(`السطر ${key}: اسم الدواء مطلوب`)
          continue
        }
        
        // Validate required fields
        if (typeof drug.newPrice !== 'number' || drug.newPrice < 0) {
          errorCount++
          errors.push(`السطر ${key}: السعر الجديد غير صالح`)
          continue
        }
        
        importedCount++
      } catch (error) {
        errorCount++
        errors.push(`السطر ${key}: خطأ في المعالجة`)
      }
    }
    
    // Save to Firebase if validation passed
    if (importedCount > 0) {
      const response = await fetch(`${FIREBASE_BASE_URL}/drugs.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...drugsData,
          lastImport: new Date().toISOString(),
          importedBy: 'admin'
        })
      })
      
      if (!response.ok) {
        throw new Error(`فشل في حفظ البيانات: ${response.status}`)
      }
    }
    
    return {
      success: importedCount > 0,
      message: `تم استيراد ${importedCount} دواء بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ''}`,
      importedCount,
      errorCount,
      errors: errors.slice(0, 10) // Limit error messages
    }
    
  } catch (error) {
    return {
      success: false,
      message: "فشل في معالجة البيانات",
      importedCount: 0,
      errorCount: 1,
      errors: [error instanceof Error ? error.message : "خطأ غير معروف"]
    }
  }
}