"use client"

import { useState, useEffect, useRef } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { AppLoader } from "@/components/app-loader"
import {
  Send,
  User,
  BrainCircuit,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  XCircle,
  Clock,
  Sparkles,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

interface Resume {
  id: string;
  title: string;
}

export default function AiAdvisorPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>("none")
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [loadingList, setLoadingList] = useState(true)

  const abortControllerRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    try {
      setLoadingList(true)
      const [convRes, resRes] = await Promise.all([
        fetch("/api/ai/advisor/conversations"),
        fetch("/api/resumes"),
      ])

      if (convRes.ok) {
        const data = await convRes.json()
        setConversations(data)
        if (data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id)
          setMessages(data[0].messages || [])
        }
      }
      if (resRes.ok) {
        setResumes(await resRes.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    // Initial fetch of conversations and user's resumes
    fetchConversations()
  }, [])

  // Auto-scroll chat feed
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, streamingText])

  const handleStartNewChat = () => {
    cancelRequest()
    setActiveConvId(null)
    setMessages([])
    setStreamingText("")
    setInput("")
  }

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
      setStreamingText("")
      toast.info("Generation cancelled.")
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessageText = input.trim()
    setInput("")

    const updatedMessages: Message[] = [...messages, { role: "user", content: userMessageText }]
    setMessages(updatedMessages)
    setLoading(true)
    setStreamingText("")

    abortControllerRef.current = new AbortController()

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          resumeId: selectedResumeId !== "none" ? selectedResumeId : undefined,
          conversationId: activeConvId || undefined,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) {
        throw new Error("Failed to connect to streaming advisor endpoint")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            const cleaned = line.trim()
            if (!cleaned || !cleaned.startsWith("data: ")) continue

            const jsonStr = cleaned.slice(6).trim()
            if (jsonStr === "[DONE]") {
              break
            }

            try {
              const parsed = JSON.parse(jsonStr)
              if (parsed.text) {
                accumulated += parsed.text
                setStreamingText(accumulated)
              }
            } catch (err) {
              // skip parse errors
            }
          }
        }
      }

      // Add assistant response to messages list
      const finalAssistantMessage: Message = { role: "assistant", content: accumulated }
      setMessages([...updatedMessages, finalAssistantMessage])
      setStreamingText("")
      
      // Reload conversation list to capture the new title / timestamp
      await fetchConversations()
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err)
        toast.error("Failed to receive advisor streaming chunk")
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleSelectConversation = (conv: Conversation) => {
    cancelRequest()
    setActiveConvId(conv.id)
    setMessages(conv.messages || [])
    setStreamingText("")
  }

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/ai/advisor/conversations?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setConversations(conversations.filter(c => c.id !== id))
        if (activeConvId === id) {
          setMessages([])
          setActiveConvId(null)
        }
        toast.success("Chat history deleted")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Message copied to clipboard")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Career Advisor"
        description="Tailor resume wording, build interview roadmap guides, or ask salary negotiation strategies"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-210px)] mt-4 overflow-hidden">
        {/* Left Side: Sessions History list & context selector */}
        <div className="lg:col-span-3 flex flex-col justify-between h-full bg-card border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b space-y-4">
            <Button onClick={handleStartNewChat} className="w-full text-xs font-bold gap-1.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4" /> New Chat Session
            </Button>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Resume Context</Label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">No Context (General chat)</SelectItem>
                  {resumes.map(r => (
                    <SelectItem key={r.id} value={r.id} className="text-xs">📄 {r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {loadingList ? (
                <span className="text-xs text-slate-400 block text-center py-6">Loading sessions...</span>
              ) : conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left cursor-pointer transition-all ${
                    activeConvId === c.id ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs block truncate leading-relaxed">{c.title}</span>
                    <span className="text-[9px] text-slate-450 block mt-0.5 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" /> {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-450 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {!loadingList && conversations.length === 0 && (
                <span className="text-xs text-slate-400 block text-center py-8">No previous chats.</span>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side: Chat Feed Workspace */}
        <div className="lg:col-span-9 flex flex-col h-full bg-card border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          {/* Active Title bar */}
          <div className="p-3 bg-slate-50 border-b flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-indigo-600" /> Career AI Advisor Mode
            </span>

            {loading && (
              <Button size="sm" variant="ghost" onClick={cancelRequest} className="h-7 text-xs text-red-500 gap-1 hover:bg-red-50 cursor-pointer font-semibold">
                <XCircle className="h-4 w-4" /> Stop Generation
              </Button>
            )}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
            {messages.length === 0 && !streamingText && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Sparkles className="h-10 w-10 text-indigo-500 animate-pulse mb-3" />
                <h4 className="text-sm font-bold text-slate-700">How can I assist you today?</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                  Ask me to optimize your resume bullet points, review a project description, create a structured career learning roadmap, or prepare you for an upcoming behavioral interview.
                </p>
              </div>
            )}

            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === "user" ? "bg-indigo-650 text-white" : "bg-slate-100 text-slate-650"
                }`}>
                  {m.role === "user" ? <User className="h-4.5 w-4.5" /> : <BrainCircuit className="h-4.5 w-4.5" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-3 rounded-lg leading-relaxed whitespace-pre-wrap ${
                    m.role === "user" ? "bg-indigo-650 text-white" : "bg-slate-50 border"
                  }`}>
                    {m.content}
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleCopyMessage(m.content)}
                      className="p-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* SSE Streaming text buffer accumulator */}
            {streamingText && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-655 flex items-center justify-center shrink-0">
                  <BrainCircuit className="h-4.5 w-4.5 animate-spin" />
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border leading-relaxed whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block h-4 w-1.5 bg-indigo-600 animate-pulse ml-0.5" />
                </div>
              </div>
            )}

            {/* Loading / Typing indicator */}
            {loading && !streamingText && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-655 flex items-center justify-center shrink-0 animate-bounce">
                  <BrainCircuit className="h-4.5 w-4.5" />
                </div>
                <div className="flex gap-1 bg-slate-50 p-3 rounded-lg border">
                  <span className="h-2 w-2 bg-slate-450 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 bg-slate-450 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 bg-slate-450 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Bottom input area */}
          <div className="p-4 border-t bg-card shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Ask your career advisor anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage()
                }}
                disabled={loading}
                className="text-xs h-10"
              />
              <Button onClick={handleSendMessage} disabled={loading || !input.trim()} className="h-10 px-4 cursor-pointer bg-primary text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
