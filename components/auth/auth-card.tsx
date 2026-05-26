import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="rounded-3xl border border-[#E8E0D4] bg-white/90 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.6)]">
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
