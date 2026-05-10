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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
  homeAddress: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  additionalInfo: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
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

      const name = `${values.firstName.trim()} ${values.lastName.trim()}`;
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email: values.email, 
          password: values.password,
          image: imageBase64,
          address: values.homeAddress,
          city: values.city,
          country: values.country
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload?.message ?? "Unable to create account.");
        return;
      }

      toast.success("Account created! Please check your email to verify your account.");
      router.push("/login");
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 relative group">
          <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">First Name</Label>
          <Input id="firstName" placeholder="Jane" className="transition-all focus:ring-2 focus:ring-primary/20" {...register("firstName")} />
          {errors.firstName ? <p className="text-xs text-red-600">{errors.firstName.message}</p> : null}
        </div>
        <div className="space-y-1.5 relative group">
          <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Last Name</Label>
          <Input id="lastName" placeholder="Doe" className="transition-all focus:ring-2 focus:ring-primary/20" {...register("lastName")} />
          {errors.lastName ? <p className="text-xs text-red-600">{errors.lastName.message}</p> : null}
        </div>
      </div>

      <div className="space-y-1.5 relative group">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Email Address</Label>
        <Input id="email" type="email" placeholder="you@example.com" className="transition-all focus:ring-2 focus:ring-primary/20" {...register("email")} />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
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
        
        <div className="space-y-1.5 relative group">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Confirm Password</Label>
          <Input id="confirmPassword" type="password" placeholder="Repeat password" className="transition-all focus:ring-2 focus:ring-primary/20" {...register("confirmPassword")} />
          {errors.confirmPassword ? <p className="text-xs text-red-600">{errors.confirmPassword.message}</p> : null}
        </div>
      </div>

      {/* Optional Fields omitted for brevity, keeping just city/country as requested */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 group">
          <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">City (Optional)</Label>
          <Input id="city" placeholder="New York" {...register("city")} />
        </div>
        <div className="space-y-1.5 group">
          <Label htmlFor="country" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Country (Optional)</Label>
          <Input id="country" placeholder="United States" {...register("country")} />
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
      <p className="text-xs text-muted-foreground text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
          Sign in
        </Link>
      </p>
    </motion.form>
  );
}
