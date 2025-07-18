import { v4 as uuidv4 } from "uuid"

// Define interfaces for rating data
export interface BaseRating {
  rating: number
  comment: string
  userName: string
  governorate: string
  isPharmacist: boolean
  pharmacyName?: string
  profilePictureUrl?: string
  timestamp: string
  deviceId: string
  isVerified: boolean // Admin controlled
}

export interface ProductRating extends BaseRating {
  drugId: string
}

export interface WebsiteRating extends BaseRating {}

// Firebase base URL
const FIREBASE_BASE_URL = "https://dwalast-default-rtdb.firebaseio.com"

// Helper to get a unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("drug_app_device_id")
  if (!deviceId) {
    deviceId = uuidv4()
    localStorage.setItem("drug_app_device_id", deviceId)
  }
  return deviceId
}

// Check if user has already rated a specific item (drug or website)
export const hasUserRated = async (itemId: string, type: "drug" | "website"): Promise<boolean> => {
  const deviceId = getDeviceId()
  let url: string

  if (type === "drug") {
    url = `${FIREBASE_BASE_URL}/drugs/${itemId}/ratings.json?orderBy="deviceId"&equalTo="${deviceId}"`
  } else {
    url = `${FIREBASE_BASE_URL}/website_ratings.json?orderBy="deviceId"&equalTo="${deviceId}"`
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to check existing rating")
    const data = await response.json()
    return Object.keys(data || {}).length > 0
  } catch (error) {
    console.error("Error checking existing rating:", error)
    return false // Assume not rated on error to allow retries
  }
}

// Add a new product rating
export const addProductRating = async (
  drugId: string,
  ratingData: Omit<BaseRating, "timestamp" | "deviceId" | "isVerified">,
): Promise<boolean> => {
  const deviceId = getDeviceId()
  const newRating: BaseRating = {
    ...ratingData,
    timestamp: new Date().toISOString(),
    deviceId,
    isVerified: false, // Default to false, admin will verify
  }
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/drugs/${drugId}/ratings.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRating),
    })
    return response.ok
  } catch (error) {
    console.error("Error adding product rating:", error)
    return false
  }
}

// Get all ratings for a product
export const getProductRatings = async (drugId: string): Promise<ProductRating[]> => {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/drugs/${drugId}/ratings.json`)
    if (!response.ok) throw new Error("Failed to fetch product ratings")
    const data = await response.json()
    if (!data) return []

    return Object.entries(data).map(([id, rating]: [string, any]) => ({
      id,
      drugId,
      ...rating,
    })) as ProductRating[]
  } catch (error) {
    console.error("Error getting product ratings:", error)
    return []
  }
}

// Add a new website rating
export const addWebsiteRating = async (
  ratingData: Omit<BaseRating, "timestamp" | "deviceId" | "isVerified">,
): Promise<boolean> => {
  const deviceId = getDeviceId()
  const newRating: BaseRating = {
    ...ratingData,
    timestamp: new Date().toISOString(),
    deviceId,
    isVerified: false, // Default to false, admin will verify
  }
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/website_ratings.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRating),
    })
    return response.ok
  } catch (error) {
    console.error("Error adding website rating:", error)
    return false
  }
}

// Get all website ratings
export const getWebsiteRatings = async (): Promise<WebsiteRating[]> => {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/website_ratings.json`)
    if (!response.ok) throw new Error("Failed to fetch website ratings")
    const data = await response.json()
    if (!data) return []

    return Object.entries(data).map(([id, rating]: [string, any]) => ({
      id,
      ...rating,
    })) as WebsiteRating[]
  } catch (error) {
    console.error("Error getting website ratings:", error)
    return []
  }
}

// Admin: Delete a rating (product or website)
export const deleteRating = async (type: "drug" | "website", itemId: string, ratingId: string): Promise<boolean> => {
  let url: string
  if (type === "drug") {
    url = `${FIREBASE_BASE_URL}/drugs/${itemId}/ratings/${ratingId}.json`
  } else {
    url = `${FIREBASE_BASE_URL}/website_ratings/${ratingId}.json`
  }
  try {
    const response = await fetch(url, { method: "DELETE" })
    return response.ok
  } catch (error) {
    console.error(`Error deleting ${type} rating:`, error)
    return false
  }
}

// Admin: Update a rating (e.g., set isVerified)
export const updateRating = async (
  type: "drug" | "website",
  itemId: string | null,
  ratingId: string,
  updates: Partial<BaseRating>,
): Promise<boolean> => {
  let url: string
  if (type === "drug" && itemId) {
    url = `${FIREBASE_BASE_URL}/drugs/${itemId}/ratings/${ratingId}.json`
  } else if (type === "website") {
    url = `${FIREBASE_BASE_URL}/website_ratings/${ratingId}.json`
  } else {
    console.error("Invalid parameters for updateRating")
    return false
  }

  try {
    const response = await fetch(url, {
      method: "PATCH", // Use PATCH for partial updates
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    return response.ok
  } catch (error) {
    console.error(`Error updating ${type} rating:`, error)
    return false
  }
}

// Admin: Get all product ratings (for admin panel)
export const getAllProductRatingsForAdmin = async (): Promise<ProductRating[]> => {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/drugs.json`)
    if (!response.ok) throw new Error("Failed to fetch all product ratings for admin")
    const data = await response.json()
    if (!data) return []

    const allRatings: ProductRating[] = []
    for (const drugId in data) {
      if (data[drugId] && data[drugId].ratings) {
        for (const ratingId in data[drugId].ratings) {
          allRatings.push({
            id: ratingId,
            drugId: drugId,
            ...data[drugId].ratings[ratingId],
          })
        }
      }
    }
    return allRatings
  } catch (error) {
    console.error("Error getting all product ratings for admin:", error)
    return []
  }
}
