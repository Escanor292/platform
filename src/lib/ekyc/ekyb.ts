export type BusinessRecord = {
  taxCode: string;
  name: string;
  address?: string | null;
  representative?: string | null;
  status?: string | null;
  source: "vietqr" | "sandbox" | "manual";
};

export async function lookupBusiness(taxCode: string): Promise<BusinessRecord | null> {
  const clean = taxCode.replace(/\s+/g, "");
  if (!/^\d{10}(\d{3})?$/.test(clean)) return null;

  try {
    const res = await fetch(`https://api.vietqr.io/v2/business/${clean}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = (await res.json()) as Record<string, any>;
      const d = json.data || json;
      if (d && (d.name || d.businessName || d.companyName)) {
        return {
          taxCode: clean,
          name: String(d.name || d.businessName || d.companyName),
          address: d.address || d.diaChi || null,
          representative: d.legalRepresentative || d.chuDoanhNghiep || d.representative || null,
          status: d.status || d.tinhTrang || "unknown",
          source: "vietqr",
        };
      }
    }
  } catch (error) {
    console.warn("[EKYB LOOKUP]", error);
  }

  return {
    taxCode: clean,
    name: "",
    address: null,
    representative: null,
    status: "manual",
    source: "sandbox",
  };
}
