"use client";

import { Prospect } from "@prisma/client";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBar, ObsScore } from "@/components/ui/score-bar";
import { Copy, ExternalLink, Mail, Phone, Globe } from "lucide-react";
import { useState } from "react";

interface ProspectCardProps {
  prospect: Prospect & { issues?: { label: string; type: "bad" | "warn" | "ok" }[] };
  onGenerateMail?: (id: string) => Promise<void>;
  onStatusChange?: (id: string, status: string) => Promise<void>;
  generatingMail?: boolean;
}

const CRM_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  CONTACTE: "Contacté",
  REPONDU: "Répondu",
  RDV_PRIS: "RDV pris",
  SIGNE: "Signé",
  REFUS: "Refus",
};

export function ProspectCard({ prospect: p, onGenerateMail, onStatusChange, generatingMail }: ProspectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasSocials = p.reseaux && Object.keys(p.reseaux as object).length > 0;
  const socials = hasSocials ? (p.reseaux as Record<string, string>) : {};

  return (
    <div className={cn(
      "bg-[#0F1A35] border border-[#1E3055] rounded-xl p-4 transition-colors",
      "hover:border-[#2A4070]"
    )}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="w-8 h-8 rounded-lg bg-[#0D1530] border border-[#1E3055] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=32`}
            alt=""
            width={22}
            height={22}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-white truncate">{p.domain}</div>
          <div className="text-[12px] text-[#7A9AC0] truncate mt-0.5">{p.title}</div>
          <div className="text-[11px] text-[#3A5080] mt-1 line-clamp-2 leading-relaxed">{p.snippet}</div>
          {p.serpPosition && (
            <div className="text-[10px] text-[#3A5080] mt-1">
              Position #{p.serpPosition} —{" "}
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[#4D94FF] hover:underline inline-flex items-center gap-1">
                Voir le site <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>

        {/* Score obsolescence */}
        <ObsScore value={p.obsScore} />
      </div>

      {/* Score bars */}
      <div className="mt-3 space-y-1.5">
        <ScoreBar label="Mobile" value={p.mobileScore} />
        <ScoreBar label="SEO" value={p.seoScore} />
        <ScoreBar label="Vitesse" value={p.speedScore} />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {p.issues?.map((issue) => (
          <Badge key={issue.label} variant={issue.type}>{issue.label}</Badge>
        ))}
        {p.cms && p.cms !== "Inconnu" && <Badge variant="warn">{p.cms}</Badge>}
        {!p.https && <Badge variant="bad">Sans HTTPS</Badge>}
        {p.enriched && <Badge variant="ok">Enrichi</Badge>}
      </div>

      {/* Données enrichies */}
      {p.enriched && (
        <div
          className={cn(
            "mt-3 bg-[#0D1530] border border-[#1E3055] rounded-lg px-3 py-2.5 space-y-1.5",
            "text-[11px]"
          )}
        >
          {p.phoneFixe && (
            <div className="flex gap-2">
              <span className="text-[#3A5080] w-28 flex-shrink-0">Tél. fixe</span>
              <span className="text-[#E8F0FF] font-mono">{p.phoneFixe}</span>
            </div>
          )}
          {p.phoneMobile && (
            <div className="flex gap-2">
              <span className="text-[#3A5080] w-28 flex-shrink-0">Tél. mobile</span>
              <span className="text-[#E8F0FF] font-mono">{p.phoneMobile}</span>
            </div>
          )}
          {p.emailContact && (
            <div className="flex gap-2">
              <span className="text-[#3A5080] w-28 flex-shrink-0">Email</span>
              <span className="text-[#E8F0FF] font-mono">{p.emailContact}</span>
            </div>
          )}
          {p.ownerName && (
            <div className="flex gap-2">
              <span className="text-[#3A5080] w-28 flex-shrink-0">Propriétaire</span>
              <span className="text-[#E8F0FF]">{p.ownerName}</span>
            </div>
          )}
          {p.domainCreated && (
            <div className="flex gap-2">
              <span className="text-[#3A5080] w-28 flex-shrink-0">Créé le</span>
              <span className="text-[#E8F0FF]">{p.domainCreated}</span>
            </div>
          )}
          {hasSocials && (
            <div className="flex gap-2">
              <span className="text-[#3A5080] w-28 flex-shrink-0">Réseaux</span>
              <span className="text-[#E8F0FF]">{Object.keys(socials).join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* Mail généré */}
      {p.mailObjet && (
        <div className="mt-3 bg-[#0D1530] border border-[#1A6FFF] rounded-lg p-3">
          <div className="text-[11px] text-[#7A9AC0] mb-2 pb-2 border-b border-[#1E3055]">
            <strong className="text-white">Objet :</strong> {p.mailObjet}
          </div>
          {expanded && (
            <pre className="text-[12px] text-[#E8F0FF] whitespace-pre-wrap leading-relaxed font-sans max-h-64 overflow-y-auto">
              {p.mailCorps}
            </pre>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-[#4D94FF] mt-1 hover:underline"
          >
            {expanded ? "Réduire" : "Voir le corps du mail"}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1E3055] flex-wrap">
        {p.emailContact && (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Mail size={12} className="text-[#7A9AC0] flex-shrink-0" />
            <span className="text-[11px] text-[#7A9AC0] font-mono truncate">{p.emailContact}</span>
          </div>
        )}
        {p.phoneFixe && (
          <span className="text-[11px] text-[#7A9AC0] font-mono flex items-center gap-1 flex-shrink-0">
            <Phone size={11} /> {p.phoneFixe}
          </span>
        )}

        <button
          onClick={() => copy(p.emailContact || "")}
          className="text-[11px] px-2 py-1 bg-[#111D3A] border border-[#1E3055] rounded-md text-[#7A9AC0] hover:text-white flex items-center gap-1 flex-shrink-0 transition-colors"
        >
          <Copy size={11} /> {copied ? "Copié !" : "Copier"}
        </button>

        <Button
          variant="primary"
          size="sm"
          loading={generatingMail}
          onClick={() => onGenerateMail?.(p.id)}
          className="flex-shrink-0"
        >
          <Mail size={12} /> {p.mailObjet ? "Regénérer" : "Générer mail"}
        </Button>

        {/* Statut CRM */}
        <select
          value={p.crmStatus}
          onChange={(e) => onStatusChange?.(p.id, e.target.value)}
          className="text-[11px] bg-[#0D1530] border border-[#1E3055] rounded-md px-2 py-1 text-[#7A9AC0] cursor-pointer outline-none [&>option]:bg-[#0D1530] flex-shrink-0"
        >
          {Object.entries(CRM_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
