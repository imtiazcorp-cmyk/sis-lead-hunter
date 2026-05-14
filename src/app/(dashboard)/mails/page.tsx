import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MailsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const prospects = await prisma.prospect.findMany({
    where: { userId, mailObjet: { not: null } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-white">Mails générés</h1>
          <p className="text-[12px] text-[#7A9AC0] mt-0.5">{prospects.length} mail(s) IA dans votre bibliothèque</p>
        </div>
      </div>

      {prospects.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-[#3A5080] text-[13px]">Aucun mail généré pour l'instant.</div>
            <a href="/search" className="text-[#4D94FF] text-[13px] hover:underline mt-2 inline-block">
              Aller dans Recherche → Générer un mail IA
            </a>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {prospects.map((p) => (
            <div key={p.id} className="bg-[#0F1A35] border border-[#1E3055] rounded-xl p-4 hover:border-[#2A4070] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[14px] font-bold text-white">{p.domain}</div>
                  <div className="text-[11px] text-[#7A9AC0] mt-0.5">
                    {p.updatedAt.toLocaleDateString("fr-FR")} — Obsolescence {p.obsScore}/100
                  </div>
                </div>
                <Badge variant={
                  p.crmStatus === "SIGNE" ? "ok" :
                  p.crmStatus === "REFUS" ? "bad" :
                  p.crmStatus === "RDV_PRIS" ? "warn" : "accent"
                }>
                  {p.crmStatus}
                </Badge>
              </div>

              <div className="bg-[#0D1530] border border-[#1A6FFF] rounded-lg p-3">
                <div className="text-[11px] text-[#7A9AC0] mb-2 pb-2 border-b border-[#1E3055]">
                  <strong className="text-white">Objet :</strong> {p.mailObjet}
                </div>
                <pre className="text-[12px] text-[#E8F0FF] whitespace-pre-wrap leading-relaxed font-sans max-h-48 overflow-y-auto">
                  {p.mailCorps}
                </pre>
              </div>

              <div className="flex gap-2 mt-3">
                {p.emailContact && (
                  <a
                    href={`mailto:${p.emailContact}?subject=${encodeURIComponent(p.mailObjet || "")}&body=${encodeURIComponent(p.mailCorps || "")}`}
                    className="text-[12px] px-3 py-1.5 bg-[#1A6FFF] text-white rounded-lg hover:bg-[#1560E0] transition-colors"
                  >
                    Envoyer via client mail
                  </a>
                )}
                <button
                  onClick={() => navigator.clipboard.writeText(`${p.mailObjet}\n\n${p.mailCorps}`)}
                  className="text-[12px] px-3 py-1.5 bg-[#111D3A] border border-[#1E3055] text-[#7A9AC0] rounded-lg hover:text-white transition-colors"
                >
                  Copier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
