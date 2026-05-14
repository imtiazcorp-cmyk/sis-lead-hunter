export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateExcel, generateHubSpotCSV } from "@/lib/export/excel";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "excel";
  const searchId = searchParams.get("searchId");

  const where = searchId ? { userId, searchId } : { userId };
  const prospects = await prisma.prospect.findMany({
    where,
    orderBy: { obsScore: "desc" },
  });

  if (!prospects.length) {
    return NextResponse.json({ error: "Aucun prospect à exporter" }, { status: 404 });
  }

  const date = new Date().toISOString().split("T")[0];

  if (format === "excel") {
    const buffer = generateExcel(prospects);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="SIS_Leads_${date}.xlsx"`,
      },
    });
  }

  if (format === "hubspot") {
    const csv = generateHubSpotCSV(prospects);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="SIS_HubSpot_${date}.csv"`,
      },
    });
  }

  // CSV universel
  const headers = [
    "Domaine", "URL", "Score obsolescence", "Mobile", "SEO", "Vitesse",
    "CMS", "Tél. fixe", "Tél. mobile", "Email", "Propriétaire",
    "Domaine créé", "Réseaux", "HTTPS", "Objet mail", "Statut CRM",
  ];
  const rows = prospects.map((p) => [
    p.domain, p.url, p.obsScore, p.mobileScore, p.seoScore, p.speedScore,
    p.cms || "", p.phoneFixe || "", p.phoneMobile || "", p.emailContact || "",
    p.ownerName || "", p.domainCreated || "",
    p.reseaux ? Object.keys(p.reseaux as object).join(", ") : "",
    p.https ? "Oui" : "Non", p.mailObjet || "", p.crmStatus,
  ]);

  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + headers.map(escape).join(";") + "\n" + rows.map((r) => r.map(escape).join(";")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="SIS_Leads_${date}.csv"`,
    },
  });
}
