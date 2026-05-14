import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plans";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Search, Users, Mail, Zap } from "lucide-react";

async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [totalSearches, totalProspects, enrichedCount, mailsCount, crmStats] = await Promise.all([
    prisma.search.count({ where: { userId } }),
    prisma.prospect.count({ where: { userId } }),
    prisma.prospect.count({ where: { userId, enriched: true } }),
    prisma.prospect.count({ where: { userId, mailObjet: { not: null } } }),
    prisma.prospect.groupBy({
      by: ["crmStatus"],
      where: { userId },
      _count: true,
    }),
  ]);

  return { user, totalSearches, totalProspects, enrichedCount, mailsCount, crmStats };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await getDashboardData(userId);
  if (!data) redirect("/onboarding");

  const { user, totalSearches, totalProspects, enrichedCount, mailsCount, crmStats } = data;

  const limits = PLAN_LIMITS[user.plan];
  const searchPct = limits.searches === -1 ? 0 : Math.round((user.searchesThisMonth / limits.searches) * 100);
  const mailPct = limits.mails === -1 ? 0 : Math.round((user.mailsThisMonth / limits.mails) * 100);

  const crmMap = Object.fromEntries(crmStats.map((s) => [s.crmStatus, s._count]));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-white">Dashboard</h1>
          <p className="text-[12px] text-[#7A9AC0] mt-0.5">Vue d'ensemble de votre activité</p>
        </div>
        <Badge variant="accent">Plan {user.plan}</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Search, label: "Recherches", value: totalSearches, color: "text-[#4D94FF]" },
          { icon: Users, label: "Prospects", value: totalProspects, color: "text-[#E8F0FF]" },
          { icon: Zap, label: "Enrichis", value: enrichedCount, color: "text-[#2ED573]" },
          { icon: Mail, label: "Mails IA", value: mailsCount, color: "text-[#FFD700]" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#7A9AC0]">
              <Icon size={14} />
              <span className="text-[11px] font-medium">{label}</span>
            </div>
            <div className={`text-[32px] font-bold leading-none ${color}`}>{value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Quotas du mois */}
        <Card>
          <CardTitle>Quotas ce mois</CardTitle>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-[#7A9AC0]">Recherches</span>
                <span className="text-[#E8F0FF]">
                  {user.searchesThisMonth} / {limits.searches === -1 ? "∞" : limits.searches}
                </span>
              </div>
              <div className="h-1.5 bg-[#111D3A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1A6FFF] transition-all"
                  style={{ width: `${Math.min(searchPct, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-[#7A9AC0]">Mails IA</span>
                <span className="text-[#E8F0FF]">
                  {user.mailsThisMonth} / {limits.mails === -1 ? "∞" : limits.mails}
                </span>
              </div>
              <div className="h-1.5 bg-[#111D3A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(mailPct, 100)}%`,
                    background: mailPct > 80 ? "#FF4757" : mailPct > 60 ? "#FFA502" : "#1A6FFF",
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Pipeline CRM */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={13} /> Pipeline CRM
          </CardTitle>
          <div className="space-y-2">
            {[
              { key: "NOUVEAU", label: "Nouveau", color: "bg-[#7A9AC0]" },
              { key: "CONTACTE", label: "Contacté", color: "bg-[#1A6FFF]" },
              { key: "REPONDU", label: "Répondu", color: "bg-[#FFA502]" },
              { key: "RDV_PRIS", label: "RDV pris", color: "bg-[#FFD700]" },
              { key: "SIGNE", label: "Signé", color: "bg-[#2ED573]" },
              { key: "REFUS", label: "Refus", color: "bg-[#FF4757]" },
            ].map(({ key, label, color }) => {
              const count = crmMap[key] || 0;
              const pct = totalProspects ? Math.round((count / totalProspects) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[11px] text-[#7A9AC0] w-20 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1 bg-[#111D3A] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-[#E8F0FF] w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
