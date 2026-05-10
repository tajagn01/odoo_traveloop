"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
});

const resetSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(8, "Use at least 8 characters."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ForgotValues = z.infer<typeof forgotSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export function ForgotPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  const onRequestLink = forgotForm.handleSubmit(async (values) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      resetUrl?: string;
    };

    if (!response.ok) {
      toast.error(data.message ?? "Unable to request a reset link.");
      return;
    }

    setResetUrl(data.resetUrl ?? null);
    toast.success(data.message ?? "If the email exists, a reset link will be sent.");
  });

  const onResetPassword = resetForm.handleSubmit(async (values) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    });

    const data = (await response.json().catch(() => ({}))) as { message?: string };

    if (!response.ok) {
      toast.error(data.message ?? "Unable to reset password.");
      return;
    }

    toast.success("Password updated. Sign in with your new password.");
    router.push("/login");
  });

  if (token) {
    return (
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4" 
        onSubmit={onResetPassword}
      >
        <div className="space-y-2 relative group">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a new password"
            className="transition-all focus:ring-2 focus:ring-primary/20"
            {...resetForm.register("password")}
          />
          {resetForm.formState.errors.password ? (
            <p className="text-xs text-red-600">
              {resetForm.formState.errors.password.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2 relative group">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repeat your new password"
            className="transition-all focus:ring-2 focus:ring-primary/20"
            {...resetForm.register("confirmPassword")}
          />
          {resetForm.formState.errors.confirmPassword ? (
            <p className="text-xs text-red-600">
              {resetForm.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
        <Button className="w-full relative overflow-hidden" type="submit" disabled={resetForm.formState.isSubmitting}>
          {resetForm.formState.isSubmitting ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Updating...</span>
            </motion.div>
          ) : "Update password"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Need a new reset link?{" "}
          <Link href="/forgot-password" className="font-semibold text-foreground hover:text-primary transition-colors">
            Request another
          </Link>
        </p>
      </motion.form>
    );
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4" 
      onSubmit={onRequestLink}
    >
      <div className="space-y-2 relative group">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="transition-all focus:ring-2 focus:ring-primary/20"
          {...forgotForm.register("email")}
        />
        {forgotForm.formState.errors.email ? (
          <p className="text-xs text-red-600">{forgotForm.formState.errors.email.message}</p>
        ) : null}
      </div>
      <Button className="w-full relative overflow-hidden" type="submit" disabled={forgotForm.formState.isSubmitting}>
        {forgotForm.formState.isSubmitting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Sending...</span>
          </motion.div>
        ) : "Send reset link"}
      </Button>
      {resetUrl ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground"
        >
          <p className="font-semibold text-foreground">Reset link ready (Demo)</p>
          <a href={resetUrl} className="mt-1 block break-all text-primary underline hover:text-primary/80 transition-colors">
            {resetUrl}
          </a>
        </motion.div>
      ) : null}
      <p className="text-xs text-muted-foreground text-center">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
          Back to sign in
        </Link>
      </p>
    </motion.form>
  );
}
