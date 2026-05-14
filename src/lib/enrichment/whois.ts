interface WhoisResult {
  owner: string;
  created: string;
  registrar: string;
}

export async function fetchWHOIS(domain: string): Promise<WhoisResult> {
  const empty: WhoisResult = { owner: "", created: "", registrar: "" };

  try {
    // RDAP (officiel ICANN, gratuit, pas de CORS depuis serveur)
    const tld = domain.split(".").pop() || "";
    const rdapBase = tld === "fr" ? "https://rdap.nic.fr" : "https://rdap.org";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${rdapBase}/domain/${domain}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (!res.ok) return empty;

    const data = await res.json();

    const owner =
      data.entities?.find((e: { roles: string[] }) => e.roles?.includes("registrant"))
        ?.vcardArray?.[1]?.find((v: string[]) => v[0] === "fn")?.[3] || "";

    const created =
      data.events?.find((e: { eventAction: string }) => e.eventAction === "registration")
        ?.eventDate?.split("T")[0] || "";

    const registrar =
      data.entities?.find((e: { roles: string[] }) => e.roles?.includes("registrar"))
        ?.vcardArray?.[1]?.find((v: string[]) => v[0] === "fn")?.[3] || "";

    return { owner, created, registrar };
  } catch {
    return empty;
  }
}
