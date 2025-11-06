"use client"

import type React from "react"
import { useState } from "react"
import { CartIcon, SearchIcon, UserIcon, MenuIcon, XIcon } from "./icons"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"

type HeaderProps = {
  onToggleCart: () => void
  onToggleSearch: () => void
  onNavigate: (page: "about" | "contact" | "privacy") => void
  onCategorySelect: (category: string) => void
  onOpenUser?: () => void
}

const Header: React.FC<HeaderProps> = ({ onToggleCart, onToggleSearch, onNavigate, onCategorySelect, onOpenUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentUser, setView, logout } = useAuth()
  const { itemCount } = useCart()

  const handleAuthClick = () => {
    if (currentUser) {
      if (onOpenUser) {
        onOpenUser()
        return
      }
      logout()
    } else {
      setView("login")
    }
  }

  const mainNavLinks = ["Men", "Women", "Accessories"]
  const secondaryNavLinks: { label: "About" | "Contact" | "Privacy"; page: "about" | "contact" | "privacy" }[] = [
    { label: "About", page: "about" },
    { label: "Contact", page: "contact" },
    { label: "Privacy", page: "privacy" },
  ]

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="w-full bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
        <p>Free shipping on orders over ৳5000 • Free returns</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about' as any) /* placeholder to satisfy TS */}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => onNavigate('about' as any)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => onNavigate('privacy' as any)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
            >
              TrendHive
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {mainNavLinks.map((link) => (
              <button
                key={link}
                onClick={() => onCategorySelect(link)}
                className="text-foreground hover:text-primary transition-colors font-medium text-sm relative group"
              >
                {link}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button
              onClick={onToggleSearch}
              className="text-foreground hover:text-primary transition-colors p-2 hover:bg-muted rounded-md"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
            <button
              onClick={onToggleCart}
              className="relative text-foreground hover:text-primary transition-colors p-2 hover:bg-muted rounded-md"
              aria-label="Shopping cart"
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={handleAuthClick}
              className="text-foreground hover:text-primary transition-colors p-2 hover:bg-muted rounded-md"
              aria-label={currentUser ? "Account" : "Login"}
            >
              <UserIcon />
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-in fade-in slide-in-from-top-2">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-4">
              {mainNavLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => {
                    onCategorySelect(link)
                    setIsMenuOpen(false)
                  }}
                  className="text-foreground hover:text-primary text-left font-medium transition-colors py-2"
                >
                  {link}
                </button>
              ))}
              <div className="border-t border-border pt-4 mt-2">
                {secondaryNavLinks.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => {
                      onNavigate(item.page)
                      setIsMenuOpen(false)
                    }}
                    className="text-muted-foreground hover:text-primary text-left w-full py-2 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
