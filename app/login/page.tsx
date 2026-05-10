import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthCard
        title="Welcome back"
        description="Sign in to keep building your next travel loop."
      >
        <LoginForm />
      </AuthCard>
    </AuthShell>
  );
}
