export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { canGenerateMail } from "@/lib/plans";

const DEFAULT_SIG = {
  name: "Brahim El Mouden",
  title: "Président, Shabaka Invest Group",
  entity: "Shabaka Intelligence System (SIS)",
  telMa: "+212 6 80 76 03 52",
  telFr: "+33 7 74 49 64 40",
  email: "shabakainvestgroup@gmail.com",
  ville: "40000 Marrakech",
};

function buildSignature(user: {
  signatureName: string | null;
  signatureTitle: string | null;
  signatureEntity: string | null;
  signatureTelMa: string | null;
  signatureTelFr: string | null;
  signatureEmail: string | null;
  signatureCity: string | null;
}) {
  const sig = {
    name: user.signatureName || DEFAULT_SIG.name,
    title: user.signatureTitle || DEFAULT_SIG.title,
    entity: user.signatureEntity || DEFAULT_SIG.entity,
    telMa: user.signatureTelMa || DEFAULT_SIG.telMa,
    telFr: user.signatureTelFr || DEFAULT_SIG.telFr,
    email: user.signatureEmail || DEFAULT_SIG.email,
    ville: user.signatureCity || DEFAULT_SIG.ville,
  };

  return `${sig.name}
${sig.title}
${sig.entity}
Tel. Maroc : ${sig.telMa}
WhatsApp / France : ${sig.telFr}
Email : ${sig.email}
${sig.ville}`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (!canGenerateMail(user.plan, user.mailsThisMonth)) {
    return NextResponse.json(
      { error: "Quota de mails IA atteint. Passez au plan supérieur." },
      { status: 429 }
    );
  }

  const { prospectId } = await req.json();
  if (!prospectId) return NextResponse.json({ error: "prospectId manquant" }, { status: 400 });

  const prospect = await prisma.prospect.findFirst({
    where: { id: prospectId, userId },
  });
  if (!prospect) return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });

  const claudeKey = user.claudeKey || process.env.ANTHROPIC_API_KEY;
  if (!claudeKey) {
    return NextResponse.json(
      { error: "Clé API Claude non configurée. Rendez-vous dans Paramètres." },
      { status: 400 }
    );
  }

  const signature = buildSignature(user);
  const socialsText = prospect.reseaux
    ? Object.keys(prospect.reseaux as object).join(", ") || "absents"
    : "absents";

  const prompt = `Tu es l'équipe commerciale de Shabaka Intelligence System (SIS), spécialiste de la refonte de sites web obsolètes.

Rédige un email de prospection B2B professionnel pour ce prospect :

INFORMATIONS DU SITE :
- Domaine : ${prospect.domain}
- Titre : ${prospect.title || prospect.domain}
- Description : ${prospect.snippet || "Non disponible"}
- Position Google : #${prospect.serpPosition || "?"}
- CMS détecté : ${prospect.cms || "Inconnu"}
- Score d'obsolescence : ${prospect.obsScore}/100 (plus élevé = plus obsolète)
- Score mobile : ${prospect.mobileScore}/100
- Score SEO : ${prospect.seoScore}/100
- Score vitesse : ${prospect.speedScore}/100
- HTTPS : ${prospect.https ? "Oui" : "Non"}
- Réseaux sociaux : ${socialsText}

CONTACT :
- Téléphone fixe : ${prospect.phoneFixe || "non trouvé"}
- Téléphone mobile : ${prospect.phoneMobile || "non trouvé"}
- Propriétaire : ${prospect.ownerName || "inconnu"}

RÈGLES STRICTES :
- Commencer par "Madame, Monsieur,"
- Ton direct, humain, professionnel, jamais agressif
- 4 paragraphes maximum
- Mentionner les vrais scores de façon naturelle
- Proposer : création site 2 900 EUR HT + gestion mensuelle 390 EUR HT/mois sans engagement
- Pas de tirets longs ; utiliser virgules ou points-virgules
- Première ligne exacte : "OBJET: [sujet accrocheur]"
- Puis le corps du mail
- Terminer par cette signature exacte :

${signature}

Ne rien ajouter après la signature.`;

  const client = new Anthropic({ apiKey: claudeKey });

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (message.content[0] as { text: string }).text || "";
  const lines = text.trim().split("\n");
  const objetLine = lines.find((l) => l.startsWith("OBJET:"));
  const objet = objetLine ? objetLine.replace("OBJET:", "").trim() : "";
  const corps = lines.filter((l) => !l.startsWith("OBJET:")).join("\n").trim();

  // Sauvegarder le mail généré
  const updated = await prisma.prospect.update({
    where: { id: prospectId },
    data: { mailObjet: objet, mailCorps: corps },
  });

  // Incrémenter le compteur mails
  await prisma.user.update({
    where: { id: userId },
    data: { mailsThisMonth: { increment: 1 } },
  });

  return NextResponse.json({ objet, corps, prospect: updated });
}
