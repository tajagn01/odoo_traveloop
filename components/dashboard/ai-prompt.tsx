"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";

interface AiPromptProps {
  onSubmit?: (val: string) => void;
}

export function AiPrompt({ onSubmit }: AiPromptProps) {
  const router = useRouter();
  const prompts = [
    "Plan a 5-day loop with highlights",
    "Build a budget and a packing list",
  ];
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.trim().length > 0;

  useEffect(() => {
    // Don't animate if focused or if there's user input
    if (isFocused || hasValue) {
      return;
    }

    const currentPrompt = prompts[promptIndex];
    const nextText = isDeleting
      ? currentPrompt.slice(0, placeholder.length - 1)
      : currentPrompt.slice(0, placeholder.length + 1);
    const isComplete = !isDeleting && nextText === currentPrompt;
    const isEmpty = isDeleting && nextText.length === 0;
    const delay = isComplete ? 1200 : isDeleting ? 35 : 45;

    const timer = setTimeout(() => {
      setPlaceholder(nextText);
      if (isComplete) {
        setIsDeleting(true);
      } else if (isEmpty) {
        setIsDeleting(false);
        setPromptIndex((prev) => (prev + 1) % prompts.length);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, promptIndex, prompts, isFocused, hasValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasValue) {
      if (onSubmit) {
        onSubmit(value.trim());
        setValue("");
      } else {
        router.push(`/chat-ai?prompt=${encodeURIComponent(value.trim())}`);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center gap-2 overflow-hidden rounded-[28px] border border-border/70 bg-card/95 px-4 py-3 shadow-[0_35px_80px_-70px_rgba(0,0,0,0.6)]"
    >
      <div className="prompt-glow" aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused || hasValue ? "" : placeholder}
        className="h-11 flex-1 bg-transparent text-base leading-[44px] text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Prompt"
      />
      <button
        type="submit"
        disabled={!hasValue}
        aria-label="Send"
        className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          hasValue
            ? "border-transparent bg-[#0D7A73] text-white hover:bg-[#0A625C]"
            : "border-border/70 bg-background text-muted-foreground hover:text-foreground"
        }`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <style jsx>{`
        .prompt-glow {
          position: absolute;
          left: 18%;
          right: 18%;
          bottom: -38px;
          height: 70px;
          background: radial-gradient(60% 80% at 50% 50%, rgba(13, 122, 115, 0.45), transparent 70%);
          filter: blur(16px);
          opacity: 0.55;
          animation: promptGlow 5.5s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes promptGlow {
          0% {
            transform: translateX(-12%) scale(0.95);
            opacity: 0.35;
          }
          50% {
            transform: translateX(12%) scale(1.05);
            opacity: 0.65;
          }
          100% {
            transform: translateX(-12%) scale(0.95);
            opacity: 0.35;
          }
        }
      `}</style>
    </form>
  );
}