"use client"

import type React from "react"

interface FooterProps {
  onNavigate: (page: "home" | "about" | "contact" | "privacy") => void
  onCategorySelect: (category: string) => void
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onCategorySelect }) => {
  const handleNavClick = (e: React.MouseEvent, page: "home" | "about" | "contact" | "privacy") => {
    e.preventDefault()
    onNavigate(page)
    window.scrollTo(0, 0)
  }

  const handleCatClick = (e: React.MouseEvent, category: string) => {
    e.preventDefault()
    onCategorySelect(category)
    window.scrollTo(0, 0)
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-primary-foreground">TrendHive</h3>
            <p className="text-primary-foreground/70 mt-4 text-sm">
              Your destination for modern fashion and timeless style.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary-foreground">Shop</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <a href="#" onClick={(e) => handleCatClick(e, "All")} className="hover:text-primary-foreground">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => handleCatClick(e, "Men")} className="hover:text-primary-foreground">
                  Men
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => handleCatClick(e, "Women")} className="hover:text-primary-foreground">
                  Women
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => handleCatClick(e, "Accessories")} className="hover:text-primary-foreground">
                  Accessories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary-foreground">Company</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <a href="#" onClick={(e) => handleNavClick(e, "about")} className="hover:text-primary-foreground">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => handleNavClick(e, "contact")} className="hover:text-primary-foreground">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => handleNavClick(e, "privacy")} className="hover:text-primary-foreground">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary-foreground">Follow Us</h4>
          </div>
        </div>
      </div>
      <div className="bg-primary/90 py-4">
        <div className="container mx-auto px-4 text-center text-primary-foreground/70 text-sm">
          <p>&copy; {new Date().getFullYear()} TrendHive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
