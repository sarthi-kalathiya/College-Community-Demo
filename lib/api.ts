// API client for frontend to call backend endpoints

const API_BASE = "/api"

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "API request failed")
  }

  return data
}

// Auth API
export const authAPI = {
  signup: (email: string, password: string, name?: string) =>
    fetchAPI<{ user: AuthUser; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    fetchAPI<{ user: AuthUser; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  google: (googleToken: string) =>
    fetchAPI<{ user: AuthUser; token: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ googleToken }),
    }),

  getProfile: () => fetchAPI<{ user: AuthUser }>("/auth/profile"),

  updateProfile: (data: { name?: string; email?: string; avatar?: string; bio?: string }) =>
    fetchAPI<{ user: AuthUser }>("/auth/profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => fetchAPI<{ message: string }>("/auth/logout", { method: "POST" }),
}

// Admin API
export const adminAPI = {
  getStats: () => fetchAPI<AdminStats>("/admin/stats"),

  getUsers: (params?: { page?: number; search?: string; role?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.search) searchParams.set("search", params.search)
    if (params?.role) searchParams.set("role", params.role)
    return fetchAPI<{ users: AdminUser[]; total: number; page: number; totalPages: number }>(
      `/admin/users?${searchParams}`,
    )
  },

  getCommunities: (params?: { page?: number; search?: string; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status) searchParams.set("status", params.status)
    return fetchAPI<{ communities: AdminCommunity[]; total: number; page: number; totalPages: number }>(
      `/admin/communities?${searchParams}`,
    )
  },

  getTransactions: (params?: { page?: number; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.startDate) searchParams.set("startDate", params.startDate)
    if (params?.endDate) searchParams.set("endDate", params.endDate)
    return fetchAPI<{ transactions: AdminTransaction[]; total: number; page: number; totalPages: number }>(
      `/admin/transactions?${searchParams}`,
    )
  },

  deleteUser: (id: string) => fetchAPI<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" }),

  updateCommunityStatus: (id: string, status: "active" | "suspended" | "deleted") =>
    fetchAPI<{ community: { id: string; status: string } }>(`/admin/communities/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
}

// Types for API responses
interface AuthUser {
  id: string
  email: string
  name: string | null
  role: "user" | "admin"
  avatar?: string | null
  bio?: string | null
  joinedCommunities?: number
  createdCommunities?: number
}

interface AdminStats {
  totalUsers: number
  totalCommunities: number
  totalRevenue: number
  recentSignups: number
  activeCommunities: number
}

interface AdminUser {
  id: string
  name: string | null
  email: string
  role: "user" | "admin"
  communitiesCount: number
  joinedAt: string
}

interface AdminCommunity {
  id: string
  name: string
  creator: string | null
  memberCount: number
  revenue: number
  status: "active" | "suspended" | "deleted"
}

interface AdminTransaction {
  id: string
  amount: number
  communityName: string
  userName: string
  date: string
  platformFee: number
}
