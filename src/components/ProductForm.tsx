"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Product } from "../types"
import { uploadImageToSupabase } from "../services/imageUploadService"

interface ProductFormProps {
  product: Product | null
  onSubmit: (productData: Omit<Product, "id"> | Product) => void
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Women",
    imageUrl: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageInputType, setImageInputType] = useState<"url" | "file" | "upload">("url")
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        imageUrl: product.imageUrl,
      })
      setImagePreview(product.imageUrl)
      // Detect if it's a base64 data URL or regular URL
      if (product.imageUrl && product.imageUrl.startsWith("data:image")) {
        setImageInputType("file")
      } else {
        setImageInputType("url")
      }
    } else {
      setFormData({ name: "", description: "", price: "", category: "Women", imageUrl: "" })
      setImagePreview(null)
      setImageInputType("url") // Default to URL input
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      
      // Show preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase Storage
      if (imageInputType === "upload") {
        setUploading(true)
        try {
          const uploadedUrl = await uploadImageToSupabase(file, "products")
          setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }))
          setImagePreview(uploadedUrl)
          console.log("[v0] Image uploaded successfully:", uploadedUrl)
        } catch (error) {
          console.error("[v0] Error uploading image:", error)
          alert(error instanceof Error ? error.message : "Failed to upload image. Please try again or use Image URL instead.")
          setUploadedFile(null)
          setImagePreview(null)
        } finally {
          setUploading(false)
        }
      } else {
        // For base64 (file input type, but not upload)
        // Check file size (max 2MB recommended for base64)
        if (file.size > 2 * 1024 * 1024) {
          alert("Image file is too large for base64. Please use 'Upload to Server' option or use an image smaller than 2MB.")
          return
        }
        reader.onloadend = () => {
          const result = reader.result as string
          setFormData((prev) => ({ ...prev, imageUrl: result }))
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData((prev) => ({ ...prev, imageUrl: url }))
    if (url) {
      setImagePreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If file is selected but not uploaded yet, upload it first
    if (uploadedFile && imageInputType === "upload" && !formData.imageUrl.includes("supabase")) {
      setUploading(true)
      try {
        const uploadedUrl = await uploadImageToSupabase(uploadedFile, "products")
        setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }))
      } catch (error) {
        console.error("[v0] Error uploading image:", error)
        alert(error instanceof Error ? error.message : "Failed to upload image. Please try again.")
        setUploading(false)
        return
      } finally {
        setUploading(false)
      }
    }

    if (!formData.imageUrl) {
      alert("Please upload an image or provide an image URL.")
      return
    }

    const productDataForSubmit = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      imageUrl: formData.imageUrl,
    }
    
    if (product && product.id) {
      // Ensure we have the product ID for editing
      onSubmit({ ...productDataForSubmit, id: product.id })
    } else {
      onSubmit(productDataForSubmit)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Product Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-foreground">
            Price
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground">
            Category
          </label>
          <select
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option>Women</option>
            <option>Men</option>
            <option>Accessories</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Product Image</label>
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setImageInputType("url")
              setFormData((prev) => ({ ...prev, imageUrl: "" }))
              setImagePreview(null)
              setUploadedFile(null)
            }}
            className={`px-3 py-1 text-sm rounded-md ${
              imageInputType === "url"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Image URL
          </button>
          <button
            type="button"
            onClick={() => {
              setImageInputType("upload")
              setFormData((prev) => ({ ...prev, imageUrl: "" }))
              setImagePreview(null)
              setUploadedFile(null)
            }}
            className={`px-3 py-1 text-sm rounded-md ${
              imageInputType === "upload"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Upload to Server
          </button>
          <button
            type="button"
            onClick={() => {
              setImageInputType("file")
              setFormData((prev) => ({ ...prev, imageUrl: "" }))
              setImagePreview(null)
              setUploadedFile(null)
            }}
            className={`px-3 py-1 text-sm rounded-md ${
              imageInputType === "file"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Base64 (Small)
          </button>
        </div>
        <div className="mt-1 flex items-center space-x-4">
          {imagePreview && (
            <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
          )}
          {imageInputType === "url" ? (
            <input
              type="url"
              name="imageUrl"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/image.jpg"
              className="block w-full border border-input rounded-md shadow-sm py-2 px-3 bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          ) : (
            <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
                disabled={uploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/80 disabled:opacity-50"
          />
              {uploading && (
                <p className="mt-1 text-xs text-primary">Uploading image...</p>
              )}
            </div>
          )}
        </div>
        {imageInputType === "upload" && (
          <p className="mt-1 text-xs text-muted-foreground">
            Upload image directly to server (max 5MB). Recommended for better performance.
          </p>
        )}
        {imageInputType === "file" && (
          <p className="mt-1 text-xs text-muted-foreground">
            Store as base64 in database (max 2MB). Not recommended for large images.
          </p>
        )}
      </div>
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={uploading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : product ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
