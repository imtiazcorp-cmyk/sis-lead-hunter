"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, ArrowRight, Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "Bienvenue" },
  { num: 2, label: "Clé Serper" },
  { num: 3, label: "Prêt !" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serperKey, setSerperKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Sync user in DB
      await fetch("/api/user/sync", { method: "POST" });
      // Save keys if provided
      if (serperKey || claudeKey) {
        await fetch("/api/user/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serperKey: serperKey || undefined, claudeKey: claudeKey || undefined }),
        });
      }
      router.push("/search");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="bg-[#1A6FFF] text-white font-bold text-[12px] px-2.5 py-1.5 rounded-md tracking-wide">SIS</div>
        <div>
          <div className="text-[15px] font-bold text-white leading-none">Lead Hunter</div>
          <div className="text-[11px] text-[#7A9AC0]">Shabaka Intelligence System</div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 ${step >= s.num ? "text-[#4D94FF]" : "text-[#3A5080]"}`}>
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold ${
                step > s.num ? "bg-[#2ED573] border-[#2ED573] text-white" :
                step === s.num ? "bg-[#1A6FFF] border-[#1A6FFF] text-white" :
                "border-[#1E3055]"
              }`}>
                {step > s.num ? <Check size={12} /> : s.num}
              </div>
              <span className="text-[12px] hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-px ${step > s.num ? "bg-[#2ED573]" : "bg-[#1E3055]"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-[#0F1A35] border border-[#1E3055] rounded-2xl p-8">
            <h1 className="text-[24px] font-bold text-white mb-2">Bienvenue sur SIS Lead Hunter</h1>
            <p className="text-[14px] text-[#7A9AC0] leading-relaxed mb-6">
              En quelques étapes, vous serez prêt à trouver vos premiers prospects B2B qualifiés et à générer des emails de prospection avec l'IA.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Recherche de sites obsolètes via Google Search",
                "Enrichissement automatique (téléphone, email, CMS, WHOIS)",
                "Génération de mails personnalisés par Claude IA",
                "Export Excel, CSV, HubSpot CRM",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-[13px] text-[#E8F0FF]">
                  <Check size={14} className="text-[#2ED573] flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={() => setStep(2)}>
              Commencer la configuration <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-[#0F1A35] border border-[#1E3055] rounded-2xl p-8">
            <h2 className="text-[22px] font-bold text-white mb-2">Configurez vos clés API</h2>
            <p className="text-[13px] text-[#7A9AC0] mb-6 leading-relaxed">
              La clé Serper est nécessaire pour la recherche. La clé Claude est optionnelle (vous pouvez en ajouter une plus tard dans Paramètres).
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <Input
                  label="Clé API Serper.dev (obligatoire)"
                  type="password"
                  value={serperKey}
                  onChange={(e) => setSerperKey(e.target.value)}
                  placeholder="Entrez votre clé Serper..."
                />
                <a
                  href="https://serper.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#4D94FF] flex items-center gap-1 mt-1.5 hover:underline"
                >
                  Obtenir une clé Serper.dev (2 500 req/mois gratuites) <ExternalLink size={10} />
                </a>
              </div>
              <div>
                <Input
                  label="Clé API Claude / Anthropic (optionnel)"
                  type="password"
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  placeholder="sk-ant-..."
                />
                <a
                  href="https://console.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#4D94FF] flex items-center gap-1 mt-1.5 hover:underline"
                >
                  Obtenir une clé Anthropic <ExternalLink size={10} />
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="default" onClick={() => setStep(1)} className="flex-1">
                Retour
              </Button>
              <Button variant="primary" onClick={() => setStep(3)} className="flex-1">
                Continuer <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-[#0F1A35] border border-[#1E3055] rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-[rgba(46,213,115,0.15)] border border-[rgba(46,213,115,0.3)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-[#2ED573]" />
            </div>
            <h2 className="text-[22px] font-bold text-white mb-2">Tout est prêt !</h2>
            <p className="text-[13px] text-[#7A9AC0] leading-relaxed mb-6">
              Vous pouvez maintenant lancer votre première recherche et trouver des prospects qualifiés.
            </p>
            <div className="bg-[rgba(26,111,255,0.07)] border border-[rgba(26,111,255,0.2)] rounded-lg p-3 text-[12px] text-[#7A9AC0] mb-6 text-left">
              💡 <strong className="text-white">Conseil de démarrage :</strong> Essayez la requête{" "}
              <code className="text-[#4D94FF]">plombier "notre site" 2017</code> pour trouver des artisans avec des sites à refaire.
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={saving}
              onClick={handleFinish}
            >
              Lancer ma première recherche <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
