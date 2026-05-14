"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Search, Zap, Mail, Download } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await fetch("/api/user/sync", { method: "POST" });
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

      <div className="w-full max-w-md">
        <div className="bg-[#0F1A35] border border-[#1E3055] rounded-2xl p-8">
          {/* Icône */}
          <div className="w-14 h-14 bg-[rgba(26,111,255,0.15)] border border-[rgba(26,111,255,0.3)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap size={24} className="text-[#1A6FFF]" />
          </div>

          <h1 className="text-[24px] font-bold text-white mb-2 text-center">
            Bienvenue sur SIS Lead Hunter
          </h1>
          <p className="text-[14px] text-[#7A9AC0] leading-relaxed mb-8 text-center">
            Votre plateforme de prospection B2B intelligente est prête. Trouvez des sites obsolètes, enrichissez vos leads et générez des emails personnalisés avec l'IA.
          </p>

          {/* Fonctionnalités */}
          <div className="space-y-3 mb-8">
            {[
              { icon: Search, label: "Recherche de sites obsolètes via Google" },
              { icon: Zap, label: "Enrichissement automatique (téléphone, email, CMS)" },
              { icon: Mail, label: "Génération d'emails personnalisés par Claude IA" },
              { icon: Download, label: "Export Excel, CSV, HubSpot CRM" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-[13px] text-[#E8F0FF]">
                <div className="w-7 h-7 rounded-lg bg-[rgba(26,111,255,0.1)] flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-[#4D94FF]" />
                </div>
                {label}
              </div>
            ))}
          </div>

          {/* Conseil */}
          <div className="bg-[rgba(46,213,115,0.07)] border border-[rgba(46,213,115,0.2)] rounded-lg p-3 text-[12px] text-[#7A9AC0] mb-6">
            💡 <strong className="text-white">Conseil :</strong> Essayez la requête{" "}
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
      </div>
    </div>
  );
}
