"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendIcon, BotIcon, UserIcon, SparklesIcon } from "lucide-react"
import { sendMessage } from "./actions"
import { ChatSkeleton } from "./components/chat-skeleton"
import { ThemeToggle } from "./components/theme-toggle"
import { MarkdownRenderer } from "./components/markdown-renderer"
import "./components/markdown.css"

interface Message {
  role: "user" | "assistant"
  content: string
  id: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm your Minh Duyy AI assistant. How can I help you today?",
          id: "welcome-message"
        },
      ])
    }
  }, [messages.length])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input,
      id: `user-${Date.now()}`
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    sendMessage(input, messages.map(({ role, content }) => ({ role, content })))
      .then(response => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response,
            id: `assistant-${Date.now()}`
          },
        ])
      })
      .catch(error => {
        console.error("Error sending message:", error)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error processing your request.",
            id: `error-${Date.now()}`
          },
        ])
      })
      .finally(() => {
        setIsLoading(false)
        if (inputRef.current) {
          inputRef.current.focus()
        }
      })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-3xl h-[700px] flex flex-col shadow-lg rounded-xl overflow-hidden border border-primary/20">
        <CardHeader className="border-b flex flex-row items-center justify-between bg-primary p-4">
          <CardTitle className="flex items-center gap-3 text-primary-foreground text-xl font-bold">
            <SparklesIcon className="h-6 w-6" />
            Minh Duyy Chat
          </CardTitle>
          <ThemeToggle />
        </CardHeader>
        <CardContent className="flex-1 p-0 bg-background">
          <ScrollArea className="h-[530px] p-6" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 mb-6">
                    <BotIcon className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-lg font-medium">Start a conversation with Minh Duyy AI.</p>
                  <p className="text-md mt-2">Ask me anything!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} w-full`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      <Avatar className={`h-10 w-10 flex items-center justify-center ${
                        message.role === "user" ? "bg-primary" : "bg-secondary"
                      }`}>
                        {message.role === "user" ? 
                          <UserIcon className="h-5 w-5 text-primary-foreground" /> : 
                          <BotIcon className="h-5 w-5 text-secondary-foreground" />
                        }
                      </Avatar>
                      <div
                        className={`rounded-2xl px-5 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "user" ? (
                          <p className="text-md whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="text-md">
                            <MarkdownRenderer content={message.content} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start w-full">
                    <ChatSkeleton />
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4 bg-primary/5">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="h-12 rounded-full text-md px-5 bg-background border-primary/20 focus:border-primary/70"
              />
            </div>
            <div className="flex items-center justify-center">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center"
              >
                <SendIcon className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}