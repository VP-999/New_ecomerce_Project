"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Product, Order } from "./types"
import { CartProvider } from "./contexts/CartContext"
import { AuthProvider } from "./contexts/AuthContext"
import { useAuth } from "./contexts/AuthContext"
import Header from "./components/Header"
import UserDashboard from "./components/UserDashboard"
import Footer from "./components/Footer"
import AdminDashboard from "./components/AdminDashboard"
import SearchModal from "./components/SearchModal"
import Cart from "./components/Cart"
import { LoadingIcon } from "./components/icons"
import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import ForgotPasswordPage from "./components/ForgotPasswordPage"
import AboutPage from "./components/AboutPage"
import ContactPage from "./components/ContactPage"
import PrivacyPolicyPage from "./components/PrivacyPolicyPage"
import ProductsPage from "./components/ProductsPage"
import ProductDetailPage from "./components/ProductDetailPage"
import ProductCard from "./components/ProductCard"
import { WishlistProvider } from "./contexts/WishlistContext"
import { getData, placeOrder } from "./services/dbService"
import type { SearchModalRef } from "./components/SearchModal"

const Hero: React.FC<{ onShopNow: () => void }> = ({ onShopNow }) => (
  <div
    className="relative h-[70vh] bg-cover bg-center text-card-foreground flex items-center justify-center overflow-hidden"
    style={{ backgroundImage: "url('https://cdn.pixabay.com/photo/2016/11/19/15/40/clothes-1839935_640.jpg')" }}
  >
    <div className="absolute inset-0 bg-foreground/20"></div>
    <div className="relative z-10 text-center p-4">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white drop-shadow-lg">
        Style That Defines You
      </h1>
      <p className="mt-4 text-lg md:text-2xl font-light text-white drop-shadow-md max-w-2xl mx-auto">
        Discover trending fashion, accessories, and lifestyle products for modern you.
      </p>
      <div className="mt-8">
        <button
          onClick={onShopNow}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Shop Now
        </button>
      </div>
    </div>
  </div>
)

const FeaturedCategories: React.FC<{ onCategorySelect: (category: string) => void }> = ({ onCategorySelect }) => {
  const categories = [
    { name: "Men", imageUrl: "https://cdn.pixabay.com/photo/2024/11/08/05/28/man-9182458_640.jpg" },
    { name: "Women", imageUrl: "https://cdn.pixabay.com/photo/2018/01/15/08/34/woman-3083453_640.jpg" },
    { name: "Accessories", imageUrl: "https://cdn.pixabay.com/photo/2016/03/27/22/05/necktie-1284463_640.jpg" },
  ]
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Shop by Category</h2>
          <p className="text-muted-foreground">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => onCategorySelect(cat.name)}
              className="relative h-96 group overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={cat.imageUrl || "/placeholder.svg"}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors duration-300 flex items-center justify-center">
                <button className="text-card-foreground text-3xl font-bold border-2 border-card-foreground px-8 py-4 hover:bg-card-foreground hover:text-foreground transition-all rounded-lg">
                  {cat.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const StorePage: React.FC<{
  onShopNow: () => void
  onCategorySelect: (category: string) => void
  products: Product[]
  onProductClick?: (product: Product) => void
}> = ({ onShopNow, onCategorySelect, products, onProductClick }) => {
  const featuredProducts = products.slice(0, 4)
  return (
    <>
      <Hero onShopNow={onShopNow} />
      <FeaturedCategories onCategorySelect={onCategorySelect} />
      {/* Featured Products Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Check out our best-selling items</p>
            </div>
            <button
              onClick={onShopNow}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg transition-all"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onProductClick={onProductClick} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

type PageView = "store" | "products" | "about" | "contact" | "privacy" | "product-detail" | "user"

const AppContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<PageView>(() => {
    try {
      const saved = localStorage.getItem('trendhive:page') as PageView | null
      return (saved as PageView) || 'store'
    } catch {
      return 'store'
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const { currentUser, setView, view } = useAuth()
  const searchModalRef = useRef<SearchModalRef>(null)

  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Classic T-Shirt",
      description: "Comfortable and stylish classic t-shirt",
      price: 29.99,
      category: "Men",
      imageUrl: "https://cdn.pixabay.com/photo/2023/05/30/23/17/t-shirt-8027987_640.jpg",
    },
    {
      id: "2",
      name: "Elegant Dress",
      description: "Perfect for any occasion",
      price: 59.99,
      category: "Women",
      imageUrl: "https://cdn.pixabay.com/photo/2023/09/01/17/16/dress-8224717_640.jpg",
    },
    {
      id: "3",
      name: "Designer Sunglasses",
      description: "UV protection and stylish design",
      price: 89.99,
      category: "Accessories",
      imageUrl: "https://cdn.pixabay.com/photo/2017/01/04/15/38/sunglasses-1951652_640.jpg",
    },
    {
      id: "4",
      name: "Premium Jacket",
      description: "Stylish winter jacket",
      price: 129.99,
      category: "Men",
      imageUrl: "https://cdn.pixabay.com/photo/2016/12/11/17/38/clothing-1899161_640.jpg",
    },
    {
      id: "5",
      name: "Casual Sneakers",
      description: "Comfortable everyday shoes",
      price: 79.99,
      category: "Accessories",
      imageUrl: "https://cdn.pixabay.com/photo/2023/04/21/09/15/shoe-7941046_640.jpg",
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const dbProducts = await getData("products")
        console.log("[v0] Products from database:", dbProducts)
        if (dbProducts && dbProducts.length > 0) {
          // Ensure every product has a rating (0-5). If missing, assign a default value.
          const withRatings = (dbProducts as Product[]).map((p) =>
            typeof p.rating === "number" ? p : { ...p, rating: Math.max(3, Math.min(5, Math.round((Math.random() * 2 + 3) * 10) / 10)) }
          )
          setProducts(withRatings)
        } else {
          console.log("[v0] No products in database, using mock data")
          const withRatings = mockProducts.map((p) => ({ ...p, rating: Math.max(3, Math.min(5, Math.round((Math.random() * 2 + 3) * 10) / 10)) }))
          setProducts(withRatings as Product[])
        }
      } catch (error) {
        console.error("[v0] Error fetching products from database:", error)
        const withRatings = mockProducts.map((p) => ({ ...p, rating: Math.max(3, Math.min(5, Math.round((Math.random() * 2 + 3) * 10) / 10)) }))
        setProducts(withRatings as Product[])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleShopNow = () => {
    setCurrentPage("products")
    try { localStorage.setItem('trendhive:page','products') } catch {}
    setSelectedCategory(null)
  }

  const handleCategorySelect = (category: string) => {
    setCurrentPage("products")
    try { localStorage.setItem('trendhive:page','products') } catch {}
    setSelectedCategory(category)
  }

  const handleToggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  // Auto-open cart when items are added
  useEffect(() => {
    const onAdd = () => setIsCartOpen(true)
    window.addEventListener("cart:add", onAdd as EventListener)
    return () => window.removeEventListener("cart:add", onAdd as EventListener)
  }, [])

  // Allow children (e.g., AdminDashboard) to navigate home without direct props
  useEffect(() => {
    const onGoHome = () => {
      setCurrentPage("store")
      try { localStorage.setItem('trendhive:page','store') } catch {}
    }
    window.addEventListener("navigate:home", onGoHome as EventListener)
    return () => window.removeEventListener("navigate:home", onGoHome as EventListener)
  }, [])

  const handleToggleSearch = () => {
    if (searchModalRef.current) {
      searchModalRef.current.toggle()
    }
  }

  const handleNavigate = (page: "about" | "contact" | "privacy" | "home") => {
    if (page === "home") {
      setCurrentPage("store")
      try { localStorage.setItem('trendhive:page','store') } catch {}
      setSelectedCategory(null)
      setSelectedProductId(null)
    } else {
      setCurrentPage(page as PageView)
      try { localStorage.setItem('trendhive:page', page) } catch {}
      setSelectedProductId(null)
    }
  }

  const handleProductClick = (product: Product) => {
    setSelectedProductId(product.id)
    setCurrentPage("product-detail")
    try { localStorage.setItem('trendhive:page','product-detail') } catch {}
  }

  const handleBackFromProduct = () => {
    setSelectedProductId(null)
    setCurrentPage("products")
    try { localStorage.setItem('trendhive:page','products') } catch {}
  }

  const handleOpenUser = () => {
    setCurrentPage("user")
    try { localStorage.setItem('trendhive:page','user') } catch {}
  }

  const handlePlaceOrder = async (newOrder: Omit<Order, "id" | "status">): Promise<string> => {
    try {
      const id = await placeOrder(newOrder as any, (pid) => products.find((p) => p.id === pid))
      const order: Order = { ...newOrder, id, status: "Pending" }
      setOrders((prev) => [...prev, order])
      return id
    } catch (e) {
      console.error('[v0] placeOrder failed, falling back to local id', e)
      const fallbackId = Date.now().toString()
      const order: Order = { ...newOrder, id: fallbackId, status: "Pending" }
      setOrders((prev) => [...prev, order])
      return fallbackId
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onToggleCart={handleToggleCart}
        onToggleSearch={handleToggleSearch}
        onNavigate={handleNavigate}
        onCategorySelect={handleCategorySelect}
        onOpenUser={handleOpenUser}
      />
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingIcon />
          </div>
        ) : currentUser?.role === "admin" ? (
          <AdminDashboard />
        ) : view === "login" ? (
          <LoginPage />
        ) : view === "register" ? (
          <RegisterPage />
        ) : view === "forgot" ? (
          <ForgotPasswordPage />
        ) : currentPage === "about" ? (
          <AboutPage />
        ) : currentPage === "contact" ? (
          <ContactPage />
        ) : currentPage === "privacy" ? (
          <PrivacyPolicyPage />
        ) : currentPage === "products" ? (
          <ProductsPage selectedCategory={selectedCategory} products={products} onProductClick={handleProductClick} />
        ) : currentPage === "product-detail" && selectedProductId ? (
          <ProductDetailPage
            productId={selectedProductId}
            products={products}
            onBack={handleBackFromProduct}
          />
        ) : currentUser && currentPage === "user" ? (
          <UserDashboard />
        ) : (
          <StorePage onShopNow={handleShopNow} onCategorySelect={handleCategorySelect} products={products} onProductClick={handleProductClick} />
        )}
      </main>
      <Footer onNavigate={handleNavigate} onCategorySelect={handleCategorySelect} />
      <Cart isOpen={isCartOpen} onToggle={handleToggleCart} onPlaceOrder={handlePlaceOrder} products={products} />
      <SearchModal ref={searchModalRef} products={products} onProductClick={handleProductClick} />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
