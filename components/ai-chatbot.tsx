"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot } from "lucide-react"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI assistant. How can I help you with your job applications today?",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [showWelcome, setShowWelcome] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isBot: false,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      })

      const data = await response.json()
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Sorry, I couldn't process your request.",
        isBot: true,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting. Please try again.",
        isBot: true,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // scroll to bottom when messages change
  useEffect(() => {
    // prefer scrolling the container, fallback to scrollIntoView
    if (scrollContainerRef.current) {
      const c = scrollContainerRef.current
      c.scrollTop = c.scrollHeight
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  return (
    <>
      {/* Welcome Popup */}
      {showWelcome && !isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-72 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <Card className="shadow-xl border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Welcome to your AI-powered application!</p>
                  <p className="text-xs text-muted-foreground mb-3">How can I help you today?</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsOpen(true)
                        setShowWelcome(false)
                      }}
                    >
                      Chat Now
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowWelcome(false)}>
                      Later
                    </Button>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setShowWelcome(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center bg-primary/50 backdrop-blur-sm hover:bg-primary/60 hover:scale-110 active:scale-95"
        >
          {isOpen ? (
            <X className="!h-8 !w-8 transition-all duration-300 rotate-0 hover:rotate-90" />
          ) : (
            <MessageCircle className="!h-8 !w-8 transition-all duration-300 hover:scale-110" />
          )}
        </Button>
      </div>

      {/* Chat Window (responsive) */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[95vw] max-w-xs sm:max-w-sm md:w-80 h-[60vh] md:h-96 animate-in slide-in-from-bottom-4 fade-in zoom-in-95 duration-300">
          <Card className="h-full flex flex-col shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bot className="h-4 w-4 text-primary" />
                AI Assistant
                <span className="text-xs text-muted-foreground ml-auto">Powered by AI</span>
              </CardTitle>
            </CardHeader>

            {/* messages container: flex-1 min-h-0 so it scrolls properly */}
            <div className="flex-1 flex flex-col min-h-0">
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto px-4 py-3 space-y-3"
                // ensure smooth scrolling on mobile
              >
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-sm break-words ${
                        message.isBot ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground max-w-[75%] rounded-lg px-3 py-2 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* spacer so last message doesn't hide behind footer */}
                <div className="h-20" />
                <div ref={messagesEndRef} />
              </div>

              {/* input/footer - flex-shrink-0 so it's always visible */}
              <div className="border-t p-3 flex-shrink-0 bg-background">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1 text-sm"
                  />
                  <Button size="sm" onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
