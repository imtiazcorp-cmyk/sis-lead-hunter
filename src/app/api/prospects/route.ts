export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CrmStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const searchId = searchParams.get("searchId");
  const status = searchParams.get("status") as CrmStatus | null;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where = {
    userId,
    ...(searchId ? { searchId } : {}),
    ...(status ? { crmStatus: status } : {}),
  };

  const [total, prospects] = await Promise.all([
    prisma.prospect.count({ where }),
    prisma.prospect.findMany({
      where,
      orderBy: { obsScore: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ total, prospects, page, limit });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const prospect = await prisma.prospect.updateMany({
    where: { id, userId },
    data,
  });

  if (!prospect.count) {
    return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
  }

  const updated = await prisma.prospect.findUnique({ where: { id } });
  return NextResponse.json(updated);
}
