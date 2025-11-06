type Review = {
  id: string
  productId: string
  author: string
  rating: number
  comment: string
  createdAt: string
}

const STORAGE_KEY = 'trendhive:reviews'

const SUPABASE_URL = (globalThis as any).process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'https://ydnhospjsveqncfdguxp.supabase.co'
const SUPABASE_ANON_KEY = (globalThis as any).process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function readLocal(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Review[]) : []
  } catch {
    return []
  }
}

function writeLocal(list: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {}
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  // Try Supabase REST if available (table: reviews)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?productId=eq.${productId}&select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
    if (res.ok) {
      const data = await res.json()
      return (data as any[]).map((r) => ({
        id: r.id || `${r.productId}-${r.created_at}`,
        productId: r.productId || r.product_id,
        author: r.author,
        rating: Number(r.rating) || 0,
        comment: r.comment || '',
        createdAt: r.created_at || r.createdAt || new Date().toISOString(),
      }))
    }
  } catch {}

  // Fallback local
  return readLocal().filter((r) => r.productId === productId)
}

export async function addReview(newReview: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  const review: Review = {
    ...newReview,
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
  }

  // Try Supabase
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        productId: review.productId,
        author: review.author,
        rating: review.rating,
        comment: review.comment,
        created_at: review.createdAt,
      }),
    })
    if (res.ok) {
      const [row] = await res.json()
      return {
        id: row.id || review.id,
        productId: row.productId || row.product_id || review.productId,
        author: row.author,
        rating: Number(row.rating) || 0,
        comment: row.comment || '',
        createdAt: row.created_at || review.createdAt,
      }
    }
  } catch {}

  // Fallback local
  const list = readLocal()
  list.push(review)
  writeLocal(list)
  return review
}
