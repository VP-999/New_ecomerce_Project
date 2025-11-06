"use client"

import type React from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface WishlistContextType {
  wishlist: Set<string>
  toggle: (productId: string) => void
  add: (productId: string) => void
  remove: (productId: string) => void
  isWishlisted: (productId: string) => boolean
  clear: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const STORAGE_KEY = 'trendhive:wishlist'

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ids, setIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const arr = JSON.parse(raw) as string[]
        setIds(new Set(arr))
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
    } catch {}
  }, [ids])

  const add = (productId: string) => setIds((prev) => new Set(prev).add(productId))
  const remove = (productId: string) =>
    setIds((prev) => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  const toggle = (productId: string) =>
    setIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })

  const value: WishlistContextType = useMemo(
    () => ({
      wishlist: ids,
      toggle,
      add,
      remove,
      isWishlisted: (productId: string) => ids.has(productId),
      clear: () => setIds(new Set()),
    }),
    [ids],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}
