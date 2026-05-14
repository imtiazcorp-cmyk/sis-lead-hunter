import * as XLSX from "xlsx";
import { Prospect } from "@prisma/client";

const SIG = {
  name: "Brahim El Mouden",
  title: "Président, Shabaka Invest Group",
  entity: "Shabaka Intelligence System (SIS)",
  telMa: "+212 6 80 76 03 52",
  telFr: "+33 7 74 49 64 40",
  email: "shabakainvestgroup@gmail.com",
  ville: "40000 Marrakech",
};

export function generateExcel(prospects: Prospect[]): Buffer {
  const wb = XLSX.utils.book_new();

  // Feuille 1 — Prospects
  const rows = prospects.map((p) => ({
    Domaine: p.domain,
    URL: p.url,
    Titre: p.title || "",
    Snippet: p.snippet || "",
    "Position SERP": p.serpPosition || "",
    Obsolescence: p.obsScore,
    Mobile: p.mobileScore,
    SEO: p.seoScore,
    Vitesse: p.speedScore,
    CMS: p.cms || "",
    "Tél. fixe": p.phoneFixe || "",
    "Tél. mobile": p.phoneMobile || "",
    "Email contact": p.emailContact || "",
    Propriétaire: p.ownerName || "",
    "Domaine créé": p.domainCreated || "",
    Registrar: p.registrar || "",
    HTTPS: p.https ? "Oui" : "Non",
    SIRET: p.siret || "",
    Dirigeant: p.dirigeant || "",
    "Réseaux sociaux": p.reseaux ? Object.keys(p.reseaux as object).join(", ") : "",
    "Objet mail": p.mailObjet || "",
    "Statut CRM": p.crmStatus,
    Notes: p.notes || "",
    "Date création": p.createdAt.toLocaleDateString("fr-FR"),
  }));

  const ws1 = XLSX.utils.json_to_sheet(rows);
  ws1["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws1, "Prospects");

  // Feuille 2 — Récap
  const recap = [
    ["SIS Lead Hunter", "Rapport d'export"],
    ["Date", new Date().toLocaleDateString("fr-FR")],
    ["Prospects exportés", prospects.length],
    ["Enrichis", prospects.filter((p) => p.enriched).length],
    [""],
    ["Exporté par", SIG.name],
    ["Titre", SIG.title],
    ["Entité", SIG.entity],
    ["Tél. Maroc", SIG.telMa],
    ["WhatsApp / France", SIG.telFr],
    ["Email", SIG.email],
    ["Ville", SIG.ville],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(recap);
  ws2["!cols"] = [{ wch: 22 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Récap");

  // Feuille 3 — Statistiques CRM
  const crm = [
    ["Statut CRM", "Nombre"],
    ...["NOUVEAU", "CONTACTE", "REPONDU", "RDV_PRIS", "SIGNE", "REFUS"].map((s) => [
      s,
      prospects.filter((p) => p.crmStatus === s).length,
    ]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(crm);
  ws3["!cols"] = [{ wch: 18 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Pipeline CRM");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function generateHubSpotCSV(prospects: Prospect[]): string {
  const headers = [
    "Email",
    "First Name",
    "Last Name",
    "Phone",
    "Mobile Phone",
    "Company",
    "Website",
    "Lead Status",
    "Notes",
    "Lead Source",
  ];

  const rows = prospects.map((p) => {
    const parts = (p.ownerName || "").split(" ");
    return [
      p.emailContact || "",
      parts[0] || "",
      parts.slice(1).join(" ") || "",
      p.phoneFixe || p.phoneMobile || "",
      p.phoneMobile || "",
      p.domain,
      p.url,
      p.crmStatus,
      `Obsolescence: ${p.obsScore}/100 | Mobile: ${p.mobileScore} | SEO: ${p.seoScore} | CMS: ${p.cms || "?"}`,
      "SIS Lead Hunter",
    ];
  });

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return (
    "﻿" +
    headers.map(escape).join(",") +
    "\n" +
    rows.map((r) => r.map(escape).join(",")).join("\n")
  );
}
