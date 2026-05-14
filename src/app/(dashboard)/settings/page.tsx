"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Key, User, ExternalLink } from "lucide-react";

interface Settings {
  plan: string;
  serperKey: string | null;
  claudeKey: string | null;
  signatureName: string | null;
  signatureTitle: string | null;
  signatureEntity: string | null;
  signatureTelMa: string | null;
  signatureTelFr: string | null;
  signatureEmail: string | null;
  signatureCity: string | null;
  searchesThisMonth: number;
  mailsThisMonth: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/user/settings")
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serperKey: settings.serperKey,
          claudeKey: settings.claudeKey,
          signatureName: settings.signatureName,
          signatureTitle: settings.signatureTitle,
          signatureEntity: settings.signatureEntity,
          signatureTelMa: settings.signatureTelMa,
          signatureTelFr: settings.signatureTelFr,
          signatureEmail: settings.signatureEmail,
          signatureCity: settings.signatureCity,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof Settings, value: string) =>
    setSettings((s) => s ? ({ ...s, [key]: value }) : s);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 rounded-full border-2 border-[#1E3055] border-t-[#1A6FFF] animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-white">Paramètres</h1>
          <p className="text-[12px] text-[#7A9AC0] mt-0.5">Clés API, signature et plan</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="accent">Plan {settings.plan}</Badge>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            <Save size={13} /> {saved ? "Sauvegardé !" : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Clés API */}
      <Card className="mb-4">
        <CardTitle className="flex items-center gap-2">
          <Key size={13} /> Clés API
        </CardTitle>
        <div className="space-y-4">
          <div>
            <Input
              label="Clé API Serper.dev (obligatoire pour la recherche)"
              type="password"
              value={settings.serperKey || ""}
              onChange={(e) => set("serperKey", e.target.value)}
              placeholder="Votre clé Serper.dev..."
              hint="Obtenez votre clé sur serper.dev — 2 500 requêtes/mois gratuites"
            />
            <a
              href="https://serper.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#4D94FF] flex items-center gap-1 mt-1.5 hover:underline"
            >
              serper.dev <ExternalLink size={10} />
            </a>
          </div>

          <div>
            <Input
              label="Clé API Claude (Anthropic) — pour la génération de mails"
              type="password"
              value={settings.claudeKey || ""}
              onChange={(e) => set("claudeKey", e.target.value)}
              placeholder="sk-ant-..."
              hint="Obtenez votre clé sur console.anthropic.com"
            />
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#4D94FF] flex items-center gap-1 mt-1.5 hover:underline"
            >
              console.anthropic.com <ExternalLink size={10} />
            </a>
          </div>

          <div className="bg-[rgba(26,111,255,0.07)] border border-[rgba(26,111,255,0.2)] rounded-lg p-3 text-[12px] text-[#7A9AC0] leading-relaxed">
            Vos clés sont stockées de façon chiffrée (AES-256) et ne transitent jamais vers le client. Elles sont utilisées uniquement côté serveur pour vos propres recherches.
          </div>
        </div>
      </Card>

      {/* Signature */}
      <Card className="mb-4">
        <CardTitle className="flex items-center gap-2">
          <User size={13} /> Signature mail automatique
        </CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nom complet"
            value={settings.signatureName || ""}
            onChange={(e) => set("signatureName", e.target.value)}
            placeholder="Brahim El Mouden"
          />
          <Input
            label="Titre / Fonction"
            value={settings.signatureTitle || ""}
            onChange={(e) => set("signatureTitle", e.target.value)}
            placeholder="Président, Shabaka Invest Group"
          />
          <Input
            label="Entité"
            value={settings.signatureEntity || ""}
            onChange={(e) => set("signatureEntity", e.target.value)}
            placeholder="Shabaka Intelligence System (SIS)"
          />
          <Input
            label="Email"
            value={settings.signatureEmail || ""}
            onChange={(e) => set("signatureEmail", e.target.value)}
            placeholder="shabakainvestgroup@gmail.com"
          />
          <Input
            label="Tél. Maroc"
            value={settings.signatureTelMa || ""}
            onChange={(e) => set("signatureTelMa", e.target.value)}
            placeholder="+212 6 80 76 03 52"
          />
          <Input
            label="WhatsApp / France"
            value={settings.signatureTelFr || ""}
            onChange={(e) => set("signatureTelFr", e.target.value)}
            placeholder="+33 7 74 49 64 40"
          />
          <Input
            label="Ville"
            value={settings.signatureCity || ""}
            onChange={(e) => set("signatureCity", e.target.value)}
            placeholder="40000 Marrakech"
          />
        </div>

        {/* Aperçu */}
        <div className="mt-4 bg-[#0D1530] border border-[#1E3055] rounded-lg p-3">
          <div className="text-[10px] text-[#3A5080] uppercase tracking-wider mb-2">Aperçu signature</div>
          <pre className="text-[11px] text-[#7A9AC0] leading-relaxed whitespace-pre font-mono">
{`${settings.signatureName || "—"}
${settings.signatureTitle || "—"}
${settings.signatureEntity || "—"}
Tel. Maroc : ${settings.signatureTelMa || "—"}
WhatsApp / France : ${settings.signatureTelFr || "—"}
Email : ${settings.signatureEmail || "—"}
${settings.signatureCity || "—"}`}
          </pre>
        </div>
      </Card>

      {/* Usage */}
      <Card>
        <CardTitle>Utilisation du mois</CardTitle>
        <div className="grid grid-cols-2 gap-4 text-[12px]">
          <div>
            <div className="text-[#7A9AC0] mb-1">Recherches effectuées</div>
            <div className="text-[24px] font-bold text-white">{settings.searchesThisMonth}</div>
          </div>
          <div>
            <div className="text-[#7A9AC0] mb-1">Mails IA générés</div>
            <div className="text-[24px] font-bold text-[#FFD700]">{settings.mailsThisMonth}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
