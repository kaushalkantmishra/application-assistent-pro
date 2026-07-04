"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Users,
  MessageSquare,
  Hand,
  Settings,
  Sparkles,
  Play,
  Send
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

export default function VideoRoom({ bookingId }: { bookingId: string }) {
  const [camera, setCamera] = useState(true)
  const [mic, setMic] = useState(true)
  const [screenShare, setScreenShare] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [seconds, setSeconds] = useState(0)

  // Meeting local chat state
  const [chats, setChats] = useState<{ sender: string; text: string }[]>([])
  const [chatInput, setChatInput] = useState("")

  // Timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    setChats([...chats, { sender: "You", text: chatInput.trim() }])
    setChatInput("")
  }

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-white rounded-xl overflow-hidden shadow-2xl relative font-sans text-xs">
      
      {/* Header bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
        <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-400">
          <Sparkles className="h-4 w-4 animate-pulse" /> Live Video Mock Room
        </span>
        <div className="flex items-center gap-3">
          <Badge className="bg-red-650 text-white font-mono text-[10px]">{formatTime(seconds)}</Badge>
          <Badge variant="outline" className="text-slate-300 border-slate-700 text-[10px] gap-1 flex items-center">
            <Users className="h-3 w-3" /> 2 Online
          </Badge>
        </div>
      </div>

      {/* Grid: Video screens & Side chat */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden relative">
        {/* Video feed areas (3 cols) */}
        <div className="lg:col-span-3 bg-slate-950 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-y-auto">
          {/* Interviewer stream (Mocked) */}
          <div className="relative border border-slate-850 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center min-h-[220px]">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop"
              alt="Interviewer Stream"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute top-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold">
              Sarah Jenkins (Interviewer)
            </div>
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              <Badge className="bg-emerald-600 text-white text-[9px] font-bold">Active Speaker</Badge>
            </div>
          </div>

          {/* Local participant stream */}
          <div className="relative border border-slate-850 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center min-h-[220px]">
            {camera ? (
              <div className="absolute inset-0 w-full h-full bg-slate-850 flex flex-col items-center justify-center">
                <Video className="h-10 w-10 text-slate-500 mb-2" />
                <span className="text-[10px] text-slate-400 font-semibold">Camera is Active (Self Stream)</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center">
                <VideoOff className="h-10 w-10 text-red-500 mb-2 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-semibold">Your video is stopped</span>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold">
              You (Candidate)
            </div>
            <div className="absolute bottom-3 right-3 flex gap-1">
              {!mic && <Badge variant="destructive" className="text-[9px] font-bold">MUTED</Badge>}
              {handRaised && <Badge className="bg-amber-600 text-white text-[9px] font-bold">✋ HAND RAISED</Badge>}
            </div>
          </div>

          {screenShare && (
            <div className="col-span-1 md:col-span-2 relative border border-slate-800 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center min-h-[200px] mt-2">
              <div className="absolute inset-0 bg-indigo-950/20 flex flex-col items-center justify-center">
                <Monitor className="h-12 w-12 text-indigo-400 mb-2 animate-bounce" />
                <span className="text-xs font-bold text-indigo-300">You are sharing your screen</span>
                <span className="text-[10px] text-slate-400 mt-1">Other participants can see your shared window</span>
              </div>
            </div>
          )}
        </div>

        {/* Side Meeting Chat (1 col) */}
        <div className="lg:col-span-1 bg-slate-900 border-l border-slate-800 flex flex-col justify-between h-full overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5 text-indigo-400" /> Room Chat</span>
          </div>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              <div className="p-2.5 rounded bg-slate-850 space-y-0.5">
                <span className="font-bold text-indigo-400 text-[10px] block">System</span>
                <p className="text-[10.5px] text-slate-400 leading-normal">Welcome to the interview! Set your audio/video and start speaking.</p>
              </div>

              {chats.map((c, i) => (
                <div key={i} className="space-y-0.5">
                  <span className="font-bold text-indigo-455 text-[10px] block">{c.sender}</span>
                  <p className="text-[10.5px] text-slate-300 leading-normal">{c.text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-2.5 border-t border-slate-800 flex gap-1.5 shrink-0 bg-slate-900">
            <Input
              placeholder="In-call message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendChat()
              }}
              className="text-[10.5px] bg-slate-950 border-slate-800 h-8"
            />
            <Button size="icon" onClick={handleSendChat} className="h-8 w-8 bg-indigo-650 hover:bg-indigo-700 text-white shrink-0">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setMic(!mic)}
            className={`h-9 w-9 rounded-full ${mic ? "border-slate-700 bg-slate-800 text-white" : "border-red-900 bg-red-950 text-red-500"}`}
          >
            {mic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setCamera(!camera)}
            className={`h-9 w-9 rounded-full ${camera ? "border-slate-700 bg-slate-800 text-white" : "border-red-900 bg-red-950 text-red-500"}`}
          >
            {camera ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setScreenShare(!screenShare)}
            className={`h-9 w-9 rounded-full border-slate-700 ${screenShare ? "bg-indigo-600 text-white" : "bg-slate-800 text-white"}`}
          >
            <Monitor className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setHandRaised(!handRaised)}
            className={`h-9 w-9 rounded-full border-slate-700 ${handRaised ? "bg-amber-600 text-white" : "bg-slate-800 text-white"}`}
          >
            <Hand className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Button
            onClick={() => {
              toast.info("Left the interview lobby.")
              window.close();
            }}
            className="text-xs h-9 bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 px-4 rounded-lg cursor-pointer"
          >
            <PhoneOff className="h-4 w-4" /> Leave Session
          </Button>
        </div>
      </div>
    </div>
  )
}
