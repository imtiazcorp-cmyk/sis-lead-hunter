import * as cheerio from "cheerio";

const PHONE_FR_FIXE = /0[1-5][\s.\-]?(?:\d{2}[\s.\-]?){4}/g;
const PHONE_FR_MOBILE = /0[6-7][\s.\-]?(?:\d{2}[\s.\-]?){4}/g;
const PHONE_MA = /(?:\+212|0)[\s.\-]?[5-7][\s.\-]?(?:\d{2}[\s.\-]?){4}/g;
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const CMS_SIGNATURES: [string, string][] = [
  ["wp-content", "WordPress"],
  ["wp-includes", "WordPress"],
  ["wix.com", "Wix"],
  ["wixstatic", "Wix"],
  ["jimdo", "Jimdo"],
  ["dudaone.com", "Duda"],
  ["weebly.com", "Weebly"],
  ["squarespace.com", "Squarespace"],
  ["shopify.com", "Shopify"],
  ["myshopify.com", "Shopify"],
  ["prestashop", "PrestaShop"],
  ["joomla", "Joomla"],
  ["drupal", "Drupal"],
  ["webflow.io", "Webflow"],
  ["ghost.io", "Ghost"],
];

export function extractPhones(html: string): { fixe: string; mobile: string } {
  const normalise = (n: string) => n.replace(/[\s.\-]/g, "");
  const uniq = (arr: string[]) => [...new Set(arr.map(normalise))];

  const fixeMatches = html.match(PHONE_FR_FIXE) || [];
  const mobileMatches = html.match(PHONE_FR_MOBILE) || [];
  const maMatches = html.match(PHONE_MA) || [];

  const allFixe = uniq(fixeMatches);
  const allMobile = uniq([...mobileMatches, ...maMatches]);

  return { fixe: allFixe[0] || "", mobile: allMobile[0] || "" };
}

export function extractEmail(html: string, domain: string): string {
  const matches = html.match(EMAIL_RE) || [];
  const filtered = matches.filter(
    (m) =>
      !m.includes("example") &&
      !m.includes("sentry") &&
      !m.includes("@2x") &&
      !m.endsWith(".png") &&
      !m.endsWith(".jpg") &&
      !m.includes("wix.com") &&
      !m.includes("wordpress.org")
  );

  const preferred = filtered.find((m) => m.includes(domain.replace("www.", "")));
  return preferred || filtered[0] || "";
}

export function detectCMS(html: string): string {
  const lower = html.toLowerCase();
  for (const [sig, name] of CMS_SIGNATURES) {
    if (lower.includes(sig)) return name;
  }
  return "Inconnu";
}

export function extractSocials(html: string): Record<string, string> {
  const $ = cheerio.load(html);
  const socials: Record<string, string> = {};
  const patterns: [string, string][] = [
    ["facebook.com", "facebook"],
    ["instagram.com", "instagram"],
    ["linkedin.com", "linkedin"],
    ["youtube.com", "youtube"],
    ["twitter.com", "twitter"],
    ["x.com", "twitter"],
    ["tiktok.com", "tiktok"],
  ];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const [domain, key] of patterns) {
      if (href.includes(domain) && !socials[key]) {
        socials[key] = href;
      }
    }
  });

  return socials;
}

export async function scrapeSite(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });

    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
