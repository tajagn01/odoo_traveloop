import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell>
      <AuthCard
        title="Create your account"
        description="Start planning itineraries, budgets, and packing lists."
      >
        <SignupForm />
      </AuthCard>
    </AuthShell>
  );
}
