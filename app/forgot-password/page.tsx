import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <AuthCard
        title="Reset your password"
        description="Send a secure reset link to your email."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuthShell>
  );
}
