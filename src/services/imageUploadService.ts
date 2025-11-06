const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ydnhospjsveqncfdguxp.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkbmhvc3Bqc3ZlcW5jZmRndXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjIzODAsImV4cCI6MjA3NTkzODM4MH0.UsJ5z6PTIY7BfDjSzhzmjY8nnxpHoPV7E8tPU4bXBV4"

/**
 * Upload image file to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Folder name in storage (default: 'products')
 * @returns Public URL of the uploaded image
 */
export const uploadImageToSupabase = async (
  file: File,
  folder: string = "products"
): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error("Image file is too large. Maximum size is 5MB.")
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    // Upload to Supabase Storage using the correct API format
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${folder}/${fileName}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Supabase Storage upload error:", errorText)
      
      // If bucket doesn't exist, provide helpful error message
      if (response.status === 404 || response.status === 400) {
        throw new Error(
          `Storage bucket '${folder}' not found. Please create the bucket in Supabase Storage first.`
        )
      }
      
      throw new Error(`Failed to upload image: ${errorText}`)
    }

    // Get public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${folder}/${fileName}`
    console.log("[v0] Image uploaded successfully:", publicUrl)
    
    return publicUrl
  } catch (error) {
    console.error("[v0] Error uploading image:", error)
    throw error
  }
}

/**
 * Delete image from Supabase Storage
 * @param filePath - Path to the file in storage (e.g., 'products/filename.jpg')
 * @param folder - Folder name in storage (default: 'products')
 */
export const deleteImageFromSupabase = async (
  filePath: string,
  folder: string = "products"
): Promise<void> => {
  try {
    // Extract filename from path or URL
    let fileName = filePath
    if (filePath.includes("/")) {
      fileName = filePath.split("/").pop() || filePath
    }

    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${folder}/${fileName}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })

    if (!response.ok && response.status !== 404) {
      // 404 means file doesn't exist, which is fine for deletion
      const errorText = await response.text()
      console.error("[v0] Error deleting image:", errorText)
      throw new Error(`Failed to delete image: ${errorText}`)
    }

    console.log("[v0] Image deleted successfully:", fileName)
  } catch (error) {
    console.error("[v0] Error deleting image:", error)
    // Don't throw error for deletion failures - it's not critical
    console.warn("[v0] Image deletion failed, but continuing...")
  }
}

