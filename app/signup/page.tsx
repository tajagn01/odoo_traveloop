import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/layout/auth-shell";
import registerImage from "@/app/assets/register image.jpg";

export default function SignupPage() {
  return (
    <AuthShell
      variant="split"
      sideImage={registerImage}
      sideTitle="Design your next journey"
      sideDescription="Save routes, share with your crew, and keep every detail on track."
    >
      <AuthCard
        title="Create your account"
        description="Start planning itineraries, budgets, and packing lists."
      >
        <SignupForm />
      </AuthCard>
    </AuthShell>
  );
}
