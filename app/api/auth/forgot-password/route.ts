import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const payload = forgotSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.data.email.toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({
      message: "If the email exists, a reset link will be sent.",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    }),
  ]);

  const origin = new URL(request.url).origin;
  return NextResponse.json({
    message: "If the email exists, a reset link will be sent.",
    resetUrl: `${origin}/forgot-password?token=${token}`,
  });
}

export async function PUT(request: Request) {
  const payload = resetSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: "Enter a valid reset token and password." },
      { status: 400 }
    );
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: payload.data.token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { message: "This reset link is invalid or expired." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(payload.data.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return NextResponse.json({ message: "Password reset successful." });
}
