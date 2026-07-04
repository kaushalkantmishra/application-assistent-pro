"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Mic,
  MicOff,
  Send,
  Play,
  Settings,
  Sparkles,
  Terminal,
  Code,
  Volume2,
  VolumeX,
  Clock,
  PhoneOff,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface Question {
  id: string
  questionText: string
  questionType: string // text, mcq, coding, system_design, behavioral
  options?: string[]
  codeTemplate?: string
  testCases?: { input: string; output: string }[]
}

interface Message {
  id: string
  isBot: boolean
  text: string
  timestamp: Date
}

export default function AIMockWorkspace({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  
  // Chat feed
  const [messages, setMessages] = useState<Message[]>([])
  const [inputVal, setInputVal] = useState("")
  const [submittingAnswer, setSubmittingAnswer] = useState(false)

  // Coding sandbox
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [terminalOutput, setTerminalOutput] = useState("Console ready. Click 'Run Tests' to compile.")
  const [runningCode, setRunningCode] = useState(false)

  // Voice chat options
  const [isVoiceOn, setIsVoiceOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Timer loop
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    // Load session info and first question
    fetch(`/api/ai-interviews?id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setSession(data)
        // Add initial system welcoming message
        setMessages([
          {
            id: "system-1",
            isBot: true,
            text: `Welcome! I am your AI Career Coach. Today we will conduct a mock interview for the ${data.targetRole} role focusing on ${data.technology}. Let's begin when you are ready.`,
            timestamp: new Date()
          }
        ])
        fetchNextQuestion()
      }).catch(e => {
        console.error(e)
        toast.error("Failed to load interview session")
      })
  }, [sessionId])

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchNextQuestion = async () => {
    try {
      const res = await fetch(`/api/ai-interviews/${sessionId}/next-question`)
      if (res.ok) {
        const q = await res.json()
        setCurrentQuestion(q)
        if (q.codeTemplate) {
          setCode(q.codeTemplate)
        }
        // AI speaks or posts the question in chat
        setMessages(prev => [
          ...prev,
          {
            id: `bot-q-${q.id}`,
            isBot: true,
            text: `[Question type: ${q.questionType.toUpperCase()}] \n\n${q.questionText}`,
            timestamp: new Date()
          }
        ])
      } else {
        // No more questions -> complete interview
        handleFinishInterview()
      }
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleSendTextAnswer = async () => {
    if (!inputVal.trim() || !currentQuestion) return
    const answer = inputVal.trim()
    setInputVal("")
    
    // Add user answer to feed
    setMessages(prev => [
      ...prev,
      {
        id: `user-a-${Date.now()}`,
        isBot: false,
        text: answer,
        timestamp: new Date()
      }
    ])

    try {
      setSubmittingAnswer(true)
      const res = await fetch(`/api/ai-interviews/${sessionId}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerText: answer,
        }),
      })

      if (res.ok) {
        const feedbackData = await res.json()
        // Render AI feedback response immediately
        setMessages(prev => [
          ...prev,
          {
            id: `bot-fb-${Date.now()}`,
            isBot: true,
            text: `💡 Feedback: Score ${feedbackData.correctnessScore}/100. \n\n${feedbackData.feedback}`,
            timestamp: new Date()
          }
        ])
        // Fetch next
        setTimeout(fetchNextQuestion, 2000)
      } else {
        throw new Error("Failed to record answer")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const handleRunCode = async () => {
    if (!currentQuestion) return
    try {
      setRunningCode(true)
      setTerminalOutput("Compiling and executing test cases...")
      
      const res = await fetch(`/api/ai-interviews/${sessionId}/evaluate-coding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          code,
          language,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTerminalOutput(
          `Status: ${data.status.toUpperCase()}\n` +
          `Test cases passed: ${data.testCasesPassed} / ${data.totalTestCases}\n` +
          `Output:\n${data.compilationOutput || "Success. All assertions passed."}`
        )
      } else {
        throw new Error("Compilation error")
      }
    } catch (e: any) {
      setTerminalOutput(`Error: ${e.message}`)
    } finally {
      setRunningCode(false)
    }
  }

  const handleSubmitCodeAnswer = async () => {
    if (!currentQuestion) return
    try {
      setSubmittingAnswer(true)
      
      // Submit code as text answer
      const res = await fetch(`/api/ai-interviews/${sessionId}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerText: `[Submitted ${language} Code]:\n\n${code}`,
          isCoding: true,
        }),
      })

      if (res.ok) {
        toast.success("Code solution submitted!")
        fetchNextQuestion()
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const handleFinishInterview = async () => {
    toast.success("Interview completed! Generating scorecard reports...")
    router.push(`/ai-mock-interview/${sessionId}/report`)
  }

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-white rounded-xl overflow-hidden shadow-2xl relative font-sans text-xs">
      
      {/* Header bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wide">
            Live AI Session
          </Badge>
          <span className="font-bold text-slate-300 text-xs">
            {session ? `${session.targetRole} (${session.difficulty})` : "Loading..."}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-red-600 text-white font-mono text-[10px] gap-1 flex items-center">
            <Clock className="h-3 w-3" /> {formatTimer(seconds)}
          </Badge>

          {/* Voice controller */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVoiceOn(!isVoiceOn)}
            className={`text-[10px] h-7 border-slate-700 font-bold ${
              isVoiceOn ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {isVoiceOn ? <Volume2 className="h-3.5 w-3.5 mr-1" /> : <VolumeX className="h-3.5 w-3.5 mr-1" />}
            {isVoiceOn ? "Voice Chat Active" : "Voice Off"}
          </Button>

          {isVoiceOn && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsMuted(!isMuted)}
              className={`h-7 w-7 rounded-full border-slate-700 ${
                isMuted ? "bg-red-950 text-red-500 hover:bg-red-900" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleFinishInterview}
            className="text-[10px] h-7 bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer rounded-lg gap-1"
          >
            <PhoneOff className="h-3.5 w-3.5" /> Stop Simulation
          </Button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        
        {/* Left Side: Conversational Feed (6 cols or full if not coding) */}
        <div className={`flex flex-col justify-between h-full bg-slate-900 overflow-hidden ${
          currentQuestion?.questionType === "coding" ? "lg:col-span-6 border-r border-slate-800" : "lg:col-span-12"
        }`}>
          
          <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Conversational Coach feed
            </span>
          </div>

          <ScrollArea className="flex-1 p-4 space-y-4">
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.isBot ? "mr-auto" : "ml-auto"}`}>
                  <div className={`p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                    m.isBot ? "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none" : "bg-indigo-600 text-white rounded-br-none"
                  }`}>
                    {m.text}
                    <span className={`block text-[8px] mt-1 text-right ${m.isBot ? "text-slate-400" : "text-indigo-200"}`}>
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat input */}
          <div className="p-3 border-t border-slate-800 flex gap-2 shrink-0 bg-slate-900">
            <Input
              placeholder={currentQuestion?.questionType === "coding" ? "Use the code editor on the right to complete this question..." : "Type your detailed answer response..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={currentQuestion?.questionType === "coding" || submittingAnswer}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSendTextAnswer()
              }}
              className="text-xs bg-slate-950 border-slate-800 h-9.5 flex-1"
            />
            <Button
              onClick={handleSendTextAnswer}
              disabled={currentQuestion?.questionType === "coding" || submittingAnswer || !inputVal.trim()}
              className="h-9.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Side: Code Sandbox (only renders for coding questions) */}
        {currentQuestion?.questionType === "coding" && (
          <div className="lg:col-span-6 flex flex-col justify-between h-full bg-slate-950 overflow-hidden">
            {/* Header / Language selector */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/20 flex justify-between items-center shrink-0">
              <span className="font-bold flex items-center gap-1.5 text-emerald-450">
                <Code className="h-4 w-4" /> Interactive Code Editor
              </span>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="text-[10px] h-7 w-28 bg-slate-900 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="javascript" className="text-xs">JavaScript</SelectItem>
                  <SelectItem value="typescript" className="text-xs">TypeScript</SelectItem>
                  <SelectItem value="python" className="text-xs">Python</SelectItem>
                  <SelectItem value="java" className="text-xs">Java</SelectItem>
                  <SelectItem value="cpp" className="text-xs">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Code Textarea editor with line numbers mockup */}
            <div className="flex-1 p-2 font-mono flex gap-2 overflow-hidden bg-slate-950 relative">
              {/* Fake line numbers column */}
              <div className="text-slate-600 select-none text-right pr-2 border-r border-slate-850 text-[10.5px] leading-relaxed shrink-0">
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-transparent text-emerald-400 focus:outline-none resize-none text-[10.5px] font-mono leading-relaxed h-full overflow-y-auto"
                placeholder="// Write your code solution here..."
              />
            </div>

            {/* Terminal console */}
            <div className="h-40 border-t border-slate-800 bg-slate-900 flex flex-col shrink-0">
              <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
                <span className="font-bold flex items-center gap-1 text-[10px] text-slate-300">
                  <Terminal className="h-3.5 w-3.5" /> Output Console
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRunCode}
                    disabled={runningCode}
                    className="text-[9px] h-6 border-slate-750 bg-slate-800 hover:bg-slate-700 font-bold"
                  >
                    <Play className="h-3 w-3 mr-1 fill-current" /> Run Tests
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitCodeAnswer}
                    disabled={submittingAnswer}
                    className="text-[9px] h-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Submit Answer
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1 p-3 bg-slate-950 font-mono text-[10px] text-slate-300 leading-normal whitespace-pre-wrap">
                {terminalOutput}
              </ScrollArea>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
