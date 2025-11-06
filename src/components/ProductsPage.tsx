"use client"

import type React from "react"
import { useMemo, useState, useEffect } from "react"
import type { Product } from "../types"
import ProductCard from "./ProductCard"

interface ProductsPageProps {
  selectedCategory: string | null
  products: Product[]
  onProductClick?: (product: Product) => void
}

const ProductsPage: React.FC<ProductsPageProps> = ({ selectedCategory, products, onProductClick }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "rating-desc" | "rating-asc">("name")
  const categories = ["All", "Men", "Women", "Accessories"]

  useEffect(() => {
    const prices = products.map((p) => p.price)
    const min = prices.length ? Math.floor(Math.min(...prices)) : 0
    const max = prices.length ? Math.ceil(Math.max(...prices)) : 0
    setMinPrice(min)
    setMaxPrice(max)
    setPriceRange([min, max])
  }, [products])

  useEffect(() => {
    setActiveCategory(selectedCategory)
  }, [selectedCategory])

  const filteredProducts = useMemo(() => {
    let list = products
    if (activeCategory && activeCategory !== "All") {
      list = list.filter((p) => p.category === activeCategory)
    }
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    list = list.filter((p) => (p.rating ?? 0) >= minRating)
    switch (sortBy) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case "rating-desc":
        list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      case "rating-asc":
        list = [...list].sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0))
        break
      default:
        list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }
    return list
  }, [products, activeCategory, priceRange, minRating, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Shop Our Collection</h1>
          <p className="text-lg text-muted-foreground">
            Browse our curated selection of premium fashion and lifestyle products
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3 items-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category === "All" ? null : category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                activeCategory === category || (activeCategory === null && category === "All")
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-foreground border border-border hover:border-primary hover:text-primary"
              }`}
            >
              {category}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-3 bg-card border border-border rounded-lg p-3">
            <span className="text-sm text-muted-foreground">Price:</span>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value) || minPrice, priceRange[1]])}
              min={minPrice}
              max={priceRange[1]}
              className="w-20 px-2 py-1 border border-input rounded bg-background text-foreground text-sm"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || maxPrice])}
              min={priceRange[0]}
              max={maxPrice}
              className="w-20 px-2 py-1 border border-input rounded bg-background text-foreground text-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-3">
            <span className="text-sm text-muted-foreground">Min rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-2 py-1 bg-background border border-input rounded text-sm text-foreground"
            >
              <option value={0}>All</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-3">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2 py-1 bg-background border border-input rounded text-sm text-foreground"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-asc">Price (Low → High)</option>
              <option value="price-desc">Price (High → Low)</option>
              <option value="rating-desc">Rating (High → Low)</option>
              <option value="rating-asc">Rating (Low → High)</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
