import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

type AuthShellVariant = "centered" | "split";

type AuthShellProps = {
  children: ReactNode;
  variant?: AuthShellVariant;
  sideImage?: StaticImageData;
  sideTitle?: string;
  sideDescription?: string;
};

export function AuthShell({
  children,
  variant = "centered",
  sideImage,
  sideTitle,
  sideDescription,
}: AuthShellProps) {
  if (variant === "split") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8efe0,_#f5f1ea_50%,_#efe8de_100%)] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#E5DDD0] bg-[linear-gradient(115deg,_#FFFFFF_0%,_#FFFFFF_58%,_#F2F6F2_100%)] shadow-[0_40px_100px_-70px_rgba(0,0,0,0.6)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 flex h-full flex-col justify-center px-6 py-10 sm:px-10 lg:order-1">
            <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1F1B16]">
              <span className="text-base font-semibold tracking-tight">Traveloop</span>
              <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-[#6A5E4C]">
                Planner
              </span>
            </Link>
            {children}
          </div>
          <div className="order-1 flex flex-col items-center justify-center gap-6 px-6 py-10 text-center lg:order-2">
            <div className="relative w-full max-w-sm">
              {sideImage ? (
                <Image
                  src={sideImage}
                  alt={sideTitle ?? "Traveloop illustration"}
                  className="h-auto w-full"
                  priority
                />
              ) : null}
            </div>
            <div className="space-y-2">
              {sideTitle ? (
                <p className="text-lg font-semibold text-[#1F1B16]">{sideTitle}</p>
              ) : null}
              {sideDescription ? (
                <p className="text-sm text-[#6A5E4C]">{sideDescription}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f8efe0,_#f5f1ea_50%,_#f0ebe4_100%)] px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-2 text-sm font-semibold">
          <span className="text-base font-semibold">Traveloop</span>
          <span className="rounded-full bg-accent/30 px-2 py-0.5 text-xs">Planner</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
