"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  Sparkles,
  User,
  Loader2,
  Calendar,
  DollarSign,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AiPrompt } from "@/components/dashboard/ai-prompt";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DashboardClientProps {
  firstName: string;
}

export function DashboardClient({ firstName }: DashboardClientProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingTrip, setIsSavingTrip] = useState<string | null>(null);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleStartChat = async (promptText: string) => {
    const text = promptText.trim();
    if (!text) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [userMessage];
    
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async (tripJsonString: string, msgIndex: number) => {
    const uniqueId = `trip-${msgIndex}`;
    setIsSavingTrip(uniqueId);
    try {
      const tripData = JSON.parse(tripJsonString);

      const response = await fetch("/api/chat-ai/save-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to save trip");
      }

      const data = await response.json();
      toast.success("✨ Your dream trip has been generated and saved!");
      
      // Redirect to builder route
      router.push(`/trips/${data.tripId}/builder`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate trip in the database.");
    } finally {
      setIsSavingTrip(null);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInput("");
    setIsLoading(false);
  };

  // Extract structured trip data from XML tags
  const extractTripData = (content: string) => {
    const match = content.match(/<trip_data>([\s\S]*?)<\/trip_data>/);
    if (!match) return null;
    try {
      return {
        rawJson: match[1].trim(),
        parsed: JSON.parse(match[1].trim()),
      };
    } catch (err) {
      console.error("JSON parse error:", err);
      return null;
    }
  };

  // Safe custom Markdown formatter
  const formatMarkdown = (content: string) => {
    const cleanContent = content.replace(/<trip_data>[\s\S]*?<\/trip_data>/g, "").trim();
    const lines = cleanContent.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="mt-4 mb-2 text-base font-bold text-[#0D7A73]">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={idx} className="mt-5 mb-2 text-lg font-bold text-[#0D7A73]">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={idx} className="mt-6 mb-3 text-xl font-bold text-[#0D7A73]">
            {line.replace("# ", "")}
          </h1>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const text = line.substring(2);
        return (
          <li key={idx} className="ml-5 list-disc my-1 text-sm text-muted-foreground">
            {parseBold(text)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="my-1.5 text-sm leading-relaxed text-muted-foreground">
          {parseBold(line)}
        </p>
      );
    });
  };

  const parseBold = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={i} className="font-bold text-foreground">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  // 1. Initial State: Standard dashboard welcome and query
  if (messages.length === 0) {
    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(13,122,115,0.15),_transparent_60%)]" />
        
        <div className="relative flex min-h-[72vh] flex-col items-center justify-center gap-8 px-2 pb-16 pt-10 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-display text-foreground md:text-6xl">
              Welcome back, <span className="text-[#0D7A73]">{firstName}</span>
            </h1>
          </div>

          {/* Glowing prompt text field */}
          <div className="w-full max-w-2xl">
            <AiPrompt onSubmit={handleStartChat} />
          </div>

          {/* Action links */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/trips/new">Plan a new trip</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/itinerary">Build an itinerary</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/cities">Explore cities</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/packing">Start a packing list</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Chat State: Full-height conversational co-creation
  return (
    <div className="relative flex flex-col gap-6 animate-fade-in">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(13,122,115,0.12),_transparent_60%)]" />

      {/* Chat header with back button */}
      <div className="relative flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleResetChat}
            variant="ghost"
            size="icon"
            className="rounded-xl border border-border/50 bg-background/50 hover:bg-muted"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#0D7A73]/10 text-[#0D7A73]">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D7A73]">
                Traveloop AI
              </span>
            </div>
            <h1 className="text-xl font-display text-foreground mt-0.5">
              AI Travel Assistant
            </h1>
          </div>
        </div>
        <Button
          onClick={handleResetChat}
          variant="outline"
          size="sm"
          className="rounded-full text-xs font-semibold"
        >
          Reset Chat
        </Button>
      </div>

      {/* Main chat window box */}
      <div className="relative flex h-[72vh] flex-col overflow-hidden rounded-[24px] border border-border/40 bg-card/60 shadow-xl backdrop-blur-md">
        
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((msg, index) => {
              const isAi = msg.role === "assistant";
              const tripData = isAi ? extractTripData(msg.content) : null;

              return (
                <div
                  key={index}
                  className={cn(
                    "flex gap-4",
                    isAi ? "justify-start" : "justify-end"
                  )}
                >
                  {/* AI Avatar */}
                  {isAi && (
                    <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-[#0D7A73]/10 text-[#0D7A73] border border-[#0D7A73]/20 shadow-sm">
                      <Sparkles className="h-4.5 w-4.5" />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] space-y-3">
                    {/* Chat Bubble */}
                    <div
                      className={cn(
                        "rounded-[20px] px-5 py-3.5 shadow-sm text-sm border",
                        isAi
                          ? "bg-[#FBF9F4] text-foreground border-border/30"
                          : "bg-[#0D7A73] text-white border-transparent"
                      )}
                    >
                      {isAi ? (
                        formatMarkdown(msg.content)
                      ) : (
                        <p className="leading-relaxed">{msg.content}</p>
                      )}
                    </div>

                    {/* Trip Preview Card if JSON exists in response */}
                    {tripData && (
                      <div className="rounded-[24px] border border-border/60 bg-background p-6 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden mt-2 animate-slide-up">
                        {/* Budget Limit Top Badge */}
                        {tripData.parsed.budgetLimit && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                            <DollarSign className="h-3 w-3 shrink-0" />
                            {tripData.parsed.budgetLimit} Limit
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="space-y-1 pr-24">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#0D7A73]">
                              ✨ Proposed Itinerary
                            </span>
                            <h4 className="text-xl font-display text-foreground leading-tight">
                              {tripData.parsed.tripName}
                            </h4>
                            {tripData.parsed.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {tripData.parsed.description}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-y border-border/40 py-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#0D7A73]/70" />
                              <span>
                                {tripData.parsed.startDate} to {tripData.parsed.endDate}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#0D7A73]/70" />
                              <span className="font-semibold text-foreground">
                                {tripData.parsed.stops?.length || 0} Destination(s)
                              </span>
                            </div>
                          </div>

                          {/* Route Road Map */}
                          {tripData.parsed.stops && tripData.parsed.stops.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                Route Highlights
                              </p>
                              <div className="relative border-l border-[#0D7A73]/20 pl-4 ml-2 space-y-3">
                                {tripData.parsed.stops.map((stop: any, sIdx: number) => (
                                  <div key={sIdx} className="relative text-xs">
                                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-background bg-[#0D7A73]" />
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="font-semibold text-foreground">
                                          {stop.cityName}, {stop.country}
                                        </span>
                                        {stop.hotelName && (
                                          <p className="text-[11px] text-muted-foreground mt-0.5">
                                            🏨 Stay: {stop.hotelName}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-muted-foreground/70 bg-muted/40 rounded px-1.5 py-0.5">
                                        {stop.activities?.length || 0} Activity(s)
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Save Trip Button */}
                          <div className="pt-2">
                            <Button
                              onClick={() => handleSaveTrip(tripData.rawJson, index)}
                              disabled={isSavingTrip !== null}
                              className="w-full rounded-2xl bg-[#0D7A73] hover:bg-[#0A625C] text-white shadow-md hover:shadow-lg transition-all duration-300 font-bold flex items-center justify-center gap-2 group text-sm h-11"
                            >
                              {isSavingTrip === `trip-${index}` ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Creating Trip & Activities...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4.5 w-4.5 transition-transform group-hover:scale-120" />
                                  ✨ Make This Trip
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {!isAi && (
                    <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-[#0D7A73] text-white shadow-sm border border-transparent">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-[#0D7A73]/10 text-[#0D7A73] border border-[#0D7A73]/20 shadow-sm">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col max-w-[85%]">
                  <div className="rounded-[20px] px-5 py-3.5 bg-[#FBF9F4] border border-border/30 text-muted-foreground flex items-center gap-2 shadow-sm text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0D7A73]" />
                    <span>Curating your perfect itinerary...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Messaging input bar at the bottom */}
        <div className="border-t border-border/40 bg-background/80 p-4 backdrop-blur-xl">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2.5 shadow-inner max-w-4xl mx-auto"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={
                isLoading
                  ? "AI is thinking..."
                  : "Ask AI to plan a trip (e.g. 5 days in London starting July 1st)..."
              }
              className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="grid h-9 w-9 place-items-center rounded-xl bg-[#0D7A73] text-white hover:bg-[#0A625C] transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
