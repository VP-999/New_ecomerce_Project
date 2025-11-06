"use client"

import type React from "react"
import type { Product } from "../types"
import { useCart } from "../contexts/CartContext"
import { formatCurrencyBDT } from "../../lib/utils"
import { useWishlist } from "../contexts/WishlistContext"

interface ProductCardProps {
  product: Product
  onProductClick?: (product: Product) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { addToCart } = useCart()
  const { toggle, isWishlisted } = useWishlist()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger product click if clicking the add to cart button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    if (onProductClick) {
      onProductClick(product)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking add to cart
    addToCart(product.id)
    // Notify app to open cart and give user feedback
    window.dispatchEvent(new CustomEvent('cart:add'))
    try { console.log(`[v0] Added to cart: ${product.name}`) } catch {}
  }

  return (
    <div 
      className="bg-card rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition-shadow h-full flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden bg-muted h-80">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggle(product.id)
          }}
          aria-label="Toggle wishlist"
          className={`absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
            isWishlisted(product.id)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background/80 text-foreground border-border hover:bg-muted"
          }`}
        >
          {isWishlisted(product.id) ? "♥ Saved" : "♡ Save"}
        </button>
        <img
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-end justify-center pb-4">
          <button
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold px-6 py-2.5 shadow-lg opacity-0 group-hover:opacity-100 transform transition-all duration-300 translate-y-4 group-hover:translate-y-0"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">{product.category}</p>
          <h3 className="text-base font-semibold text-card-foreground mt-2 line-clamp-2">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>
        <span className="text-lg font-bold text-foreground mt-3">{formatCurrencyBDT(product.price)}</span>
      </div>
    </div>
  )
}

export default ProductCard
