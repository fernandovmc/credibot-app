"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { apiService } from "@/services/api";
import { ChatMessage } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User } from "lucide-react";
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
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                          <ReactMarkdown
                            components={{
                              // Customizar componentes markdown
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-2 space-y-1 last:mb-0">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-2 space-y-1 last:mb-0">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="ml-2">{children}</li>
                              ),
                              code: ({ children }) => (
                                <code className="bg-foreground/10 rounded px-1.5 py-0.5 font-mono text-xs">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-foreground/10 rounded p-3 overflow-x-auto mb-2 font-mono text-xs">
                                  {children}
                                </pre>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-base font-bold mb-2 mt-2">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-sm font-semibold mb-2 mt-2">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-xs font-semibold mb-1 mt-1">{children}</h3>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold">{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic">{children}</em>
                              ),
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:opacity-80 transition-opacity"
                                >
                                  {children}
                                </a>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-foreground/30 pl-3 italic my-2 opacity-80">
                                  {children}
                                </blockquote>
                              ),
                              table: ({ children }) => (
                                <div className="my-3 rounded-lg border border-foreground/20 bg-gradient-to-br from-foreground/5 to-foreground/3 overflow-hidden shadow-sm">
                                  <div className="overflow-x-auto">
                                    <table className="border-collapse w-full text-xs">
                                      {children}
                                    </table>
                                  </div>
                                </div>
                              ),
                              thead: ({ children }) => (
                                <thead className="bg-gradient-to-r from-foreground/15 to-foreground/10 sticky top-0">
                                  {children}
                                </thead>
                              ),
                              tbody: ({ children }) => (
                                <tbody className="divide-y divide-foreground/10">
                                  {children}
                                </tbody>
                              ),
                              tr: ({ children }) => (
                                <tr className="hover:bg-foreground/8 transition-colors duration-150">
                                  {children}
                                </tr>
                              ),
                              th: ({ children }) => (
                                <th className="border-r border-foreground/15 px-4 py-2.5 font-bold text-left text-foreground/90 whitespace-nowrap last:border-r-0">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="border-r border-foreground/15 px-4 py-2 text-foreground/80 last:border-r-0">
                                  {children}
                                </td>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      )}
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
