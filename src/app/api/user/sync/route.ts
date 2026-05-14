import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "Utilisateur Clerk introuvable" }, { status: 404 });

  const email = clerkUser.emailAddresses[0]?.emailAddress || "";

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { email },
    create: {
      id: userId,
      email,
      signatureName: "Brahim El Mouden",
      signatureTitle: "Président, Shabaka Invest Group",
      signatureEntity: "Shabaka Intelligence System (SIS)",
      signatureTelMa: "+212 6 80 76 03 52",
      signatureTelFr: "+33 7 74 49 64 40",
      signatureEmail: "shabakainvestgroup@gmail.com",
      signatureCity: "40000 Marrakech",
    },
  });

  return NextResponse.json(user);
}
