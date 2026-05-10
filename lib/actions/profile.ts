"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { uploadImage } from "@/lib/cloudinary";

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  languagePreference: z.string().optional(),
});

export async function updateProfileAction(formData: FormData) {
  const session = await requireAuth();

  const payload = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    languagePreference: formData.get("languagePreference"),
  });

  if (!payload.success) {
    throw new Error("Invalid profile update.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: payload.data.email.toLowerCase() },
  });

  if (existing && existing.id !== session.user.id) {
    throw new Error("Email is already in use.");
  }

  const avatarFile = formData.get("profilePhoto");
  const profilePhoto =
    avatarFile instanceof File && avatarFile.size > 0
      ? await uploadImage(avatarFile)
      : undefined;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: payload.data.name,
      email: payload.data.email.toLowerCase(),
      profilePhoto,
      languagePreference: payload.data.languagePreference ?? null,
    },
  });

  revalidatePath("/profile");
}

export async function deleteAccountAction() {
  const session = await requireAuth();
  await prisma.user.delete({ where: { id: session.user.id } });
  redirect("/login");
}
