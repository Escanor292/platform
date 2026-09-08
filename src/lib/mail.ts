export async function sendTransactionalEmail({
  email,
  subject,
  text,
  html,
}: {
  email: string;
  subject: string;
  text: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { delivered: false as const, reason: "missing-email-config" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [email], subject, text, html }),
  });

  if (!response.ok) {
    return { delivered: false as const, reason: `provider-${response.status}` as const };
  }

  return { delivered: true as const };
}
