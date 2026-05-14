interface PageSpeedResult {
  mobile: number;
  seo: number;
  speed: number;
}

export async function fetchPageSpeed(url: string): Promise<PageSpeedResult | null> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) return null;

  try {
    const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("key", apiKey);
    endpoint.searchParams.set("strategy", "mobile");
    endpoint.searchParams.set("category", "performance");
    endpoint.searchParams.set("category", "seo");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(endpoint.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();

    const cats = data.lighthouseResult?.categories;
    const mobile = Math.round((cats?.performance?.score ?? 0) * 100);
    const seo = Math.round((cats?.seo?.score ?? 0) * 100);

    // Vitesse basée sur FCP (First Contentful Paint) — score inversé
    const fcp = data.lighthouseResult?.audits?.["first-contentful-paint"]?.score ?? 0;
    const speed = Math.round(fcp * 100);

    return { mobile, seo, speed };
  } catch {
    return null;
  }
}

export function estimateScores(snippet: string, title: string, position: number) {
  const tx = (snippet + " " + title).toLowerCase();
  let obsBase = 35;

  if (["wix", "jimdo", "duda", "weebly"].some((x) => tx.includes(x))) obsBase += 22;
  if (tx.includes("flash")) obsBase += 18;
  if (/201[0-5]/.test(tx)) obsBase += 20;
  else if (/201[6-9]/.test(tx)) obsBase += 12;
  if (!tx.includes("responsive") && !tx.includes("mobile")) obsBase += 8;
  obsBase += Math.min(position, 8);

  const obs = Math.min(obsBase, 97);

  return {
    obs,
    mobile: Math.max(10, 82 - obs + 5),
    seo: Math.max(8, 78 - obs + 8),
    speed: Math.max(12, 74 - obs + 6),
  };
}
