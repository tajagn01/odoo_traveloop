"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, Upload } from "lucide-react";
import zxcvbn from "zxcvbn";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ 
    resolver: zodResolver(signupSchema),
    defaultValues: { terms: false }
  });

  const passwordValue = watch("password", "");
  const passwordStrength = zxcvbn(passwordValue);

  const getStrengthColor = (score: number) => {
    switch(score) {
      case 0: return "bg-red-500";
      case 1: return "bg-orange-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-lime-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-200";
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // Note: In a real app, this preset should be public. Using a placeholder or backend route is safer.
    // For this demo, we assume the backend handles the actual upload or we send the base64.
    // Here we will just convert to base64 to send to our API route.
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (values: SignupValues) => {
    try {
      let imageBase64 = undefined;
      if (profileImage) {
        imageBase64 = await uploadToCloudinary(profileImage);
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: values.name.trim(), 
          email: values.email, 
          password: values.password,
          image: imageBase64
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload?.message ?? "Unable to create account.");
        return;
      }

      toast.success("Account created! Logging you in...");
      
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (signInResult?.error) {
        toast.error("Account created, but automatic login failed. Please log in manually.");
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong during signup.");
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4" 
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-center justify-center space-y-2 mb-4">
        <Label htmlFor="profilePhoto" className="cursor-pointer group relative flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/50 hover:border-primary transition-colors overflow-hidden">
          {profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={URL.createObjectURL(profileImage)} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
              <Upload className="w-6 h-6 mb-1" />
              <span className="text-[10px] uppercase font-semibold">Upload</span>
            </div>
          )}
          <input 
            id="profilePhoto" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setProfileImage(e.target.files[0]);
              }
            }}
          />
        </Label>
        <span className="text-xs text-muted-foreground">Profile Image (Optional)</span>
      </div>

      <div className="space-y-1.5 relative group">
        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Full Name</Label>
        <Input id="name" placeholder="Jane Doe" className="transition-all focus:ring-2 focus:ring-primary/20" {...register("name")} />
        {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-1.5 relative group">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Email Address</Label>
        <Input id="email" type="email" placeholder="you@example.com" className="transition-all focus:ring-2 focus:ring-primary/20" {...register("email")} />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-1">
        <div className="space-y-1.5 relative group">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="8+ characters" 
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
          {passwordValue.length > 0 && (
            <div className="flex h-1 mt-2 rounded-full overflow-hidden bg-muted">
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index} 
                  className={`flex-1 ${index <= passwordStrength.score ? getStrengthColor(passwordStrength.score) : 'bg-transparent'} transition-colors duration-300 border-r border-background last:border-r-0`}
                />
              ))}
            </div>
          )}
          {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
        </div>
      </div>

      <div className="flex items-start space-x-2 pt-2">
        <Checkbox 
          id="terms" 
          checked={watch("terms")}
          onCheckedChange={(checked) => setValue("terms", checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="terms" className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Accept terms and conditions
          </Label>
          <p className="text-xs text-muted-foreground">
            You agree to our Terms of Service and Privacy Policy.
          </p>
          {errors.terms && <p className="text-xs text-red-600">{errors.terms.message}</p>}
        </div>
      </div>

      <Button className="w-full relative overflow-hidden" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Creating account...</span>
          </motion.div>
        ) : "Create Account"}
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
      <p className="text-xs text-muted-foreground text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
          Sign in
        </Link>
      </p>
    </motion.form>
  );
}
