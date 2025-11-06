"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"
import { formatCurrencyBDT } from "../../lib/utils"
import type { Product, Order } from "../types"
import { XMarkIcon, TrashIcon } from "./icons"

interface CartProps {
  isOpen: boolean
  onToggle: () => void
  onPlaceOrder: (newOrder: Omit<Order, "id" | "status">) => Promise<string>
  products: Product[]
}

const Cart: React.FC<CartProps> = ({ isOpen, onToggle, onPlaceOrder, products }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, itemCount } = useCart()
  const { currentUser, setView } = useAuth()

  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<'cod'>("cod")
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    if (currentUser && isCheckingOut) {
      setCustomerName(currentUser.name)
      setCustomerAddress(currentUser.address || "")
    }
  }, [currentUser, isCheckingOut])

  const cartDetails = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.id)
        return { ...item, product }
      })
      .filter((item) => item.product) // Filter out items where product is not found
  }, [cart, products])

  const subtotal = useMemo(() => {
    return cartDetails.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
  }, [cartDetails])

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount)
  }, [subtotal, discount])

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase()
    if (!code) {
      setDiscount(0)
      return
    }
    // Simple promo: SAVE10 = 10% off
    if (code === 'SAVE10') {
      setDiscount(Number((subtotal * 0.10).toFixed(2)))
      alert('Promo applied: 10% off')
    } else {
      alert('Invalid promo code')
      setDiscount(0)
    }
  }

  const handleCheckout = () => {
    if (cart.length > 0) {
      if (currentUser) {
        setIsCheckingOut(true)
      } else {
        alert("Please log in to proceed to checkout.")
        onToggle() // Close cart
        setView("login") // Show login page
      }
    }
  }

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      alert("You must be logged in to place an order.")
      return
    }
    try {
      const newOrderId = await onPlaceOrder({
        items: cart,
        total: total,
        customerDetails: { name: customerName, address: customerAddress, email: currentUser.email },
      })
      clearCart()
      setOrderPlaced(true)
      setPlacedOrderId(newOrderId)
    } catch (error) {
      console.error('[v0] Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  const handleBackToCart = () => {
    setIsCheckingOut(false)
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-foreground/30 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onToggle}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-border bg-card">
            <h2 className="text-2xl font-bold text-card-foreground">Shopping Cart</h2>
            <button onClick={onToggle} className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground">
              <XMarkIcon />
            </button>
          </div>

          {orderPlaced ? (
            <div className="p-6 flex-grow overflow-y-auto flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Order Confirmed</h3>
              <p className="text-muted-foreground mb-6">Thank you for your order! We will process it soon.</p>
              {placedOrderId && (
                <p className="text-sm text-muted-foreground mb-8">Order ID: <span className="font-mono">#{placedOrderId.substring(0,8)}</span></p>
              )}
              <button onClick={onToggle} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90">Close</button>
            </div>
          ) : isCheckingOut ? (
            <div className="p-6 flex-grow overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Shipping Details</h3>
              <form onSubmit={handleConfirmOrder}>
                <p className="text-sm text-muted-foreground mb-6 bg-secondary/20 p-3 rounded-lg">
                  Confirm your shipping details. We'll process your order shortly.
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-foreground mb-2">
                      Shipping Address
                    </label>
                    <textarea
                      id="address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
                    />
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Payment Method</h4>
                    <label className="flex items-center gap-2 text-foreground">
                      <input type="radio" checked={paymentMethod==='cod'} onChange={() => setPaymentMethod('cod')} />
                      Cash on Delivery
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Confirm Order
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToCart}
                    className="w-full px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-semibold"
                  >
                    Back to Cart
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {itemCount > 0 ? (
                <>
                  <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {cartDetails.map(
                      (item) =>
                        item.product && (
                          <div key={item.id} className="flex gap-4 p-4 bg-card rounded-lg border border-border">
                            <img
                              src={item.product.imageUrl || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-20 h-24 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex-grow">
                              <h4 className="font-semibold text-card-foreground text-sm">{item.product.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatCurrencyBDT((item.product.price * item.quantity))}
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-2 py-1 border border-input rounded hover:bg-muted text-foreground"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value, 10))}
                                  className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground text-sm"
                                />
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-2 py-1 border border-input rounded hover:bg-muted text-foreground"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              aria-label="Remove item"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        ),
                    )}
                  </div>

                  <div className="border-t border-border p-6 bg-card space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrencyBDT(subtotal)}</span>
                      </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e)=>setPromoCode(e.target.value)}
                        placeholder="Promo code"
                        className="flex-1 px-3 py-2 border border-input rounded bg-background text-foreground text-sm"
                      />
                      <button onClick={applyPromo} className="px-3 py-2 bg-muted rounded border border-border text-sm">Apply</button>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>- {formatCurrencyBDT(discount)}</span>
                      </div>
                    )}
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                    <div className="border-t border-border pt-2 flex justify-between font-bold text-lg text-foreground">
                        <span>Total</span>
                      <span>{formatCurrencyBDT(total)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-grow flex flex-col justify-center items-center text-center p-6">
                  <p className="text-muted-foreground text-lg">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-2">Start shopping to add items!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Cart
