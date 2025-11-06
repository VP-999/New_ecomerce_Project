const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ydnhospjsveqncfdguxp.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkbmhvc3Bqc3ZlcW5jZmRndXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjIzODAsImV4cCI6MjA3NTkzODM4MH0.UsJ5z6PTIY7BfDjSzhzmjY8nnxpHoPV7E8tPU4bXBV4"

interface SupabaseResponse<T> {
  data: T[] | null
  error: any
}

// Helper functions to convert between camelCase (TypeScript) and lowercase (Database)
// Supabase/PostgREST converts column names to lowercase, so we need to handle the conversion
const camelToDb = (data: any): any => {
  const dbData: any = {}
  for (const key in data) {
    // Convert camelCase to lowercase for database columns
    if (key === "imageUrl") {
      // PostgreSQL stores unquoted identifiers as lowercase, so imageUrl becomes imageurl
      dbData["imageurl"] = data[key]
    } else if (key === "customerDetails") {
      // Handle nested customer details for orders
      if (data.customerDetails) {
        dbData["customer_name"] = data.customerDetails.name
        dbData["customer_email"] = data.customerDetails.email
        dbData["customer_address"] = data.customerDetails.address
      }
    } else {
      // For other fields, keep as is (name, description, price, category, id, etc.)
      // PostgreSQL will automatically convert to lowercase if not quoted
      dbData[key] = data[key]
    }
  }
  return dbData
}

const dbToCamel = (data: any): any => {
  const camelData: any = {}
  for (const key in data) {
    // Convert lowercase/snake_case to camelCase
    if (key === "imageurl" || key === "image_url") {
      camelData["imageUrl"] = data[key]
    } else if (key === "customer_name") {
      if (!camelData["customerDetails"]) {
        camelData["customerDetails"] = {}
      }
      camelData["customerDetails"]["name"] = data[key]
    } else if (key === "customer_email") {
      if (!camelData["customerDetails"]) {
        camelData["customerDetails"] = {}
      }
      camelData["customerDetails"]["email"] = data[key]
    } else if (key === "customer_address") {
      if (!camelData["customerDetails"]) {
        camelData["customerDetails"] = {}
      }
      camelData["customerDetails"]["address"] = data[key]
    } else {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
      camelData[camelKey] = data[key]
    }
  }
  return camelData
}

export const fetchFromSupabase = async <T,>(table: string): Promise<T[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Supabase fetch error for ${table}:`, errorText)
      throw new Error(`Failed to fetch from ${table}: ${errorText}`)
    }
    
    const data: T[] = await response.json()
    console.log(`[v0] Fetched ${data.length} items from ${table}`)
    return data.map((item) => (table === "products" || table === "orders" ? dbToCamel(item) : item))
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error)
    throw error
  }
}

export const insertToSupabase = async <T,>(table: string, data: T): Promise<T> => {
  try {
    const dbData = table === "products" || table === "orders" ? camelToDb(data) : data

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(dbData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Supabase insert error for ${table}:`, errorText)
      console.error(`[v0] Request data:`, JSON.stringify(dbData, null, 2))
      throw new Error(`Failed to insert into ${table}: ${errorText}`)
    }
    
    const result: T[] = await response.json()
    if (!result || result.length === 0) {
      throw new Error(`No data returned from insert operation`)
    }
    
    const convertedResult = table === "products" || table === "orders" ? dbToCamel(result[0]) : result[0]
    console.log(`[v0] Successfully inserted into ${table}:`, convertedResult)
    return convertedResult
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error)
    throw error
  }
}

export const updateSupabase = async <T,>(table: string, id: string, data: Partial<T>): Promise<T> => {
  try {
    const dbData = table === "products" || table === "orders" ? camelToDb(data) : data
    const filterQuery = `id=eq.${id}`
    console.log(`[v0] Updating ${table} with ID ${id}:`, dbData)

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterQuery}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(dbData),
    })

    const responseText = await response.text()
    console.log(`[v0] Update response status: ${response.status}, body:`, responseText)

    if (!response.ok) {
      throw new Error(`Failed to update ${table}: ${responseText}`)
    }

    const result = responseText ? JSON.parse(responseText) : []
    if (Array.isArray(result) && result.length > 0) {
      return table === "products" || table === "orders" ? dbToCamel(result[0]) : result[0]
    }
    return table === "products" || table === "orders" ? dbToCamel(result) : (result as T)
  } catch (error) {
    console.error(`Error updating ${table}:`, error)
    throw error
  }
}

export const deleteFromSupabase = async (table: string, id: string): Promise<void> => {
  try {
    console.log(`[v0] Attempting to delete ${id} from ${table}`)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Supabase delete error for ${table}:`, errorText)
      throw new Error(`Failed to delete from ${table}: ${errorText}`)
    }
    
    console.log(`[v0] Successfully deleted ${id} from ${table}`)
  } catch (error) {
    console.error(`Error deleting from ${table}:`, error)
    throw error
  }
}

export const getProducts = async () => {
  return fetchFromSupabase("products")
}

export const getOrders = async () => {
  return fetchFromSupabase("orders")
}

export const addProduct = async (product: any) => {
  return insertToSupabase("products", product)
}

export const updateProduct = async (id: string, updates: any) => {
  return updateSupabase("products", id, updates)
}

export const deleteProduct = async (id: string) => {
  return deleteFromSupabase("products", id)
}

export const addOrder = async (order: any) => {
  return insertToSupabase("orders", order)
}

export const updateOrder = async (id: string, updates: any) => {
  return updateSupabase("orders", id, updates)
}

// Users
export const addUser = async (user: any) => {
  return insertToSupabase("users", user)
}

export const findUserByEmail = async (email: string) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(text)
    }
    const rows = await response.json()
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
  } catch (e) {
    console.error('[v0] findUserByEmail error', e)
    return null
  }
}

// Order Items
export const addOrderItem = async (item: { order_id: string; product_id: string; quantity: number; unit_price: number }) => {
  return insertToSupabase("order_items", item as any)
}
