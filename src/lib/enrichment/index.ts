import { scrapeSite, extractPhones, extractEmail, detectCMS, extractSocials } from "./scraper";
import { fetchWHOIS } from "./whois";
import { fetchPageSpeed, estimateScores } from "./pagespeed";

export interface EnrichOptions {
  doScrape?: boolean;
  doCMS?: boolean;
  doWhois?: boolean;
  doSocial?: boolean;
  doPageSpeed?: boolean;
}

export interface EnrichResult {
  phoneFixe: string;
  phoneMobile: string;
  emailContact: string;
  cms: string;
  reseaux: Record<string, string>;
  https: boolean;
  ownerName: string;
  domainCreated: string;
  registrar: string;
  mobileScore: number;
  seoScore: number;
  speedScore: number;
}

export async function enrichProspect(
  url: string,
  domain: string,
  snippet: string,
  title: string,
  position: number,
  options: EnrichOptions = {}
): Promise<Partial<EnrichResult>> {
  const {
    doScrape = true,
    doCMS = true,
    doWhois = true,
    doSocial = true,
    doPageSpeed = true,
  } = options;

  const result: Partial<EnrichResult> = {};
  const estimated = estimateScores(snippet, title, position);

  result.mobileScore = estimated.mobile;
  result.seoScore = estimated.seo;
  result.speedScore = estimated.speed;
  result.https = url.startsWith("https");

  // Scraping + CMS + téléphones + email + réseaux sociaux
  if (doScrape || doCMS || doSocial) {
    const html = await scrapeSite(url);
    if (html) {
      if (doScrape) {
        const phones = extractPhones(html);
        result.phoneFixe = phones.fixe;
        result.phoneMobile = phones.mobile;
        result.emailContact = extractEmail(html, domain);
      }
      if (doCMS) {
        result.cms = detectCMS(html);
      }
      if (doSocial) {
        result.reseaux = extractSocials(html);
      }
    }
  }

  // PageSpeed Insights (scores réels)
  if (doPageSpeed) {
    const ps = await fetchPageSpeed(url);
    if (ps) {
      result.mobileScore = ps.mobile;
      result.seoScore = ps.seo;
      result.speedScore = ps.speed;
    }
  }

  // WHOIS
  if (doWhois) {
    const whois = await fetchWHOIS(domain);
    result.ownerName = whois.owner;
    result.domainCreated = whois.created;
    result.registrar = whois.registrar;
  }

  return result;
}
