import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";

export default async function ExportsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const searches = await prisma.search.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { prospects: true } } },
    take: 20,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-white">Exports</h1>
          <p className="text-[12px] text-[#7A9AC0] mt-0.5">Téléchargez vos prospects en Excel, CSV ou HubSpot</p>
        </div>
      </div>

      {/* Export global */}
      <Card className="mb-5">
        <CardTitle>Export global (tous les prospects)</CardTitle>
        <div className="flex gap-3 flex-wrap">
          {[
            { format: "excel", label: "Excel (.xlsx)", desc: "Multi-feuilles : Prospects + Récap + Pipeline CRM", color: "bg-[rgba(46,213,115,0.15)] text-[#2ED573] border-[rgba(46,213,115,0.3)]" },
            { format: "csv", label: "CSV universel", desc: "Compatible Excel, Google Sheets, OpenOffice", color: "bg-[rgba(26,111,255,0.15)] text-[#4D94FF] border-[rgba(26,111,255,0.3)]" },
            { format: "hubspot", label: "HubSpot CRM", desc: "Import direct dans HubSpot (colonnes standard)", color: "bg-[rgba(255,165,2,0.15)] text-[#FFA502] border-[rgba(255,165,2,0.3)]" },
          ].map(({ format, label, desc, color }) => (
            <a
              key={format}
              href={`/api/export?format=${format}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col gap-1 px-4 py-3 rounded-lg border text-[12px] font-medium transition-all hover:opacity-90 ${color}`}
            >
              <span className="text-[13px] font-semibold">{label}</span>
              <span className="text-[11px] opacity-75">{desc}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* Par session de recherche */}
      <Card>
        <CardTitle>Par session de recherche</CardTitle>
        {searches.length === 0 ? (
          <div className="text-[13px] text-[#3A5080] text-center py-8">
            Aucune recherche effectuée. Allez dans{" "}
            <a href="/search" className="text-[#4D94FF] hover:underline">Recherche</a> pour commencer.
          </div>
        ) : (
          <div className="space-y-2">
            {searches.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-[#0D1530] border border-[#1E3055] rounded-lg px-4 py-3"
              >
                <div>
                  <div className="text-[13px] text-white font-medium">{s.query}</div>
                  <div className="text-[11px] text-[#3A5080] mt-0.5">
                    {s.createdAt.toLocaleDateString("fr-FR")} — {s._count.prospects} prospect(s) — {s.country.toUpperCase()}
                  </div>
                </div>
                <div className="flex gap-2">
                  {["excel", "csv", "hubspot"].map((fmt) => (
                    <a
                      key={fmt}
                      href={`/api/export?format=${fmt}&searchId=${s.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] px-2.5 py-1 bg-[#111D3A] border border-[#1E3055] rounded-md text-[#7A9AC0] hover:text-[#E8F0FF] hover:bg-[#0F1A35] transition-colors uppercase"
                    >
                      {fmt}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
