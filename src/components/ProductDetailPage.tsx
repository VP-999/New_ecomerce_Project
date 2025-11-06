"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useCart } from "../contexts/CartContext"
import { formatCurrencyBDT } from "../../lib/utils"
import { useWishlist } from "../contexts/WishlistContext"
import { fetchReviews, addReview } from "../services/reviewService"
import type { Product } from "../types"
import { ArrowLeftIcon, PlusIcon, MinusIcon } from "./icons"

interface ProductDetailPageProps {
  productId: string
  products: Product[]
  onBack: () => void
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, products, onBack }) => {
  const { addToCart, updateQuantity, cart } = useCart()
  const { toggle: toggleWishlist, isWishlisted } = useWishlist()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [reviews, setReviews] = useState<{ author: string; rating: number; comment: string; createdAt: string }[]>([])
  const [newRating, setNewRating] = useState<number>(5)
  const [newComment, setNewComment] = useState<string>("")

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === productId)
    if (foundProduct) {
      setProduct(foundProduct)
      setSelectedImage(foundProduct.imageUrl || "")
    }
  }, [productId, products])

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const list = await fetchReviews(productId)
        setReviews(list)
      } catch (e) {
        console.error('[v0] Failed to load reviews', e)
      }
    }
    loadReviews()
  }, [productId])

  const cartItem = cart.find((item) => item.id === productId)
  const currentQuantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    if (product) {
      if (currentQuantity > 0) {
        updateQuantity(product.id, currentQuantity + quantity)
      } else {
        for (let i = 0; i < quantity; i++) {
          addToCart(product.id)
        }
      }
    }
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : product?.rating || 0

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    if (!newComment.trim()) {
      alert('Please write a comment')
      return
    }
    try {
      const saved = await addReview({ productId: product.id, author: 'Anonymous', rating: newRating, comment: newComment })
      setReviews((prev) => [...prev, saved])
      setNewComment("")
      setNewRating(5)
    } catch (e) {
      console.error('[v0] Failed to add review', e)
      alert('Could not add review. Please try again later.')
    }
  }

  const handleIncrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const handleDecrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Product not found</h2>
          <button
            onClick={onBack}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeftIcon />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={selectedImage || product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2">{product.name}</h1>
              <p className="text-2xl font-bold text-primary mt-4">{formatCurrencyBDT(product.price)}</p>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <span>Rating: {avgRating.toFixed(1)} ★</span>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`px-3 py-1 border rounded ${isWishlisted(product.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'}`}
                >
                  {isWishlisted(product.id) ? '♥ Saved' : '♡ Save'}
                </button>
              </div>
            </div>

            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-input rounded-lg">
                  <button
                    onClick={handleDecrementQuantity}
                    className="p-2 hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
                    className="w-16 text-center border-x border-input py-2 bg-background text-foreground focus:outline-none"
                  />
                  <button
                    onClick={handleIncrementQuantity}
                    className="p-2 hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon />
                  </button>
                </div>
                {currentQuantity > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {currentQuantity} {currentQuantity === 1 ? "item" : "items"} in cart
                  </p>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
              >
                {currentQuantity > 0 ? `Add ${quantity} More to Cart` : "Add to Cart"}
              </button>
              <p className="text-sm text-muted-foreground text-center">
                Free shipping on orders over ৳5000
              </p>
            </div>

            {/* Product Info */}
            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Product Information</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">Category:</span> {product.category}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Price:</span> {formatCurrencyBDT(product.price)}
                  </li>
                </ul>
              </div>

              {/* Reviews */}
              <div className="pt-4">
                <h3 className="font-semibold text-foreground mb-3">Reviews ({reviews.length})</h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r, idx) => (
                      <div key={idx} className="border border-border rounded p-3 bg-card">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{r.author}</span>
                          <span className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Rating: {r.rating} ★</div>
                        <p className="text-sm text-foreground mt-1">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-foreground">Your rating:</label>
                    <select value={newRating} onChange={(e)=>setNewRating(Number(e.target.value))} className="px-2 py-1 border border-input rounded bg-background text-foreground text-sm">
                      {[5,4,3,2,1].map(v => (<option key={v} value={v}>{v}</option>))}
                    </select>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e)=>setNewComment(e.target.value)}
                    placeholder="Write your review..."
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded bg-background text-foreground text-sm"
                  />
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded font-semibold">Submit Review</button>
                </form>
              </div>

              {/* Recommendations */}
              <div className="pt-6">
                <h3 className="font-semibold text-foreground mb-3">You may also like</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products
                    .filter((p) => p.id !== product.id && p.category === product.category)
                    .sort((a,b) => (b.rating ?? 0) - (a.rating ?? 0))
                    .slice(0, 4)
                    .map((rec) => (
                      <div key={rec.id} className="flex gap-3 border border-border rounded p-3 bg-card">
                        <img src={rec.imageUrl || '/placeholder.svg'} alt={rec.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground line-clamp-1">{rec.name}</div>
                          <div className="text-xs text-muted-foreground">{formatCurrencyBDT(rec.price)} • {(rec.rating ?? 0).toFixed(1)} ★</div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage

