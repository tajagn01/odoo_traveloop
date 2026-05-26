import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/layout/auth-shell";
import loginImage from "@/app/assets/login image.jpg";

export default function LoginPage() {
  return (
    <AuthShell
      variant="split"
      sideImage={loginImage}
      sideTitle="Make every trip feel effortless"
      sideDescription="Keep itineraries, budgets, and packing lists aligned in one calm workspace."
    >
      <AuthCard
        title="Welcome back!"
        description="Sign in to keep building your next travel loop."
      >
        <LoginForm />
      </AuthCard>
    </AuthShell>
  );
}
