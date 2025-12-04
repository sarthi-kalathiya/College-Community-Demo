export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role?: "user" | "admin" // admin role for platform admins
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  description: string | null
  image_url: string | null
  creator_id: string
  is_public: boolean
  price_in_cents: number
  stripe_price_id: string | null
  created_at: string
  updated_at: string
  creator?: Profile
  member_count?: number
}

export interface Membership {
  id: string
  user_id: string
  community_id: string
  role: "creator" | "member"
  stripe_subscription_id: string | null
  joined_at: string
  profile?: Profile
  community?: Community
}

export interface Post {
  id: string
  community_id: string
  author_id: string
  content: string
  image_url: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
  author?: Profile
  comments?: Comment[]
  likes?: Like[]
  like_count?: number
  comment_count?: number
  is_liked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  post_count: number
  comment_count: number
  total_activity: number
}

// API Response types
export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: "user" | "admin"
  avatar?: string | null
  bio?: string | null
  joinedCommunities?: number
  createdCommunities?: number
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface AdminStats {
  totalUsers: number
  totalCommunities: number
  totalRevenue: number
  recentSignups: number
  activeCommunities: number
}

export interface AdminUser {
  id: string
  name: string | null
  email: string
  role: "user" | "admin"
  communitiesCount: number
  joinedAt: string
}

export interface AdminCommunity {
  id: string
  name: string
  creator: string | null
  memberCount: number
  revenue: number
  status: "active" | "suspended" | "deleted"
}

export interface AdminTransaction {
  id: string
  amount: number
  communityName: string
  userName: string
  date: string
  platformFee: number
}
