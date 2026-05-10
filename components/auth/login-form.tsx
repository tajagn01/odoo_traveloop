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
