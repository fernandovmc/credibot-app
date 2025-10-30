"use client";

import { useState, useRef, useEffect } from "react";
import { apiService } from "@/services/api";
import { ChatMessage } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente de IA do Credibot. Posso ajudá-lo a consultar informações sobre clientes, scores de crédito e análises financeiras. Como posso ajudá-lo hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await apiService.smartChat({ message: input });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="max-w-4xl mx-auto w-full px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-16">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                  <Bot className="w-8 h-8 text-primary/60" />
                </div>
                <h2 className="text-xl font-semibold">Como posso ajudá-lo?</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Pergunte sobre clientes, scores de crédito, análises de risco ou qualquer informação financeira
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    {message.role === "assistant" ? (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-secondary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "flex flex-col max-w-xl",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 px-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="flex flex-col items-start">
                    <div className="bg-muted text-foreground rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Spacing for scroll */}
              <div className="h-4" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  disabled={loading}
                  className="rounded-2xl border-2 border-primary/30 bg-primary/5 pr-12 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-primary/10 transition-all min-h-[48px] text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                size="icon"
                className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground px-4">
              Exemplos: &quot;Quais clientes têm score acima de 800?&quot; • &quot;Mostre clientes inadimplentes&quot; • &quot;Top 5 clientes por score&quot;
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
