import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "./prisma";

// Simple in-memory rate limiting for login attempts
const rateLimitCache = new Map<string, { count: number; expiresAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("AUTHORIZE CALL START", credentials?.email);
        // Rate limiting logic
        const ip = req?.headers?.["x-forwarded-for"] || "unknown-ip";
        const email = (credentials?.email ?? "").trim().toLowerCase();
        const rateLimitKey = `${ip}-${email}`;
        
        const now = Date.now();
        const record = rateLimitCache.get(rateLimitKey);
        
        if (record && record.count >= MAX_ATTEMPTS && now < record.expiresAt) {
          console.log("RATE LIMIT HIT");
          throw new Error("Too many attempts. Please try again later.");
        }

        const password = credentials?.password ?? "";
        const parsed = credentialsSchema.safeParse({ email, password });
        if (!parsed.success) {
          console.log("ZOD PARSE FAILED");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) {
          console.log("USER NOT FOUND IN DB");
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) {
          console.log("INVALID PASSWORD");
          // Increment rate limit
          if (record && now < record.expiresAt) {
            record.count += 1;
            rateLimitCache.set(rateLimitKey, record);
          } else {
            rateLimitCache.set(rateLimitKey, { count: 1, expiresAt: now + LOCKOUT_MS });
          }
          throw new Error("Invalid credentials.");
        }
        
        // Reset rate limit on success
        rateLimitCache.delete(rateLimitKey);

        if (!user.emailVerified) {
          console.log("EMAIL NOT VERIFIED");
          throw new Error("Please verify your email address before signing in.");
        }

        console.log("LOGIN SUCCESS");
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? user.profilePhoto ?? null,
          languagePreference: user.languagePreference ?? null,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.profilePhoto = user.image ?? null;
        token.languagePreference =
          "languagePreference" in user ? user.languagePreference ?? null : null;
        token.emailVerified = "emailVerified" in user ? user.emailVerified ?? null : null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.profilePhoto = token.profilePhoto as string | null;
        session.user.languagePreference = token.languagePreference as string | null;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
};
