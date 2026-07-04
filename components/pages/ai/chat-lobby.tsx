"use client"

import { useState, useEffect, useRef } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Send,
  User,
  MessageSquare,
  Search,
  Paperclip,
  Edit2,
  Pin,
  Clock,
  Briefcase,
  Smile,
  FileText
} from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  senderId: string
  messageText: string
  attachments?: { type: string; name: string; url: string }[]
  isPinned?: boolean
  createdAt: string
}

interface Room {
  id: string
  partner: { userId: string; name: string; image?: string | null }
}

export default function ChatLobby({ initialRoomId }: { initialRoomId?: string }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | null>(initialRoomId || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true)
      const res = await fetch("/api/chat/rooms")
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
        if (data.length > 0 && !activeRoomId) {
          setActiveRoomId(data[0].id)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingRooms(false)
    }
  }

  const fetchMessages = async (roomId: string) => {
    try {
      setLoadingMsgs(true)
      const res = await fetch(`/api/chat/messages?roomId=${roomId}&search=${search}`)
      if (res.ok) {
        setMessages(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMsgs(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId)
    }
  }, [activeRoomId, search])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || !activeRoomId) return
    const text = input.trim()
    setInput("")

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: activeRoomId,
          messageText: text,
          attachments: [],
        }),
      })

      if (res.ok) {
        const newMsg = await res.json()
        setMessages([...messages, newMsg])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteMessage = async (msgId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?id=${msgId}`, { method: "DELETE" })
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== msgId))
        toast.success("Message deleted")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleShareResume = async () => {
    if (!activeRoomId) return
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: activeRoomId,
          messageText: "📄 Candidate Shared Resume with Interviewer",
          attachments: [{ type: "pdf", name: "Resume.pdf", url: "#" }],
        }),
      })

      if (res.ok) {
        setMessages([...messages, await res.json()])
        toast.success("Resume shared in chat room successfully")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const activeRoom = rooms.find((r) => r.id === activeRoomId)

  return (
    <div className="space-y-6 font-sans text-xs">
      <PageHeader
        title="1-to-1 Chat Room"
        description="Discuss preparation strategies, mock feedback, or schedule adjustments with your assigned candidate/coach"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-210px)] overflow-hidden mt-4">
        {/* Left Contact Threads Panel */}
        <div className="lg:col-span-3 flex flex-col bg-card border border-slate-100 rounded-xl overflow-hidden shadow-sm h-full">
          <div className="p-4 border-b">
            <h4 className="font-bold text-slate-800 text-xs">Conversations</h4>
          </div>

          <ScrollArea className="flex-1 p-2">
            {loadingRooms ? (
              <span className="text-slate-400 block text-center py-6">Loading chats...</span>
            ) : rooms.length === 0 ? (
              <span className="text-slate-400 block text-center py-6">No chat history.</span>
            ) : (
              <div className="space-y-1">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left cursor-pointer transition-all ${
                      activeRoomId === room.id ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Avatar className="h-8.5 w-8.5 border border-slate-100 shadow-sm shrink-0">
                      <AvatarImage src={room.partner.image || undefined} />
                      <AvatarFallback className="bg-slate-100 text-slate-700 font-bold text-xs">
                        {room.partner.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs block truncate leading-relaxed">{room.partner.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Active Feed workspace */}
        <div className="lg:col-span-9 flex flex-col bg-card border border-slate-100 rounded-xl overflow-hidden shadow-sm h-full">
          {activeRoom ? (
            <>
              {/* Header */}
              <div className="p-3 bg-slate-50 border-b flex justify-between items-center shrink-0">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Avatar className="h-7 w-7 border border-slate-100 shrink-0">
                    <AvatarImage src={activeRoom.partner.image || undefined} />
                    <AvatarFallback className="bg-slate-200 text-slate-700 font-bold text-[10px]">
                      {activeRoom.partner.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {activeRoom.partner.name}
                </span>

                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search messages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 text-[11px] h-8"
                  />
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
                {messages.map((m, index) => {
                  const isMe = m.senderId !== activeRoom.partner.userId
                  const messageDate = new Date(m.createdAt)
                  const dateString = messageDate.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                  const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                  let showDateSeparator = false
                  if (index === 0) {
                    showDateSeparator = true
                  } else {
                    const prevMessage = messages[index - 1]
                    const prevDate = new Date(prevMessage.createdAt)
                    if (prevDate.toDateString() !== messageDate.toDateString()) {
                      showDateSeparator = true
                    }
                  }

                  return (
                    <div key={m.id} className="w-full space-y-3">
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {dateString}
                          </span>
                        </div>
                      )}

                      <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 max-w-[85%] rounded-lg leading-relaxed whitespace-pre-wrap ${
                          isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-50 border rounded-bl-none"
                        }`}>
                          <p className="m-0 leading-relaxed">{m.messageText}</p>
                          
                          {/* Attachments */}
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="mt-2 p-2 border rounded bg-white text-slate-700 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-red-500" />
                              <span className="font-semibold">{m.attachments[0].name}</span>
                            </div>
                          )}

                          <span className={`block text-[9px] mt-1.5 text-right ${isMe ? "text-indigo-200" : "text-slate-450"}`}>
                            {timeString}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={scrollRef} />
              </div>

              {/* Bottom input */}
              <div className="p-4 border-t bg-card shrink-0 flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={handleShareResume} title="Share Resume" className="h-10 w-10 shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage()
                  }}
                  className="text-xs h-10"
                />
                <Button onClick={handleSendMessage} disabled={!input.trim()} className="h-10 px-4 cursor-pointer bg-primary text-white font-bold">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-700">Select a Conversation</h4>
              <p className="text-[11px] text-slate-500 mt-1">Choose a contact on the left to start typing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
