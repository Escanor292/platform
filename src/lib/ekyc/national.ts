export type NationalVerifyInput = {
  idCardNumber: string;
  fullName: string;
  dateOfBirth?: string | null;
  chipDg1?: string | null;
  vneidCode?: string | null;
};

export type NationalVerifyResult = {
  provider: "sandbox" | "vneid" | "unavailable";
  matched: boolean;
  status: "PASS" | "REVIEW" | "SKIP" | "FAIL";
  message: string;
  raw?: Record<string, unknown>;
};

export async function verifyNationalId(input: NationalVerifyInput): Promise<NationalVerifyResult> {
  const base = process.env.VNEID_API_BASE_URL;
  const key = process.env.VNEID_API_KEY;

  if (base && key) {
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_number: input.idCardNumber,
          full_name: input.fullName,
          dob: input.dateOfBirth,
          chip: input.chipDg1,
          vneid: input.vneidCode,
        }),
      });
      if (!res.ok) throw new Error(`VNeID ${res.status}`);
      const data = (await res.json()) as Record<string, any>;
      const matched = Boolean(data.matched ?? data.data?.matched);
      return {
        provider: "vneid",
        matched,
        status: matched ? "PASS" : "FAIL",
        message: matched ? "Khop VNeID / CSDL" : "Khong khop du lieu quoc gia",
        raw: data,
      };
    } catch (error) {
      return {
        provider: "unavailable",
        matched: false,
        status: "SKIP",
        message: "VNeID khong phan hoi — giu P1, khong tu VERIFIED them.",
        raw: { error: String(error) },
      };
    }
  }

  if (input.idCardNumber.startsWith("000000")) {
    return { provider: "sandbox", matched: false, status: "FAIL", message: "Sandbox P2: the khong hop le" };
  }
  if (input.chipDg1 || input.vneidCode) {
    return {
      provider: "sandbox",
      matched: true,
      status: "PASS",
      message: "Sandbox P2: da nhan chip/VNeID (chua goi CSDL nha nuoc).",
    };
  }
  return {
    provider: "sandbox",
    matched: false,
    status: "SKIP",
    message: "Chua co NFC/VNeID — bo qua P2.",
  };
}
