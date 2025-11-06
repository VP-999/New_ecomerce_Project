"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import type { Order } from "../types"
import { getData } from "../services/dbService"
import { formatCurrencyBDT } from "../../lib/utils"

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-card border border-border rounded-xl p-6">
    <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
    {children}
  </section>
)

const UserDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const data = (await getData("orders")) as Order[]
        setOrders(data)
      } catch (e) {
        console.error("[v0] Error loading orders", e)
      }
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const userOrders = useMemo(() => {
    if (!currentUser) return []
    return orders.filter((o) => o.customerDetails.email === currentUser.email)
  }, [orders, currentUser])

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Please log in to view your dashboard</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome, {currentUser.name}</h1>
          <button onClick={logout} className="px-3 py-1.5 text-sm rounded-md border border-border bg-card hover:bg-muted text-foreground">Sign Out</button>
        </div>
        <p className="text-muted-foreground">Manage your profile and view your orders</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section title="Profile">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground">{currentUser.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground">{currentUser.email}</span></div>
              {currentUser.address && (
                <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-foreground text-right max-w-[60%]">{currentUser.address}</span></div>
              )}
            </div>
          </Section>

          <Section title="Quick Stats">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold text-foreground">{userOrders.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Orders</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold text-foreground">{formatCurrencyBDT(userOrders.reduce((s, o) => s + o.total, 0))}</div>
                <div className="text-xs text-muted-foreground mt-1">Spent</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold text-foreground">{userOrders.filter(o=>o.status!=="Delivered").length}</div>
                <div className="text-xs text-muted-foreground mt-1">In Progress</div>
              </div>
            </div>
          </Section>

          <Section title="Order Tracking">
            {loading ? (
              <div className="text-muted-foreground">Loading orders...</div>
            ) : userOrders.length === 0 ? (
              <div className="text-muted-foreground">No orders found</div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((o) => (
                  <div key={o.id} className="border border-border rounded-lg p-4 bg-background">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-foreground">Order #{o.id.substring(0,8)}...</div>
                      <div className="text-sm px-2 py-1 rounded-full border border-border bg-muted text-foreground">{o.status}</div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Total: {formatCurrencyBDT(o.total)}</div>
                    <div className="mt-2 text-xs text-muted-foreground">Shipping to: {o.customerDetails.address}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
