"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AppLoader } from "@/components/app-loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MessageSquare,
  Users as UsersIcon,
  Hand,
  PhoneOff,
  Settings,
  ShieldAlert,
  Send,
  Lock,
  Unlock,
  VolumeX,
  Volume2,
  Clock,
  Wifi,
  ExternalLink,
  ChevronRight,
  Maximize,
  Smile
} from "lucide-react"
import { toast } from "sonner"

interface MeetingWorkspaceProps {
  roomId: string
}

interface ChatMessage {
  id: string
  messageText: string
  createdAt: string
  senderId: string
  sender: {
    name: string | null
    image: string | null
  }
}

export default function MeetingWorkspace({ roomId }: MeetingWorkspaceProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)

  // Media states
  const [micOn, setMicOn] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [raisedHand, setRaisedHand] = useState(false)
  const [isHost, setIsHost] = useState(false)

  // Side drawers
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | null>(null)

  // System states
  const [waitingRoom, setWaitingRoom] = useState(true)
  const [meetingEnded, setMeetingEnded] = useState(false)
  const [meetingLocked, setMeetingLocked] = useState(false)
  const [remoteMuted, setRemoteMuted] = useState(false)
  const [networkQuality, setNetworkQuality] = useState("excellent")

  // Booking & Room Details
  const [roomName, setRoomName] = useState("Interview Workspace")
  const [candidateName, setCandidateName] = useState("Candidate")
  const [interviewerName, setInterviewerName] = useState("Interviewer")
  const [duration, setDuration] = useState(45)
  const [roleName, setRoleName] = useState("Software Engineer")

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState("")

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0)

  // Video Ref for actual local WebRTC stream
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // 1. Fetch Room particulars
    fetch(`/api/meetings/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast.error(data.error)
          setLoading(false)
          return
        }
        
        setIsHost(data.payload.role === "host")
        setRoomName(data.payload.roomId)
        setCandidateName(data.payload.role === "host" ? "Candidate" : data.payload.name)
        
        // Mock load interview details
        setInterviewerName(data.payload.role === "host" ? data.payload.name : "Sarah Jenkins")
        setLoading(false)

        // Automatically pass waiting room for Host, or if simulated
        if (data.payload.role === "host") {
          setWaitingRoom(false)
        }
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })

    // Load Chat history
    loadChat()
    const chatInterval = setInterval(loadChat, 4000)

    return () => {
      clearInterval(chatInterval)
      stopLocalStream()
    }
  }, [roomId])

  // Setup WebRTC media stream
  useEffect(() => {
    if (!waitingRoom && !meetingEnded && videoOn) {
      startLocalStream()
    } else {
      stopLocalStream()
    }
  }, [waitingRoom, meetingEnded, videoOn])

  // Timer interval
  useEffect(() => {
    if (!waitingRoom && !meetingEnded) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [waitingRoom, meetingEnded])

  const startLocalStream = async () => {
    try {
      if (streamRef.current) return
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      streamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (err) {
      console.warn("Could not retrieve local camera devices:", err)
    }
  }

  const stopLocalStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const loadChat = () => {
    fetch(`/api/meetings/chat?roomId=${roomId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChatMessages(data)
        }
      })
      .catch(e => console.error(e))
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return
    try {
      const res = await fetch(`/api/meetings/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          messageText: messageInput.trim(),
        }),
      })
      if (res.ok) {
        setMessageInput("")
        loadChat()
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleHostAction = async (action: string, targetUserId?: string) => {
    try {
      const res = await fetch(`/api/meetings/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          action,
          targetUserId,
        }),
      })
      if (res.ok) {
        if (action === "end") {
          setMeetingEnded(true)
          toast.success("Meeting has been ended by the host")
        } else if (action === "mute") {
          setRemoteMuted(prev => !prev)
          toast.success("Participant mic permission updated")
        }
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return <AppLoader variant="radar" message="Connecting to secure media channels and routing audio links" />
  }

  // Meeting Ended Screen
  if (meetingEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white font-sans text-xs">
        <Card className="max-w-md w-full border-slate-800 bg-slate-900 text-center py-8">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-950/50 border border-red-500/30 rounded-full flex items-center justify-center mb-2">
              <PhoneOff className="h-6 w-6 text-red-500" />
            </div>
            <CardTitle className="text-base font-bold">Interview Completed</CardTitle>
            <CardDescription className="text-slate-400 mt-1">This video session has finished and the room is closed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400 leading-relaxed">Thank you for attending the session. Please proceed to submit feedback or view your evaluation scorecards.</p>
            <div className="flex flex-col gap-2 pt-2">
              {isHost ? (
                <Button asChild className="bg-indigo-650 text-white font-bold h-9">
                  <a href="/interviewer-profile">Go to Interviewer Dashboard <ChevronRight className="h-3.5 w-3.5 ml-1" /></a>
                </Button>
              ) : (
                <Button asChild className="bg-indigo-650 text-white font-bold h-9">
                  <a href="/gamification">Submit Review Feedback <ChevronRight className="h-3.5 w-3.5 ml-1" /></a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Waiting Room state for Job Seekers (Candidates)
  if (waitingRoom && !isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white font-sans text-xs">
        <Card className="max-w-xl w-full border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
          <CardHeader className="pb-4 border-b border-slate-800 bg-slate-950/20 text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-950 border border-indigo-700/50 rounded-full flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-indigo-400 animate-pulse" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Waiting for Interviewer...</CardTitle>
            <CardDescription className="text-slate-400">The meeting will begin once the interviewer joins the room.</CardDescription>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 border border-slate-800 bg-slate-950/50 p-4 rounded-xl text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Role Type</span>
                <span className="font-bold text-white block mt-0.5">{roleName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Interviewer</span>
                <span className="font-bold text-white block mt-0.5">{interviewerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Duration</span>
                <span className="font-bold text-white block mt-0.5">{duration} mins</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Connection Check</span>
                <span className="font-bold text-emerald-400 block mt-0.5 flex items-center gap-1">
                  <Wifi className="h-3.5 w-3.5" /> SECURE & READY
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Button
                onClick={() => setWaitingRoom(false)}
                className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold h-10 px-6 rounded-lg cursor-pointer"
              >
                Join Meeting Anyway
              </Button>
              <Button
                variant="outline"
                onClick={() => setMeetingEnded(true)}
                className="border-slate-800 text-slate-350 hover:bg-slate-850 h-10 px-6 rounded-lg"
              >
                Cancel / Leave
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans text-xs flex flex-col">
      
      {/* Header bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Badge className="bg-indigo-950 text-indigo-400 border-indigo-900/50 font-bold">LIVE INTERVIEW</Badge>
          <h2 className="text-xs font-bold text-slate-200">{roomName}</h2>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>{formatTimer(elapsedTime)}</span>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex items-center gap-4 text-slate-400">
          <div className="text-right">
            <span className="text-[10px] text-slate-550 block font-bold uppercase">Role Target</span>
            <span className="font-bold text-white block mt-0.5">{roleName}</span>
          </div>
          <span className="text-slate-850">|</span>
          <div className="flex items-center gap-1 bg-slate-800/40 px-2 py-1 rounded-md">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 uppercase font-bold">Excellent Connection</span>
          </div>
        </div>
      </header>

      {/* Workspace Split (Video layout & Side drawer) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Video layout */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
          
          {/* Grid Layout of Video tiles */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center max-w-5xl mx-auto w-full">
            
            {/* Candidate / Local Tile */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg group">
              {videoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 font-bold">
                  Camera is turned off
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-slate-950/70 px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5">
                <span className="font-bold">{candidateName} (You)</span>
                {!micOn && <MicOff className="h-3 w-3 text-red-500" />}
              </div>
            </div>

            {/* Interviewer / Remote Tile */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg group">
              {/* Simulated remote user */}
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-3">
                <Avatar className="h-16 w-16 border-2 border-indigo-500 shadow-lg">
                  <AvatarFallback className="bg-indigo-950 text-indigo-400 font-bold text-lg">SJ</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <span className="font-extrabold text-white text-xs">{interviewerName}</span>
                  <span className="text-slate-400 block text-[10px] mt-0.5">Interviewer Partner</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-slate-950/70 px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5">
                <span className="font-bold">{interviewerName}</span>
                {remoteMuted && <MicOff className="h-3 w-3 text-red-500" />}
              </div>
            </div>

          </div>

          {/* Floating Controls bar */}
          <div className="py-4 flex justify-center items-center gap-3 shrink-0">
            <Button
              onClick={() => setMicOn(!micOn)}
              className={`h-11 w-11 rounded-full border-none cursor-pointer ${
                micOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-650 text-white hover:bg-red-700"
              }`}
            >
              {micOn ? <Mic className="h-4.5 w-4.5" /> : <MicOff className="h-4.5 w-4.5" />}
            </Button>

            <Button
              onClick={() => setVideoOn(!videoOn)}
              className={`h-11 w-11 rounded-full border-none cursor-pointer ${
                videoOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-650 text-white hover:bg-red-700"
              }`}
            >
              {videoOn ? <VideoIcon className="h-4.5 w-4.5" /> : <VideoOff className="h-4.5 w-4.5" />}
            </Button>

            <Button
              onClick={() => setScreenSharing(!screenSharing)}
              className={`h-11 w-11 rounded-full border-none cursor-pointer ${
                screenSharing ? "bg-indigo-650 text-white hover:bg-indigo-755" : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              <Monitor className="h-4.5 w-4.5" />
            </Button>

            <Button
              onClick={() => setRaisedHand(!raisedHand)}
              className={`h-11 w-11 rounded-full border-none cursor-pointer ${
                raisedHand ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              <Hand className="h-4.5 w-4.5" />
            </Button>

            <Button
              onClick={() => setActiveTab(activeTab === "chat" ? null : "chat")}
              className={`h-11 w-11 rounded-full border-none cursor-pointer ${
                activeTab === "chat" ? "bg-indigo-650 text-white hover:bg-indigo-755" : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5" />
            </Button>

            <Button
              onClick={() => setActiveTab(activeTab === "participants" ? null : "participants")}
              className={`h-11 w-11 rounded-full border-none cursor-pointer ${
                activeTab === "participants" ? "bg-indigo-650 text-white hover:bg-indigo-755" : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              <UsersIcon className="h-4.5 w-4.5" />
            </Button>

            <Button
              onClick={() => setMeetingEnded(true)}
              className="h-11 px-5 rounded-full bg-red-650 hover:bg-red-700 text-white border-none font-bold cursor-pointer"
            >
              <PhoneOff className="h-4 w-4 inline mr-1.5" /> End Interview
            </Button>
          </div>

        </div>

        {/* Right Side: Drawers panel */}
        {activeTab && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-right-5 duration-150">
            
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-850 flex justify-between items-center">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-indigo-400" /> Realtime Room Chat
                  </span>
                  <button onClick={() => setActiveTab(null)} className="text-slate-500 hover:text-white cursor-pointer">✕</button>
                </div>
                
                {/* Message Log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-10 text-slate-550">
                      No messages sent in this room yet.
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-300 text-[10px]">{msg.sender.name}</span>
                          <span className="text-[8px] text-slate-550">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-200 leading-relaxed">{msg.messageText}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Input box */}
                <div className="p-3 border-t border-slate-850 bg-slate-950 flex gap-2">
                  <Input
                    placeholder="Type message or paste links..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="text-xs h-9 bg-slate-900 text-white border-slate-800"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold h-9 px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "participants" && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-850 flex justify-between items-center">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <UsersIcon className="h-4 w-4 text-indigo-400" /> Active Partners ({waitingRoom ? "1" : "2"})
                  </span>
                  <button onClick={() => setActiveTab(null)} className="text-slate-500 hover:text-white cursor-pointer">✕</button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto">
                  {/* Local Partner info */}
                  <div className="flex items-center justify-between p-2 border border-slate-850 bg-slate-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-950 border border-indigo-500 rounded-full flex items-center justify-center font-bold text-indigo-400">
                        {candidateName[0]}
                      </div>
                      <div>
                        <span className="font-bold block text-white">{candidateName}</span>
                        <span className="text-[9px] text-slate-550 block mt-0.5">Candidate</span>
                      </div>
                    </div>
                    {raisedHand && <Badge className="bg-amber-600/30 text-amber-500 border-none font-bold text-[8.5px]">RAISED HAND</Badge>}
                  </div>

                  {/* Remote Partner Info */}
                  <div className="flex items-center justify-between p-2 border border-slate-850 bg-slate-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center font-bold text-slate-350">
                        SJ
                      </div>
                      <div>
                        <span className="font-bold block text-white">{interviewerName}</span>
                        <span className="text-[9px] text-slate-550 block mt-0.5">Host (Interviewer)</span>
                      </div>
                    </div>
                  </div>

                  {/* Host controls toggle panel (only rendered for Host) */}
                  {isHost && (
                    <div className="border-t border-slate-850 pt-4 mt-2 space-y-3">
                      <span className="font-bold text-[10px] text-slate-450 uppercase block tracking-wider">Host Controls Workspace</span>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHostAction("mute", "candidate-id")}
                          className="justify-start text-[10px] h-8 bg-slate-950 border-slate-800 text-slate-300 font-bold hover:bg-slate-850"
                        >
                          <VolumeX className="h-3.5 w-3.5 mr-2 text-indigo-400" />
                          {remoteMuted ? "Unmute Candidate" : "Mute Candidate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHostAction("lock")}
                          className="justify-start text-[10px] h-8 bg-slate-950 border-slate-800 text-slate-300 font-bold hover:bg-slate-850"
                        >
                          {meetingLocked ? <Unlock className="h-3.5 w-3.5 mr-2 text-indigo-400" /> : <Lock className="h-3.5 w-3.5 mr-2 text-indigo-400" />}
                          {meetingLocked ? "Unlock Room" : "Lock Room"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHostAction("end")}
                          className="justify-start text-[10px] h-8 bg-slate-950 border-red-900/50 text-red-400 font-bold hover:bg-red-950/20"
                        >
                          <PhoneOff className="h-3.5 w-3.5 mr-2 text-red-500" />
                          End Room Session
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
