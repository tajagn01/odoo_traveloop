import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const payload = signupSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { message: "Invalid signup details." },
        { status: 400 }
      );
    }

    const email = payload.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(payload.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: payload.data.name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Unable to create account." },
      { status: 500 }
    );
  }
}
