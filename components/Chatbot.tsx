"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Dumbbell, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: "1",
  text: "Hi! I'm your GymSchedPro Assistant. Click any question below to learn more!",
  isBot: true,
  timestamp: new Date(),
};

const STORAGE_KEY = "gymChatMessages";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(
          parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
      } catch (e) {
        console.error("Failed to load chat history:", e);
        setMessages([INITIAL_MESSAGE]);
      }
    }
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const recommendedQuestions = [
    {
      text: "How much is the monthly membership?",
      response: "We offer flexible plans:\n• Basic: ₱1,500/month (3 visits)\n• Premium: ₱2,500/month (unlimited gym + 5 classes)\n• Unlimited: ₱3,500/month (full access + personal coach)",
    },
    {
      text: "What are the gym hours?",
      response: "We're open:\n• Monday–Friday: 5:00 AM – 11:00 PM\n• Saturday–Sunday: 6:00 AM – 10:00 PM\nEarly birds & night owls welcome!",
    },
    {
      text: "What classes do you offer?",
      response: "We have:\n• Zumba (Mon/Wed/Fri, 9 AM)\n• Boxing (Tue/Thu, 6 PM)\n• Karate (Sat, 10 AM)\n• Gym Training (anytime with coach)",
    },
    {
      text: "How do I book a class?",
      response: "Easy! Just go to 'Book Studio Class' in your dashboard, pick a class, choose a time, and confirm. GCash payment at checkout.",
    },
    {
      text: "Who are the coaches?",
      response: "Our certified coaches:\n• Maria Clara – Zumba Expert\n• Carlos Mendez – Boxing Champion\n• Sensei Ryu – Karate Master\n• Coach Mike – Gym Trainer",
    },
    {
      text: "How do I pay?",
      response: "We accept GCash only. Secure, fast, and paperless. You’ll see the payment screen after confirming your booking.",
    },
    {
      text: "Where is the gym located?",
      response: "APF Tanauan is located at:\nBrgy. Darasa, Tanauan City, Batangas\nNear Tanauan Public Market & Jollibee.",
    },
    {
      text: "Are there promos?",
      response: "Yes! Current promo:\nJoin now and get 1 FREE class!\nValid for new members only. Limited time offer.",
    },
  ];

  const sendRecommendation = (question: string, answer: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text: question,
      isBot: false,
      timestamp: new Date(),
    };
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: answer,
      isBot: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <MessageCircle className="h-7 w-7" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[560px] bg-gray-900/95 backdrop-blur-lg border border-gray-700 shadow-2xl z-50 flex flex-col max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-gray-700 flex-shrink-0">
            <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-orange-400" />
              GymSchedPro Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="text-gray-300 hover:text-orange-400 hover:bg-white/10 rounded-full h-8 w-8"
                title="Clear chat"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Scrollable Messages + Recommendations */}
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="p-4 space-y-4 min-h-full">
                {/* Messages */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl text-sm break-words shadow-md whitespace-pre-line ${
                        msg.isBot
                          ? "bg-gray-800 text-gray-100 border border-gray-700"
                          : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Recommended Questions */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-xs font-semibold text-orange-400 text-center mb-3">
                    Recommended Questions
                  </p>
                  <div className="space-y-2">
                    {recommendedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendRecommendation(q.text, q.response)}
                        className="w-full text-left p-3 text-sm bg-gray-800/80 hover:bg-orange-500/20 text-gray-200 rounded-xl border border-gray-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                      >
                        {q.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom padding */}
                <div className="h-4" />
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 bg-gray-800/50 border-t border-gray-700 text-center flex-shrink-0">
              <p className="text-xs text-gray-400">
                Click any question to get instant answers!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}