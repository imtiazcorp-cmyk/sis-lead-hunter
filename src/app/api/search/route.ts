export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canSearch } from "@/lib/plans";
import { estimateScores } from "@/lib/enrichment/pagespeed";

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function detectIssues(snippet: string, title: string) {
  const tx = (snippet + " " + title).toLowerCase();
  const issues: { label: string; type: "bad" | "warn" | "ok" }[] = [];

  if (["wix", "jimdo", "duda", "weebly"].some((x) => tx.includes(x)))
    issues.push({ label: "Constructeur obsolète", type: "bad" });
  if (tx.includes("flash")) issues.push({ label: "Flash détecté", type: "bad" });
  if (/201[0-5]/.test(tx)) issues.push({ label: "Site très ancien", type: "bad" });
  else if (/201[6-9]/.test(tx)) issues.push({ label: "Site vieillissant", type: "warn" });
  if (!tx.includes("responsive") && !tx.includes("mobile"))
    issues.push({ label: "Mobile incertain", type: "warn" });

  return issues.length ? issues : [{ label: "À analyser", type: "ok" as const }];
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (!canSearch(user.plan, user.searchesThisMonth)) {
    return NextResponse.json(
      { error: "Quota de recherches atteint. Passez au plan supérieur." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { query, country = "fr", lang = "fr", num = 20, scoreMin = 40 } = body;

  if (!query?.trim()) {
    return NextResponse.json({ error: "Requête manquante" }, { status: 400 });
  }

  const serperKey = user.serperKey || process.env.SERPER_API_KEY;
  if (!serperKey) {
    return NextResponse.json(
      { error: "Clé API Serper non configurée. Rendez-vous dans Paramètres." },
      { status: 400 }
    );
  }

  // Appel Serper.dev
  const serperRes = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": serperKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, gl: country, hl: lang, num }),
  });

  if (!serperRes.ok) {
    const err = await serperRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.message || `Erreur Serper ${serperRes.status}` },
      { status: serperRes.status }
    );
  }

  const serperData = await serperRes.json();
  const organic: Array<{ link: string; title: string; snippet?: string }> =
    serperData.organic || [];

  // Créer la session de recherche en BDD
  const search = await prisma.search.create({
    data: {
      userId,
      query,
      country,
      lang,
      totalResults: organic.length,
    },
  });

  // Construire les prospects (sans enrichissement — asynchrone)
  const prospects = [];
  const seenDomains = new Set<string>();

  for (let i = 0; i < organic.length; i++) {
    const item = organic[i];
    const domain = domainFromUrl(item.link);
    if (seenDomains.has(domain)) continue;
    seenDomains.add(domain);

    const snippet = item.snippet || "";
    const title = item.title || domain;
    const scores = estimateScores(snippet, title, i + 1);

    if (scores.obs < scoreMin) continue;

    const issues = detectIssues(snippet, title);

    const prospect = await prisma.prospect.create({
      data: {
        userId,
        searchId: search.id,
        domain,
        url: item.link,
        title,
        snippet,
        serpPosition: i + 1,
        obsScore: scores.obs,
        mobileScore: scores.mobile,
        seoScore: scores.seo,
        speedScore: scores.speed,
        https: item.link.startsWith("https"),
        emailContact: `contact@${domain}`,
        crmStatus: "NOUVEAU",
      },
    });

    prospects.push({ ...prospect, issues });
  }

  // Incrémenter le compteur de recherches
  await prisma.user.update({
    where: { id: userId },
    data: { searchesThisMonth: { increment: 1 } },
  });

  return NextResponse.json({ searchId: search.id, prospects });
}
