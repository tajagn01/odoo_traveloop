import { NextResponse } from "next/server";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const payload = forgotSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { message: "Enter a valid email address." },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "Reset link requested." });
}
