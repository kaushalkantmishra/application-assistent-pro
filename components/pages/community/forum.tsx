"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppLoader } from "@/components/app-loader"
import { MessageSquare, Heart, Bookmark, Sparkles, Send, PenTool, Flame, Zap } from "lucide-react"
import { toast } from "sonner"

interface Comment {
  id: string
  commentText: string
  createdAt: string
  authorName: string
}

interface Post {
  id: string
  title: string
  category: string
  content: string
  likesCount: number
  commentsCount: number
  createdAt: string
  author: {
    name: string | null
    image: string | null
  }
}

export default function CommunityForum() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeCategory, setActiveCategory] = useState("All")

  // Create post wizard
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Resume Review")
  const [content, setContent] = useState("")
  const [submittingPost, setSubmittingPost] = useState(false)

  // Comments/Dialogue state
  const [activePostForComments, setActivePostForComments] = useState<string | null>(null)
  const [postComments, setPostComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [activeCategory])

  const loadPosts = () => {
    setLoading(true)
    fetch(`/api/community/posts?category=${activeCategory}`)
      .then(res => res.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : [])
        setLoading(false)
      }).catch(e => {
        console.error(e)
        setLoading(false)
      })
  }

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both title and content for your post")
      return
    }

    try {
      setSubmittingPost(true)
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          content: content.trim(),
        }),
      })

      if (res.ok) {
        toast.success("Post published to community board!")
        setTitle("")
        setContent("")
        setShowCreate(false)
        loadPosts()
      } else {
        throw new Error("Failed to create post")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmittingPost(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch("/api/community/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likesCount: data.liked ? p.likesCount + 1 : Math.max(p.likesCount - 1, 0)
            }
          }
          return p
        }))
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleLoadComments = async (postId: string) => {
    if (activePostForComments === postId) {
      setActivePostForComments(null)
      return
    }
    setActivePostForComments(postId)
    setPostComments([])
    
    // In mockup/simplified code comments list, seed 2 comments if none
    const mockComments: Comment[] = [
      { id: "c1", commentText: "Excellent advice, this really helped clean up my resume template!", createdAt: new Date().toISOString(), authorName: "Arjun Mehta" },
      { id: "c2", commentText: "Can you provide some examples for React system designs?", createdAt: new Date().toISOString(), authorName: "Priya Sharma" }
    ]
    setPostComments(mockComments)
  }

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return
    try {
      setSubmittingComment(true)
      const res = await fetch("/api/community/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          commentText: commentText.trim(),
        }),
      })
      if (res.ok) {
        const newComm = await res.json()
        setPostComments(prev => [
          ...prev,
          {
            id: newComm.id,
            commentText: newComm.commentText,
            createdAt: newComm.createdAt,
            authorName: "You",
          }
        ])
        setCommentText("")
        setPosts(posts.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
        toast.success("Comment added!")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  const categoriesList = ["All", "Resume Review", "Interview Experience", "Coding", "Career Advice", "General"]

  return (
    <div className="space-y-8 font-sans text-xs max-w-6xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <PageHeader
          title="Community Discussion Forums"
          description="Engage with other candidates, share resume reviewer feedback, discuss system designs, and learn together"
        />
        {!showCreate && (
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 px-4 h-9.5 rounded-lg shadow-sm cursor-pointer"
          >
            <PenTool className="h-4 w-4" /> Create Discussion Post
          </Button>
        )}
      </div>

      {showCreate ? (
        <Card className="shadow-md border-indigo-100 overflow-hidden animate-in fade-in-50 duration-200">
          <CardHeader className="pb-4 border-b bg-indigo-50/10">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-indigo-650" /> Publish a Discussion Thread
            </CardTitle>
            <CardDescription className="text-xs">Provide a clear title, select the appropriate category, and write detailed content questions.</CardDescription>
          </CardHeader>
          <CardContent className="py-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Post Title</Label>
              <Input
                placeholder="e.g. Tips on cleaning up work experience bullets for React Developer role"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-9.5"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Category Topic</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="Resume Review" className="text-xs">Resume Review</SelectItem>
                  <SelectItem value="Interview Experience" className="text-xs">Interview Experience</SelectItem>
                  <SelectItem value="Coding" className="text-xs">Coding / DSA</SelectItem>
                  <SelectItem value="Career Advice" className="text-xs">Career Advice</SelectItem>
                  <SelectItem value="General" className="text-xs">General Discussion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Thread Content</Label>
              <Textarea
                placeholder="Write your advice, questions or details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="text-xs leading-relaxed"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 py-3 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={submittingPost}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9"
            >
              {submittingPost ? "Publishing Thread..." : "Publish Post"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Categories Tab list (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1.5">Discussion Categories</h4>
            <div className="flex flex-col gap-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer transition-all ${
                    activeCategory === cat ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Feed Workspace (9 cols) */}
          <div className="lg:col-span-9 space-y-5">
            {loading ? (
              <AppLoader message="Retrieving discussion boards..." />
            ) : posts.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-xl bg-slate-50/50">
                <MessageSquare className="h-10 w-10 text-slate-350 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-xs">No Discussion Threads Yet</h4>
                <p className="text-slate-500 mt-1">Be the first to publish a post in this category!</p>
                <Button onClick={() => setShowCreate(true)} className="mt-4 text-xs h-9 bg-indigo-600 text-white font-bold">
                  Create Post
                </Button>
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="shadow-sm border border-slate-100 hover:border-slate-200 transition-colors">
                  <CardHeader className="pb-2.5">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border shrink-0">
                          <AvatarImage src={post.author.image || undefined} />
                          <AvatarFallback className="bg-slate-100 text-[10px] font-bold text-slate-700">
                            {post.author.name ? post.author.name[0] : "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-bold text-slate-800 block text-[11.5px]">{post.author.name || "Anonymous User"}</span>
                          <span className="text-[9.5px] text-slate-400 block mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-150 border-none font-bold text-[9px] uppercase tracking-wide">
                        {post.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-extrabold text-slate-850 mt-3.5 leading-normal">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </CardContent>
                  <CardFooter className="py-2.5 bg-slate-50/40 border-t flex justify-start gap-5 text-slate-500 font-medium">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1 hover:text-red-500 cursor-pointer transition-colors"
                    >
                      <Heart className="h-4 w-4" /> {post.likesCount} Likes
                    </button>
                    <button
                      onClick={() => handleLoadComments(post.id)}
                      className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" /> {post.commentsCount} Comments
                    </button>
                  </CardFooter>

                  {/* Comments thread expander */}
                  {activePostForComments === post.id && (
                    <div className="p-4 border-t bg-slate-50/50 space-y-4 animate-in slide-in-from-top-1 duration-150">
                      <h5 className="font-bold text-slate-750 text-[10.5px]">Comments log</h5>
                      
                      <div className="space-y-3">
                        {postComments.map((comm) => (
                          <div key={comm.id} className="p-3 border rounded-xl bg-white shadow-xs">
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-800 text-[10px]">{comm.authorName}</span>
                              <span className="text-[8.5px] text-slate-450">{new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-600 mt-1 leading-relaxed text-[10.5px]">{comm.commentText}</p>
                          </div>
                        ))}
                      </div>

                      {/* Add comment box */}
                      <div className="flex gap-2 pt-2">
                        <Input
                          placeholder="Type your comment response..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="text-xs h-9 bg-white"
                        />
                        <Button
                          onClick={() => handleAddComment(post.id)}
                          disabled={submittingComment || !commentText.trim()}
                          className="bg-slate-800 hover:bg-slate-750 text-white font-bold h-9 px-4 shrink-0 text-xs gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5" /> Post
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}
