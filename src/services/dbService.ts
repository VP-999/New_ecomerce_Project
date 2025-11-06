import {
  getProducts,
  getOrders,
  addProduct,
  updateProduct,
  deleteProduct,
  addOrder,
  updateOrder,
  addUser as addUserRow,
  findUserByEmail as findUserRow,
  addOrderItem,
} from "./supabaseService"
import { generateSalt, hashPassword } from '../lib/crypto'

/**
 * Adds a new document to a specified collection.
 */
export const addData = async (collectionName: string, data: object) => {
  try {
    if (collectionName === "products") {
      const result = await addProduct(data)
      console.log("[v0] Product added successfully with ID: ", result.id)
      return result.id
    } else if (collectionName === "orders") {
      const result = await addOrder(data)
      console.log("[v0] Order added successfully with ID: ", result.id)
      return result.id
    }
    throw new Error(`Unsupported collection: ${collectionName}`)
  } catch (e: any) {
    console.error("[v0] Error adding document: ", e)
    const errorMessage = e?.message || "Could not add document to the database."
    throw new Error(errorMessage)
  }
}

/**
 * Retrieves all documents from a specified collection.
 */
export const getData = async (collectionName: string) => {
  try {
    if (collectionName === "products") {
      return await getProducts()
    } else if (collectionName === "orders") {
      return await getOrders()
    }
    return []
  } catch (e) {
    console.error("[v0] Error getting documents: ", e)
    throw new Error("Could not retrieve documents from the database.")
  }
}

/**
 * Places an order and inserts order_items rows.
 * Returns created order id.
 */
export const placeOrder = async (
  order: {
    items: { id: string; quantity: number }[]
    total: number
    customerDetails: { name: string; address: string; email: string }
  },
  productLookup: (id: string) => { price: number } | undefined,
) => {
  // Insert into orders table (strip items)
  const base = {
    customerDetails: order.customerDetails,
    total: order.total,
    status: 'Pending',
  }
  const created = await addOrder(base as any)
  const orderId = created.id
  // Insert order_items
  for (const it of order.items) {
    const p = productLookup(it.id)
    const unit = p?.price ?? 0
    await addOrderItem({ order_id: orderId, product_id: it.id, quantity: it.quantity, unit_price: unit })
  }
  return orderId as string
}

/** Users **/
export const upsertUser = async (user: { name: string; email: string; password: string; address?: string; role?: 'customer' | 'admin' }) => {
  const existing = await findUserRow(user.email)
  if (existing) return existing
  const salt = generateSalt()
  const password_hash = await hashPassword(user.password, salt)
  return await addUserRow({ name: user.name, email: user.email, password_hash, password_salt: salt, address: user.address, role: user.role || 'customer' })
}

export const verifyUserPassword = async (email: string, password: string) => {
  const row = await findUserRow(email)
  if (!row || !row.password_salt || !row.password_hash) return null
  const computed = await hashPassword(password, row.password_salt)
  if (computed !== row.password_hash) return null
  return row
}

/**
 * Updates an existing document in a specified collection.
 */
export const updateData = async (collectionName: string, id: string, data: object) => {
  try {
    if (collectionName === "products") {
      await updateProduct(id, data)
      console.log("[v0] Product updated with ID: ", id)
    } else if (collectionName === "orders") {
      await updateOrder(id, data)
      console.log("[v0] Order updated with ID: ", id)
    }
  } catch (e) {
    console.error("[v0] Error updating document: ", e)
    throw new Error("Could not update document in the database.")
  }
}

/**
 * Deletes a document from a specified collection.
 */
export const deleteData = async (collectionName: string, id: string) => {
  try {
    if (collectionName === "products") {
      await deleteProduct(id)
      console.log("[v0] Product deleted successfully with ID: ", id)
    } else {
      throw new Error(`Unsupported collection for delete: ${collectionName}`)
    }
  } catch (e: any) {
    console.error("[v0] Error deleting document: ", e)
    const errorMessage = e?.message || "Could not delete document from the database."
    throw new Error(errorMessage)
  }
}
