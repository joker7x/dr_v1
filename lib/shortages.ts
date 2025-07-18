import { v4 as uuidv4 } from "uuid" // Import uuidv4

export interface Shortage {
  id: string
  drugId: string // Reference to the drug ID
  drugName: string // To display drug name without extra fetch
  reason: string
  status: "critical" | "moderate" | "resolved"
  reportDate: string
  lastUpdateDate: string
  reportedBy?: string // e.g., "Admin"
}

const FIREBASE_BASE_URL = "https://dwalast-default-rtdb.firebaseio.com"

export const shortageManager = {
  addShortage: async (
    drugName: string, // Changed to only take drugName
    reason: string,
    status: "critical" | "moderate" | "resolved",
    reportedBy?: string,
  ): Promise<boolean> => {
    const newShortage: Omit<Shortage, "id" | "drugId"> & { drugId: string } = {
      // Ensure drugId is present
      drugId: uuidv4(), // Generate a unique ID for the shortage entry
      drugName,
      reason,
      status,
      reportDate: new Date().toISOString(),
      lastUpdateDate: new Date().toISOString(),
      reportedBy,
    }
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/shortages.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShortage),
      })
      return response.ok
    } catch (error) {
      console.error("Error adding shortage:", error)
      return false
    }
  },

  getShortages: async (): Promise<Shortage[]> => {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/shortages.json`)
      if (!response.ok) throw new Error("Failed to fetch shortages")
      const data = await response.json()
      if (!data) return []

      return Object.entries(data).map(([id, shortage]: [string, any]) => ({
        id,
        ...shortage,
      })) as Shortage[]
    } catch (error) {
      console.error("Error getting shortages:", error)
      return []
    }
  },

  updateShortage: async (
    shortageId: string,
    updates: Partial<Omit<Shortage, "id" | "reportDate">>,
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/shortages/${shortageId}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updates, lastUpdateDate: new Date().toISOString() }),
      })
      return response.ok
    } catch (error) {
      console.error("Error updating shortage:", error)
      return false
    }
  },

  deleteShortage: async (shortageId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${FIREBASE_BASE_URL}/shortages/${shortageId}.json`, {
        method: "DELETE",
      })
      return response.ok
    } catch (error) {
      console.error("Error deleting shortage:", error)
      return false
    }
  },
}
