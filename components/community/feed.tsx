"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Pin, Trash2, Send, MoreVertical, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { Post, Profile, Comment } from "@/lib/types"

interface CommunityFeedProps {
  communityId: string
  userId: string
  userProfile: Profile
  isCreator: boolean
}

export function CommunityFeed({ communityId, userId, userProfile, isCreator }: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchPosts = useCallback(async () => {
    // Parallel fetch: posts and user likes at the same time for better performance
    const [postsResult, likesResult] = await Promise.all([
      supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, display_name, avatar_url),
          comments(count),
          likes(count)
        `)
        .eq("community_id", communityId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50), // Limit posts for faster loading
      
      supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", userId),
    ])

    const { data } = postsResult
    const { data: userLikes } = likesResult

    if (data) {
      const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])

      const formattedPosts: Post[] = data.map((p) => ({
        ...p,
        comment_count: p.comments?.[0]?.count || 0,
        like_count: p.likes?.[0]?.count || 0,
        is_liked: likedPostIds.has(p.id),
      }))

      setPosts(formattedPosts)
    }
    setIsLoading(false)
  }, [communityId, userId, supabase])

  useEffect(() => {
    fetchPosts()

    // Set up realtime subscription
    const channel = supabase
      .channel(`community-${communityId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts", filter: `community_id=eq.${communityId}` },
        () => {
          fetchPosts()
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () => {
        fetchPosts()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [communityId, fetchPosts, supabase])

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    setIsSubmitting(true)

    const { error } = await supabase.from("posts").insert({
      community_id: communityId,
      author_id: userId,
      content: newPostContent.trim(),
    })

    if (!error) {
      setNewPostContent("")
      // Immediately refresh posts to show the new post
      await fetchPosts()
      // Refresh the page to update server-side data (member count, leaderboard, etc.)
      router.refresh()
    }

    setIsSubmitting(false)
  }

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (isLiked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId)
    } else {
      await supabase.from("likes").insert({
        post_id: postId,
        user_id: userId,
      })
    }
  }

  const handleDelete = async (postId: string) => {
    await supabase.from("posts").delete().eq("id", postId)
    // Refresh posts after deletion
    await fetchPosts()
    router.refresh()
  }

  const handlePin = async (postId: string, isPinned: boolean) => {
    await supabase.from("posts").update({ is_pinned: !isPinned }).eq("id", postId)
    // Refresh posts after pinning/unpinning
    await fetchPosts()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile?.avatar_url || undefined} />
              <AvatarFallback>{userProfile?.display_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share something with the community..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleCreatePost} disabled={isSubmitting || !newPostContent.trim()}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">No posts yet</h3>
            <p className="text-sm text-muted-foreground">Be the first to share something!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userId={userId}
              isCreator={isCreator}
              onLike={handleLike}
              onDelete={handleDelete}
              onPin={handlePin}
              communityId={communityId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PostCardProps {
  post: Post
  userId: string
  isCreator: boolean
  onLike: (postId: string, isLiked: boolean) => void
  onDelete: (postId: string) => void
  onPin: (postId: string, isPinned: boolean) => void
  communityId: string
}

function PostCard({ post, userId, isCreator, onLike, onDelete, onPin, communityId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const supabase = createClient()

  const isAuthor = post.author_id === userId
  const canModerate = isCreator || isAuthor

  const loadComments = async () => {
    if (!showComments) {
      setIsLoadingComments(true)
      setShowComments(true) // Show comments section immediately for better UX
      
      // Only fetch essential profile fields for faster loading
      const { data } = await supabase
        .from("comments")
        .select(`
          *,
          author:profiles!comments_author_id_fkey(id, display_name, avatar_url)
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: true })
        .limit(50) // Limit comments for performance

      if (data) setComments(data as Comment[])
      setIsLoadingComments(false)
    } else {
      setShowComments(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      author_id: userId,
      content: newComment.trim(),
    })

    if (!error) {
      setNewComment("")
      // Optimistically add the comment, then refresh
      // Reload comments with limited fields
      const { data } = await supabase
        .from("comments")
        .select(`
          *,
          author:profiles!comments_author_id_fkey(id, display_name, avatar_url)
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: true })
        .limit(50)

      if (data) setComments(data as Comment[])
    }
  }

  return (
    <Card className={post.is_pinned ? "border-primary/50 bg-primary/5" : ""}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback>{post.author?.display_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{post.author?.display_name || "Unknown"}</p>
              {post.is_pinned && <Pin className="h-3 w-3 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {canModerate && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCreator && (
                <DropdownMenuItem onClick={() => onPin(post.id, post.is_pinned)}>
                  <Pin className="mr-2 h-4 w-4" />
                  {post.is_pinned ? "Unpin" : "Pin"} Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <div className="flex w-full items-center gap-4 border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id, post.is_liked || false)}
            className={post.is_liked ? "text-red-500 hover:text-red-600" : ""}
          >
            <Heart className={`mr-1 h-4 w-4 ${post.is_liked ? "fill-current" : ""}`} />
            {post.like_count || 0}
          </Button>
          <Button variant="ghost" size="sm" onClick={loadComments}>
            <MessageCircle className="mr-1 h-4 w-4" />
            {post.comment_count || 0}
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-4 border-t pt-4">
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={comment.author?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {comment.author?.display_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-lg bg-muted p-2">
                      <p className="text-xs font-medium">{comment.author?.display_name || "Unknown"}</p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={1}
                    className="min-h-9"
                  />
                  <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
