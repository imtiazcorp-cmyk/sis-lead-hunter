export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      serperKey: true,
      claudeKey: true,
      signatureName: true,
      signatureTitle: true,
      signatureEntity: true,
      signatureTelMa: true,
      signatureTelFr: true,
      signatureEmail: true,
      signatureCity: true,
      searchesThisMonth: true,
      mailsThisMonth: true,
      periodResetAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const allowed = [
    "serperKey", "claudeKey",
    "signatureName", "signatureTitle", "signatureEntity",
    "signatureTelMa", "signatureTelFr", "signatureEmail", "signatureCity",
  ];

  const data = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  const user = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json(user);
}
