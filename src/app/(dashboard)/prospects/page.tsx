import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CrmStatus } from "@prisma/client";

const CRM_COLUMNS: { key: CrmStatus; label: string; color: string; bg: string }[] = [
  { key: "NOUVEAU",   label: "Nouveau",  color: "text-[#7A9AC0]",  bg: "bg-[rgba(122,154,192,0.1)]" },
  { key: "CONTACTE",  label: "Contacté", color: "text-[#4D94FF]",  bg: "bg-[rgba(26,111,255,0.1)]" },
  { key: "REPONDU",   label: "Répondu",  color: "text-[#FFA502]",  bg: "bg-[rgba(255,165,2,0.1)]" },
  { key: "RDV_PRIS",  label: "RDV pris", color: "text-[#FFD700]",  bg: "bg-[rgba(255,215,0,0.1)]" },
  { key: "SIGNE",     label: "Signé",    color: "text-[#2ED573]",  bg: "bg-[rgba(46,213,115,0.1)]" },
  { key: "REFUS",     label: "Refus",    color: "text-[#FF4757]",  bg: "bg-[rgba(255,71,87,0.1)]" },
];

export default async function ProspectsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const prospects = await prisma.prospect.findMany({
    where: { userId },
    orderBy: { obsScore: "desc" },
  });

  const byStatus = Object.fromEntries(
    CRM_COLUMNS.map((col) => [col.key, prospects.filter((p) => p.crmStatus === col.key)])
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-white">Pipeline CRM</h1>
          <p className="text-[12px] text-[#7A9AC0] mt-0.5">{prospects.length} prospect(s) total</p>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CRM_COLUMNS.map((col) => {
          const items = byStatus[col.key] || [];
          return (
            <div key={col.key}>
              <div className={`rounded-lg p-2 mb-2 ${col.bg}`}>
                <div className={`text-[11px] font-semibold ${col.color}`}>{col.label}</div>
                <div className="text-[18px] font-bold text-white">{items.length}</div>
              </div>
              <div className="space-y-2">
                {items.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#0F1A35] border border-[#1E3055] rounded-lg p-2.5 hover:border-[#2A4070] transition-colors"
                  >
                    <div className="text-[12px] font-semibold text-white truncate">{p.domain}</div>
                    {p.emailContact && (
                      <div className="text-[10px] text-[#3A5080] font-mono truncate mt-0.5">{p.emailContact}</div>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <Badge variant={p.obsScore >= 70 ? "bad" : p.obsScore >= 50 ? "warn" : "ok"}>
                        {p.obsScore}/100
                      </Badge>
                      {p.enriched && <span className="text-[10px] text-[#2ED573]">●</span>}
                    </div>
                  </div>
                ))}
                {items.length > 8 && (
                  <div className="text-[11px] text-[#3A5080] text-center py-1">
                    +{items.length - 8} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Liste complète */}
      <Card className="mt-6">
        <CardTitle>Tous les prospects ({prospects.length})</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#1E3055]">
                {["Domaine", "Score", "CMS", "Email", "Statut", "Date"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-[11px] text-[#7A9AC0] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.id} className="border-b border-[#0F1A35] hover:bg-[#0D1530] transition-colors">
                  <td className="py-2 px-3 text-white font-medium">{p.domain}</td>
                  <td className="py-2 px-3">
                    <span className={p.obsScore >= 70 ? "text-[#FF4757]" : p.obsScore >= 50 ? "text-[#FFA502]" : "text-[#2ED573]"}>
                      {p.obsScore}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#7A9AC0]">{p.cms || "—"}</td>
                  <td className="py-2 px-3 text-[#7A9AC0] font-mono">{p.emailContact || "—"}</td>
                  <td className="py-2 px-3">
                    <Badge variant={
                      p.crmStatus === "SIGNE" ? "ok" :
                      p.crmStatus === "REFUS" ? "bad" :
                      p.crmStatus === "RDV_PRIS" ? "warn" : "default"
                    }>
                      {p.crmStatus}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-[#3A5080]">{p.createdAt.toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
