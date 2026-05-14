import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Search, Zap, Mail, Download, TrendingUp, Shield, Check } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const features = [
    { icon: Search, title: "Recherche Google intelligente", desc: "Trouvez des sites obsolètes via Serper.dev avec filtres pays, langue et score minimum." },
    { icon: Zap, title: "Enrichissement automatique", desc: "Téléphone, email, CMS, WHOIS, réseaux sociaux — 8 sources de données en parallèle." },
    { icon: TrendingUp, title: "Scores PageSpeed réels", desc: "Intégration Google Lighthouse API pour des scores Mobile/SEO/Vitesse authentiques." },
    { icon: Mail, title: "Mails IA personnalisés", desc: "Claude (Anthropic) génère un email de prospection sur mesure pour chaque prospect." },
    { icon: Download, title: "Export multi-formats", desc: "Excel multi-feuilles, CSV, HubSpot CRM — prêt à importer dans votre CRM." },
    { icon: Shield, title: "CRM Kanban intégré", desc: "Suivez chaque prospect de Nouveau → Signé sans quitter l'interface." },
  ];

  const plans = [
    {
      name: "Starter",
      price: "49",
      target: "Indépendants, freelances",
      features: ["500 recherches/mois", "100 mails IA/mois", "1 utilisateur", "Export Excel + CSV", "Enrichissement complet"],
      highlight: false,
    },
    {
      name: "Pro",
      price: "149",
      target: "PME, agences web",
      features: ["5 000 recherches/mois", "Mails IA illimités", "3 utilisateurs", "Export HubSpot + Pipedrive", "Dashboard analytics"],
      highlight: true,
    },
    {
      name: "Agency",
      price: "399",
      target: "Agences de croissance",
      features: ["Illimité", "Utilisateurs illimités", "API REST publique", "White-label", "Support prioritaire"],
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#E8F0FF]">
      {/* Header */}
      <header className="border-b border-[#1E3055] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#1A6FFF] text-white font-bold text-[11px] px-2 py-1 rounded-md tracking-wide">SIS</div>
          <div>
            <div className="text-[14px] font-bold text-white leading-none">Lead Hunter</div>
            <div className="text-[10px] text-[#7A9AC0]">Shabaka Intelligence System</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-[13px] text-[#7A9AC0] hover:text-white transition-colors">
            Connexion
          </Link>
          <Link
            href="/sign-up"
            className="bg-[#1A6FFF] text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#1560E0] transition-colors"
          >
            Essai gratuit 7 jours
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[rgba(26,111,255,0.15)] text-[#4D94FF] border border-[rgba(26,111,255,0.3)] rounded-full px-4 py-1.5 text-[12px] font-medium mb-6">
          <Zap size={12} /> Propulsé par Claude (Anthropic) + Google Search
        </div>
        <h1 className="text-[44px] md:text-[56px] font-bold leading-tight text-white mb-6">
          Trouvez des clients<br />
          <span className="text-[#1A6FFF]">qui ont besoin de vous</span>
        </h1>
        <p className="text-[18px] text-[#7A9AC0] max-w-2xl mx-auto mb-8 leading-relaxed">
          SIS Lead Hunter détecte automatiquement les sites web obsolètes, enrichit chaque prospect et génère un email de prospection personnalisé avec l'IA — en 10 minutes.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/sign-up"
            className="bg-[#1A6FFF] text-white font-semibold px-6 py-3 rounded-xl text-[15px] hover:bg-[#1560E0] transition-colors"
          >
            Démarrer gratuitement — 7 jours sans carte
          </Link>
          <Link href="#pricing" className="text-[#7A9AC0] text-[15px] hover:text-white transition-colors">
            Voir les tarifs →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-[28px] font-bold text-white text-center mb-10">Tout ce dont vous avez besoin</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#0F1A35] border border-[#1E3055] rounded-xl p-5 hover:border-[#2A4070] transition-colors">
              <div className="bg-[rgba(26,111,255,0.15)] w-9 h-9 rounded-lg flex items-center justify-center mb-3">
                <Icon size={17} className="text-[#4D94FF]" />
              </div>
              <h3 className="text-[14px] font-semibold text-white mb-1.5">{title}</h3>
              <p className="text-[12px] text-[#7A9AC0] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-[28px] font-bold text-white text-center mb-3">Tarifs simples et transparents</h2>
        <p className="text-[14px] text-[#7A9AC0] text-center mb-10">
          7 jours d'essai gratuit. Aucune carte bancaire requise. Mensuel ou annuel (-20%).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border relative ${
                plan.highlight
                  ? "bg-[#1A6FFF] border-[#1A6FFF] text-white"
                  : "bg-[#0F1A35] border-[#1E3055]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#0A0F1E] text-[11px] font-bold px-3 py-1 rounded-full">
                  PLUS POPULAIRE
                </div>
              )}
              <div className={`text-[13px] font-semibold mb-1 ${plan.highlight ? "text-blue-100" : "text-[#7A9AC0]"}`}>
                {plan.name}
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-[36px] font-bold leading-none">{plan.price}€</span>
                <span className={`text-[13px] mb-1 ${plan.highlight ? "text-blue-200" : "text-[#7A9AC0]"}`}>/mois HT</span>
              </div>
              <div className={`text-[12px] mb-5 ${plan.highlight ? "text-blue-200" : "text-[#3A5080]"}`}>
                {plan.target}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px]">
                    <Check size={14} className={plan.highlight ? "text-blue-200" : "text-[#2ED573]"} />
                    <span className={plan.highlight ? "text-blue-50" : "text-[#E8F0FF]"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={`block text-center text-[13px] font-semibold py-2.5 rounded-lg transition-colors ${
                  plan.highlight
                    ? "bg-white text-[#1A6FFF] hover:bg-blue-50"
                    : "bg-[#1A6FFF] text-white hover:bg-[#1560E0]"
                }`}
              >
                Commencer l'essai gratuit
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E3055] py-10 px-6 text-center">
        <div className="text-[13px] font-bold text-white mb-1">Shabaka Intelligence System</div>
        <div className="text-[12px] text-[#3A5080] leading-relaxed">
          Brahim El Mouden — Président, Shabaka Invest Group<br />
          +212 6 80 76 03 52 | +33 7 74 49 64 40 | shabakainvestgroup@gmail.com<br />
          40000 Marrakech, Maroc
        </div>
        <div className="text-[11px] text-[#1E3055] mt-4">© 2026 SIS Lead Hunter — Tous droits réservés</div>
      </footer>
    </div>
  );
}
