"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Search,
  Users,
  Mail,
  Download,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { href: "/search",     label: "Recherche",   icon: Search },
  { href: "/prospects",  label: "Prospects",   icon: Users },
  { href: "/mails",      label: "Mails IA",    icon: Mail },
  { href: "/exports",    label: "Exports",     icon: Download },
  { href: "/settings",   label: "Paramètres",  icon: Settings },
];

interface SidebarProps {
  stats?: {
    searches: number;
    prospects: number;
    enriched: number;
    mails: number;
  };
}

export function Sidebar({ stats }: SidebarProps) {
  const path = usePathname();

  return (
    <aside className="w-[248px] flex-shrink-0 bg-[#0D1530] border-r border-[#1E3055] flex flex-col gap-5 sticky top-0 h-screen overflow-y-auto p-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 py-1">
        <div className="bg-[#1A6FFF] text-white font-bold text-[11px] px-2 py-1 rounded-md tracking-wide">
          SIS
        </div>
        <div>
          <div className="text-[13px] font-bold text-white leading-none">Lead Hunter</div>
          <div className="text-[10px] text-[#7A9AC0] mt-0.5">Shabaka Intelligence System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all",
                active
                  ? "bg-[rgba(26,111,255,0.15)] text-[#4D94FF]"
                  : "text-[#3A5080] hover:text-[#7A9AC0] hover:bg-[rgba(255,255,255,0.03)]"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Stats session */}
      {stats && (
        <div className="bg-[#111D3A] border border-[#1E3055] rounded-xl p-3">
          <div className="text-[10px] text-[#7A9AC0] uppercase tracking-widest mb-2.5">
            Session
          </div>
          {[
            { label: "Recherches", value: stats.searches },
            { label: "Prospects", value: stats.prospects, color: "text-[#4D94FF]" },
            { label: "Enrichis", value: stats.enriched, color: "text-[#2ED573]" },
            { label: "Mails IA", value: stats.mails, color: "text-[#FFD700]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-[#7A9AC0]">{label}</span>
              <span className={cn("text-[16px] font-bold text-white", color)}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pied */}
      <div className="mt-auto border-t border-[#1E3055] pt-3 flex items-center gap-2.5">
        <UserButton />
        <div>
          <div className="text-[11px] text-[#7A9AC0]">Mon compte</div>
          <div className="text-[10px] text-[#3A5080]">Brahim El Mouden</div>
        </div>
      </div>

      <div className="text-[10px] text-[#3A5080] leading-relaxed">
        <strong className="text-[#7A9AC0]">Shabaka Invest Group</strong>
        <br />© 2026 — SIS Lead Hunter
      </div>
    </aside>
  );
}
