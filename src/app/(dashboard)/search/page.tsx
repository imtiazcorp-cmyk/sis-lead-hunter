"use client";

import { useState, useCallback } from "react";
import { Prospect } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardTitle } from "@/components/ui/card";
import { ProspectCard } from "@/components/search/prospect-card";
import { Search, Download, Zap } from "lucide-react";

const PRESETS = [
  "site:* plombier \"notre site\" 2018",
  "site:* restaurant \"bienvenue\" 2017",
  "artisan électricien site obsolète",
  "cabinet médical site ancien flash",
  "coiffeur \"depuis 2015\" site web",
  "hôtel \"voir notre site\" 2016",
];

const COUNTRIES = [
  { value: "fr", label: "France (fr)" },
  { value: "ma", label: "Maroc (ma)" },
  { value: "be", label: "Belgique (be)" },
  { value: "ch", label: "Suisse (ch)" },
  { value: "us", label: "États-Unis (us)" },
  { value: "gb", label: "Royaume-Uni (gb)" },
  { value: "de", label: "Allemagne (de)" },
  { value: "es", label: "Espagne (es)" },
];

type EnrichOptions = {
  doScrape: boolean;
  doCMS: boolean;
  doWhois: boolean;
  doSocial: boolean;
  doPageSpeed: boolean;
};

type ProspectWithIssues = Prospect & { issues?: { label: string; type: "bad" | "warn" | "ok" }[] };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("fr");
  const [lang, setLang] = useState("fr");
  const [num, setNum] = useState("20");
  const [scoreMin, setScoreMin] = useState("40");
  const [enrichOpts, setEnrichOpts] = useState<EnrichOptions>({
    doScrape: true,
    doCMS: true,
    doWhois: true,
    doSocial: true,
    doPageSpeed: true,
  });

  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [prospects, setProspects] = useState<ProspectWithIssues[]>([]);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [generatingMailId, setGeneratingMailId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setStatus("Recherche en cours...");
    setProgress(10);
    setProspects([]);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, country, lang, num: parseInt(num), scoreMin: parseInt(scoreMin) }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur recherche");

      setSearchId(data.searchId);
      setProspects(data.prospects);
      setProgress(30);
      setStatus(`${data.prospects.length} prospect(s) trouvé(s) — Enrichissement en cours...`);
      setLoading(false);

      // Enrichissement SSE
      setEnriching(true);
      const evtSource = new EventSource(`/api/enrich?searchId=${data.searchId}`);

      evtSource.onmessage = (e) => {
        const event = JSON.parse(e.data);

        if (event.type === "total") {
          setStatus(`Enrichissement de ${event.count} site(s)...`);
        } else if (event.type === "progress") {
          const pct = 30 + Math.round((event.index / (data.prospects.length || 1)) * 65);
          setProgress(pct);
          setStatus(`Analyse ${event.index + 1}/${data.prospects.length} : ${event.domain}`);
        } else if (event.type === "done") {
          setProspects((prev) =>
            prev.map((p) => (p.id === event.prospect.id ? { ...event.prospect, issues: p.issues } : p))
          );
        } else if (event.type === "complete") {
          setProgress(100);
          setStatus(`✓ ${data.prospects.length} prospect(s) enrichi(s)`);
          setEnriching(false);
          evtSource.close();
        } else if (event.type === "error") {
          console.warn("Enrichissement échoué pour", event.domain);
        }
      };

      evtSource.onerror = () => {
        setEnriching(false);
        evtSource.close();
      };
    } catch (err: unknown) {
      setStatus(`✗ ${err instanceof Error ? err.message : "Erreur inconnue"}`);
      setLoading(false);
      setEnriching(false);
    }
  };

  const handleGenerateMail = useCallback(async (id: string) => {
    setGeneratingMailId(id);
    try {
      const res = await fetch("/api/generate-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProspects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, mailObjet: data.objet, mailCorps: data.corps } : p))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur génération mail");
    } finally {
      setGeneratingMailId(null);
    }
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, crmStatus: status as Prospect["crmStatus"] } : p)));
    await fetch("/api/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, crmStatus: status }),
    });
  }, []);

  const handleExport = (format: string) => {
    const url = searchId
      ? `/api/export?format=${format}&searchId=${searchId}`
      : `/api/export?format=${format}`;
    window.open(url, "_blank");
  };

  const isRunning = loading || enriching;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-white">Recherche de prospects</h1>
          <p className="text-[12px] text-[#7A9AC0] mt-0.5">Trouvez des sites obsolètes via Google Search</p>
        </div>
      </div>

      {/* Config */}
      <Card className="mb-4">
        <CardTitle>Paramètres de recherche</CardTitle>
        <div className="space-y-4">
          {/* Requête */}
          <div>
            <Input
              label="Requête Google"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='plombier "notre site" site obsolète 2017'
              onKeyDown={(e) => e.key === "Enter" && !isRunning && handleSearch()}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setQuery(p)}
                  className="text-[11px] px-2.5 py-1 bg-[#111D3A] border border-[#1E3055] rounded-md text-[#7A9AC0] hover:text-[#E8F0FF] hover:bg-[#0D1530] transition-colors"
                >
                  {p.length > 40 ? p.slice(0, 40) + "…" : p}
                </button>
              ))}
            </div>
          </div>

          {/* Paramètres */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select label="Pays" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
            <Select label="Langue" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">Arabe</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </Select>
            <Select label="Résultats" value={num} onChange={(e) => setNum(e.target.value)}>
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{n} résultats</option>
              ))}
            </Select>
            <Select label="Score min." value={scoreMin} onChange={(e) => setScoreMin(e.target.value)}>
              {[30, 40, 50, 60, 70].map((s) => (
                <option key={s} value={s}>≥ {s}/100</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Options enrichissement */}
      <Card className="mb-4">
        <CardTitle>Enrichissement automatique</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {([
            { key: "doScrape", label: "Téléphone + Email", sub: "Scraping HTML de la page" },
            { key: "doCMS", label: "Détection CMS", sub: "WP, Wix, Shopify, Duda..." },
            { key: "doWhois", label: "WHOIS / RDAP", sub: "Propriétaire, date création" },
            { key: "doSocial", label: "Réseaux sociaux", sub: "FB, LinkedIn, Instagram..." },
            { key: "doPageSpeed", label: "PageSpeed réels", sub: "Google Lighthouse API" },
          ] as { key: keyof EnrichOptions; label: string; sub: string }[]).map(({ key, label, sub }) => (
            <Toggle
              key={key}
              checked={enrichOpts[key]}
              onChange={(v) => setEnrichOpts((o) => ({ ...o, [key]: v }))}
              label={label}
              sub={sub}
            />
          ))}
        </div>
      </Card>

      {/* Lancement */}
      <div className="flex gap-3 items-center mb-5">
        <Button
          variant="primary"
          size="lg"
          loading={isRunning}
          onClick={handleSearch}
          disabled={!query.trim() || isRunning}
        >
          <Search size={16} /> {isRunning ? "En cours..." : "Lancer la recherche"}
        </Button>

        {prospects.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" variant="green" onClick={() => handleExport("excel")}>
              <Download size={13} /> Excel
            </Button>
            <Button size="sm" variant="default" onClick={() => handleExport("csv")}>
              <Download size={13} /> CSV
            </Button>
            <Button size="sm" variant="default" onClick={() => handleExport("hubspot")}>
              <Download size={13} /> HubSpot
            </Button>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      {(isRunning || progress > 0) && (
        <div className="bg-[#0D1530] border border-[#1E3055] rounded-lg p-3 mb-5">
          <div className="flex justify-between text-[12px] text-[#7A9AC0] mb-2">
            <div className="flex items-center gap-2">
              {isRunning && (
                <span className="w-3 h-3 rounded-full border-2 border-[#1E3055] border-t-[#1A6FFF] animate-spin inline-block" />
              )}
              <span>{status}</span>
            </div>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-[#111D3A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A6FFF] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Résultats */}
      {prospects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-[#E8F0FF] flex items-center gap-2">
              <Zap size={14} className="text-[#1A6FFF]" />
              {prospects.length} prospect(s) trouvé(s)
            </h2>
          </div>
          <div className="space-y-3">
            {prospects.map((p) => (
              <ProspectCard
                key={p.id}
                prospect={p}
                onGenerateMail={handleGenerateMail}
                onStatusChange={handleStatusChange}
                generatingMail={generatingMailId === p.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
