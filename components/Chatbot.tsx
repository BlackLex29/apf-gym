"use client"

import type React from "react"

import { useState } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
    id: string
    text: string
    isBot: boolean
    timestamp: Date
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hello! I'm your GymSchedPro assistant. I can help you with gym-related questions, booking information, and general inquiries about our services.",
            isBot: true,
            timestamp: new Date(),
        },
    ])
    const [inputMessage, setInputMessage] = useState("")

    const gymResponses = {
        greeting: [
            "Hello! How can I help you with your GymSchedPro experience today?",
            "Hi there! I'm here to assist you with any gym-related questions at APF Tanauan.",
            "Welcome to GymSchedPro! What can I help you with?",
        ],
        hours: [
            "APF Tanauan is open Monday-Friday 5:00 AM - 11:00 PM, Saturday-Sunday 6:00 AM - 10:00 PM.",
            "We're open early morning to late evening! Monday-Friday: 5 AM-11 PM, Weekends: 6 AM-10 PM.",
        ],
        classes: [
            "We offer Gym Training, Boxing Classes, and Karate Classes at APF Tanauan. Each has different instructors and schedules.",
            "Our classes include: Gym Training with certified instructors, Boxing Classes for all levels, and traditional Karate Classes.",
        ],
        booking: [
            'You can book sessions through your dashboard. Just click on "Book Session" and select your preferred time and instructor.',
            "To book a session, go to the booking page, choose your class type, select an available time slot, and confirm your booking.",
        ],
        payment: [
            "We accept payments through GCash. Payment is processed when you confirm your booking.",
            "All payments are handled securely through GCash integration. You'll see the payment options when confirming your booking.",
        ],
        coaches: [
            "We have certified instructors for Gym Training, Boxing, and Karate at APF Tanauan. You can view their profiles and ratings in the booking section.",
            "Our professional coaches specialize in different areas. Check out their profiles to find the best match for your fitness goals.",
        ],
        membership: [
            "We offer Basic, Premium, and Unlimited membership plans with different booking limits and benefits.",
            "Choose from our flexible membership options: Basic for occasional visits, Premium for regular training, or Unlimited for maximum access.",
        ],
    }

    const getRandomResponse = (responses: string[]) => {
        return responses[Math.floor(Math.random() * responses.length)]
    }

    const generateBotResponse = (userMessage: string): string => {
        const message = userMessage.toLowerCase()

        // Personal questions - don't answer
        if (
            message.includes("personal") ||
            message.includes("private") ||
            message.includes("age") ||
            message.includes("address") ||
            message.includes("phone") ||
            message.includes("email")
        ) {
            return "I can only help with gym-related questions. For personal matters, please contact our APF Tanauan staff directly."
        }

        // Gym-related responses
        if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
            return getRandomResponse(gymResponses.greeting)
        }

        if (message.includes("hours") || message.includes("open") || message.includes("time")) {
            return getRandomResponse(gymResponses.hours)
        }

        if (
            message.includes("class") ||
            message.includes("training") ||
            message.includes("boxing") ||
            message.includes("karate")
        ) {
            return getRandomResponse(gymResponses.classes)
        }

        if (message.includes("book") || message.includes("schedule") || message.includes("appointment")) {
            return getRandomResponse(gymResponses.booking)
        }

        if (
            message.includes("payment") ||
            message.includes("pay") ||
            message.includes("gcash") ||
            message.includes("price")
        ) {
            return getRandomResponse(gymResponses.payment)
        }

        if (message.includes("coach") || message.includes("instructor") || message.includes("trainer")) {
            return getRandomResponse(gymResponses.coaches)
        }

        if (message.includes("membership") || message.includes("plan") || message.includes("subscription")) {
            return getRandomResponse(gymResponses.membership)
        }

        // Default response for gym-related but unmatched queries
        return "I can help you with information about APF Tanauan's hours, classes, booking, payments, coaches, and membership plans. What would you like to know?"
    }

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputMessage,
            isBot: false,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])

        // Generate bot response
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateBotResponse(inputMessage),
                isBot: true,
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botResponse])
        }, 1000)

        setInputMessage("")
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    return (
        <>
            {/* Floating Chat Button */}
            <Button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 text-black shadow-lg transition-all duration-300 transform hover:scale-110 z-50 ${isOpen ? "hidden" : "flex"}`}
            >
                <MessageCircle className="h-6 w-6" />
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-card border shadow-xl z-50 flex flex-col max-w-[calc(100vw-3rem)]">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b flex-shrink-0">
                        <CardTitle className="text-foreground text-sm">GymSchedPro Assistant</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                        <ScrollArea className="flex-1 p-4 min-h-0">
                            <div className="space-y-4 pb-4">
                                {messages.map((message) => (
                                    <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                                        <div
                                            className={`max-w-[85%] p-3 rounded-lg text-sm break-words ${message.isBot ? "bg-muted text-foreground" : "bg-orange-500 text-black"
                                                }`}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t flex-shrink-0 bg-card">
                            <div className="flex gap-2">
                                <Input
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about gym services..."
                                    className="bg-background border-input text-foreground placeholder-muted-foreground focus:border-orange-500 flex-1"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 text-black flex-shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    )
}
