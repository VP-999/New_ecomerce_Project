"use client"

import type React from "react"
import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import type { Product } from "../types"
import { XMarkIcon, SearchIcon } from "./icons"
import ProductCard from "./ProductCard"

interface SearchModalProps {
  products: Product[]
  onProductClick?: (product: Product) => void
}

export interface SearchModalRef {
  toggle: () => void
  open: () => void
  close: () => void
}

const SearchModal = forwardRef<SearchModalRef, SearchModalProps>(({ products, onProductClick }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name")

  useEffect(() => {
    if (query.trim() === "") {
      setResults([])
      return
    }

    const lowercasedQuery = query.toLowerCase()
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowercasedQuery) ||
        p.description.toLowerCase().includes(lowercasedQuery) ||
        p.category.toLowerCase().includes(lowercasedQuery),
    )

    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price)
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setResults(filtered)
  }, [query, products, sortBy])

  useEffect(() => {
    if (isOpen) {
      setQuery("")
    }
  }, [isOpen])

  useImperativeHandle(ref, () => ({
    toggle: () => setIsOpen((prev) => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }))

  const handleClose = () => {
    setIsOpen(false)
    setQuery("")
  }

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product)
    }
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-foreground/40 z-50 flex justify-center items-start pt-16 sm:pt-24"
      onClick={handleClose}
    >
      <div
        className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-6 border-b border-border flex flex-col gap-4 bg-card">
          <div className="flex items-center gap-3">
            <SearchIcon className="text-primary flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products by name, description, or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full text-base md:text-lg px-4 py-2.5 bg-background rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={handleClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <XMarkIcon />
            </button>
          </div>

          {query.trim() !== "" && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "price-asc" | "price-desc")}
                className="px-3 py-1.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
              <span className="text-sm text-muted-foreground ml-auto">{results.length} results</span>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {query.trim() !== "" && results.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
              <p>Try a different search term or browse our categories.</p>
            </div>
          )}
          {results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} onProductClick={handleProductClick} />
              ))}
            </div>
          )}
          {query.trim() === "" && (
            <div className="text-center text-muted-foreground py-16">
              <h3 className="text-2xl font-semibold text-foreground mb-2">Search Products</h3>
              <p>Type to find your favorite items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

SearchModal.displayName = "SearchModal"

export default SearchModal
