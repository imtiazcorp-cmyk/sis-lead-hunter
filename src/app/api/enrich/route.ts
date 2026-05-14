export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichProspect } from "@/lib/enrichment";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { prospectId, options } = await req.json();
  if (!prospectId) return NextResponse.json({ error: "prospectId manquant" }, { status: 400 });

  const prospect = await prisma.prospect.findFirst({
    where: { id: prospectId, userId },
  });

  if (!prospect) return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });

  const data = await enrichProspect(
    prospect.url,
    prospect.domain,
    prospect.snippet || "",
    prospect.title || "",
    prospect.serpPosition || 1,
    options
  );

  const updated = await prisma.prospect.update({
    where: { id: prospectId },
    data: {
      ...data,
      enriched: true,
      enrichedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}

// SSE — enrichissement en masse avec progression temps réel
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Non authentifié", { status: 401 });

  const { searchParams } = new URL(req.url);
  const searchId = searchParams.get("searchId");
  if (!searchId) return new Response("searchId manquant", { status: 400 });

  const prospects = await prisma.prospect.findMany({
    where: { userId, searchId, enriched: false },
    select: { id: true, url: true, domain: true, snippet: true, title: true, serpPosition: true },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "total", count: prospects.length });

      for (let i = 0; i < prospects.length; i++) {
        const p = prospects[i];
        send({ type: "progress", index: i, domain: p.domain });

        try {
          const data = await enrichProspect(
            p.url,
            p.domain,
            p.snippet || "",
            p.title || "",
            p.serpPosition || 1
          );

          const updated = await prisma.prospect.update({
            where: { id: p.id },
            data: { ...data, enriched: true, enrichedAt: new Date() },
          });

          send({ type: "done", index: i, prospect: updated });
        } catch {
          send({ type: "error", index: i, domain: p.domain });
        }
      }

      send({ type: "complete" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
