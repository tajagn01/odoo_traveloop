"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  rememberMe: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ 
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false }
  });

  const onSubmit = async (values: LoginValues) => {
    const response = await signIn("credentials", {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      redirect: false,
    });

    if (response?.error) {
      const errorMessage = response.error === "CredentialsSignin" 
        ? "Unable to sign in. Check your credentials." 
        : response.error;
      toast.error(errorMessage);
      return;
    }

    toast.success("Welcome back to Traveloop.");
    router.push("/dashboard");
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4" 
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2 relative group">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" className="transition-all focus:ring-2 focus:ring-primary/20" {...register("email")} />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2 relative group">
        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Password</Label>
        <div className="relative">
          <Input 
            id="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter your password" 
            className="pr-10 transition-all focus:ring-2 focus:ring-primary/20" 
            {...register("password")} 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        ) : null}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="rememberMe" 
          checked={watch("rememberMe")}
          onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
        />
        <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Remember me
        </Label>
      </div>
      <Button className="w-full relative overflow-hidden" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Signing in...</span>
          </motion.div>
        ) : "Sign in"}
      </Button>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          or
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <Button
        variant="outline"
        type="button"
        className="w-full gap-2"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">
          <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.02 1.53 7.4 2.8l5.08-5.09C33.2 4.2 28.9 2 24 2 14.9 2 7.1 7.2 3.4 14.6l6.3 4.9C11.5 13.3 17.3 9.5 24 9.5z" />
            <path fill="#34A853" d="M46 24.5c0-1.4-.1-2.5-.4-3.7H24v7h12.4c-.6 3-2.3 5.6-4.9 7.3l7.5 5.8C43.1 36.3 46 31 46 24.5z" />
            <path fill="#4A90E2" d="M9.7 28.1c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-6.3-4.9C1.5 16.5 0 20.1 0 23.3s1.5 6.8 3.4 9.7l6.3-4.9z" />
            <path fill="#FBBC05" d="M24 46c4.9 0 9-1.6 12-4.3l-7.5-5.8c-2 1.4-4.5 2.1-4.5 2.1-6.7 0-12.5-3.8-14.3-9.2l-6.3 4.9C7.1 40.8 14.9 46 24 46z" />
          </svg>
        </span>
        Continue with Google
      </Button>
      <Button 
        variant="outline" 
        type="button" 
        className="w-full"
        onClick={() => {
          setValue("email", "demo@traveloop.local");
          setValue("password", "Password123!");
        }}
      >
        Use Demo Account
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <Link href="/forgot-password" className="font-semibold text-foreground hover:text-primary transition-colors">
          Forgot password?
        </Link>
        <span>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-foreground hover:text-primary transition-colors">
            Create an account
          </Link>
        </span>
      </div>
    </motion.form>
  );
}
