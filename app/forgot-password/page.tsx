import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell>
      <AuthCard
        title={token ? "Choose a new password" : "Reset your password"}
        description={
          token
            ? "Create a new password to finish your reset."
            : "Send a secure reset link to your email."
        }
      >
        <ForgotPasswordForm token={token} />
      </AuthCard>
    </AuthShell>
  );
}
