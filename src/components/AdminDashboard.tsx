import { formatCurrencyBDT } from "../../lib/utils"
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { type Product, type Order, OrderStatus } from "../types"
import { useAuth } from "../contexts/AuthContext"
import { addData, getData, updateData, deleteData } from "../services/dbService"
import Modal from "./Modal"
import ProductForm from "./ProductForm"
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  SignOutIcon,
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  LoadingIcon,
} from "./icons"

const Sidebar: React.FC<{
  activeView: string
  setActiveView: React.Dispatch<React.SetStateAction<"dashboard" | "products" | "orders">>
}> = ({ activeView, setActiveView }) => {
  const { logout } = useAuth()
  return (
    <div className="w-64 bg-primary text-primary-foreground flex flex-col shadow-lg">
      <div className="h-20 flex items-center justify-center bg-primary/95 border-b border-primary/30">
        <h1 className="text-xl font-bold">TrendHive Admin</h1>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          <li>
            <button
              onClick={() => setActiveView("dashboard")}
              className={`flex items-center w-full text-left px-4 py-3 rounded-md transition-colors ${activeView === "dashboard" ? "bg-accent text-accent-foreground" : "hover:bg-primary/80"}`}
            >
              <ChartBarIcon /> <span className="ml-3">Dashboard</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveView("products")}
              className={`flex items-center w-full text-left px-4 py-3 mt-2 rounded-md transition-colors ${activeView === "products" ? "bg-accent text-accent-foreground" : "hover:bg-primary/80"}`}
            >
              <CubeIcon /> <span className="ml-3">Products</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveView("orders")}
              className={`flex items-center w-full text-left px-4 py-3 mt-2 rounded-md transition-colors ${activeView === "orders" ? "bg-accent text-accent-foreground" : "hover:bg-primary/80"}`}
            >
              <ShoppingCartIcon /> <span className="ml-3">Orders</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-primary/30">
        <button
          onClick={logout}
          className="flex items-center w-full text-left px-4 py-3 rounded-md hover:bg-primary/80 transition-colors"
        >
          <SignOutIcon /> <span className="ml-3">Sign Out</span>
        </button>
      </div>
    </div>
  )
}

const DashboardView: React.FC<{ products: Product[]; orders: Order[] }> = ({ products, orders }) => {
  const totalRevenue = orders.filter((o) => o.status === "Delivered").reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter((o) => o.status === "Pending").length
  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow">
          <h3 className="text-muted-foreground font-semibold text-sm uppercase">Total Products</h3>
          <p className="text-4xl font-bold mt-3 text-primary">{products.length}</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow">
          <h3 className="text-muted-foreground font-semibold text-sm uppercase">Total Orders</h3>
          <p className="text-4xl font-bold mt-3 text-primary">{orders.length}</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow">
          <h3 className="text-muted-foreground font-semibold text-sm uppercase">Total Revenue</h3>
          <p className="text-4xl font-bold mt-3 text-primary">{formatCurrencyBDT(totalRevenue)}</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow">
          <h3 className="text-muted-foreground font-semibold text-sm uppercase">Pending Orders</h3>
          <p className="text-4xl font-bold mt-3 text-accent">{pendingOrders}</p>
        </div>
      </div>
    </div>
  )
}

const ProductsView: React.FC<{
  products: Product[]
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  onAdd: () => void
}> = ({ products, onEdit, onDelete, onAdd }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold text-foreground">Products</h2>
      <button
        onClick={onAdd}
        className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
      >
        <PlusIcon /> <span className="ml-2">Add Product</span>
      </button>
    </div>
    <div className="bg-card shadow-md rounded-lg overflow-x-auto border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Product
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Price
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-10">
                    <img
                      className="h-12 w-10 rounded-md object-cover object-top"
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-foreground">{product.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{product.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatCurrencyBDT(product.price)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(product)} className="text-accent hover:text-accent/80 mr-4">
                  <PencilIcon />
                </button>
                <button onClick={() => onDelete(product.id)} className="text-destructive hover:text-destructive/80">
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const OrdersView: React.FC<{ orders: Order[]; onUpdateStatus: (id: string, status: OrderStatus) => void }> = ({
  orders,
  onUpdateStatus,
}) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return "bg-yellow-100/50 text-yellow-700 border border-yellow-200"
      case OrderStatus.Shipped:
        return "bg-blue-100/50 text-blue-700 border border-blue-200"
      case OrderStatus.Delivered:
        return "bg-green-100/50 text-green-700 border border-green-200"
      case OrderStatus.Cancelled:
        return "bg-red-100/50 text-red-700 border border-red-200"
      default:
        return "bg-muted text-muted-foreground border border-border"
    }
  }
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-foreground">Orders</h2>
      <div className="bg-card shadow-md rounded-lg overflow-x-auto border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  #{order.id.substring(0, 7)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{order.customerDetails.name}</div>
                  <div className="text-sm text-muted-foreground">{order.customerDetails.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatCurrencyBDT(order.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} focus:outline-none focus:ring-0`}
                  >
                    {Object.values(OrderStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "products" | "orders">("dashboard")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { logout } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const productData = await getData("products")
        const orderData = await getData("orders")
        setProducts(productData as Product[])
        setOrders(orderData as Order[])
      } catch (error) {
        console.error("Error fetching data:", error)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [activeView])

  const refreshProducts = async () => {
    const productData = await getData("products")
    setProducts(productData as Product[])
  }

  const refreshOrders = async () => {
    const orderData = await getData("orders")
    setOrders(orderData as Order[])
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleFormSubmit = async (productData: Omit<Product, "id"> | Product) => {
    try {
      if ("id" in productData && productData.id) {
        // Editing existing product
      const { id, ...data } = productData
        console.log("[v0] Updating product with ID:", id)
        console.log("[v0] Update data:", data)
      await updateData("products", id, data)
        console.log("[v0] Product updated successfully")
    } else {
        // Adding new product
        console.log("[v0] Adding new product:", productData)
      await addData("products", productData)
        console.log("[v0] Product added successfully")
    }
    closeModal()
      await refreshProducts()
    } catch (error) {
      console.error("[v0] Error in handleFormSubmit:", error)
      console.error("[v0] Product data:", productData)
      alert(`Error: ${error instanceof Error ? error.message : "Failed to save product"}`)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
      await deleteData("products", productId)
        console.log("[v0] Product deleted successfully")
        await refreshProducts()
      } catch (error) {
        console.error("[v0] Error deleting product:", error)
        alert(`Error: ${error instanceof Error ? error.message : "Failed to delete product"}`)
      }
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateData("orders", orderId, { status })
    refreshOrders()
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                try { localStorage.setItem('trendhive:page','store') } catch {}
                window.dispatchEvent(new CustomEvent('navigate:home'))
              }}
              className="px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-sm"
            >
              Back to Store
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingIcon />
            <span className="ml-4 text-xl text-foreground">Loading Dashboard...</span>
          </div>
        ) : (
          <>
            {activeView === "dashboard" && <DashboardView products={products} orders={orders} />}
            {activeView === "products" && (
              <ProductsView
                products={products}
                onAdd={openAddModal}
                onEdit={openEditModal}
                onDelete={handleDeleteProduct}
              />
            )}
            {activeView === "orders" && <OrdersView orders={orders} onUpdateStatus={handleUpdateOrderStatus} />}
          </>
        )}
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h3 className="text-2xl font-bold mb-4 text-foreground">
          {editingProduct ? "Edit Product" : "Add New Product"}
        </h3>
        <ProductForm onSubmit={handleFormSubmit} product={editingProduct} />
      </Modal>
    </div>
  )
}

export default AdminDashboard
