export const SUPPORT_WHATSAPP_DISPLAY = "082253503356";
export const SUPPORT_WHATSAPP_E164 = "6282253503356";
export const SUPPORT_EMAIL = "d.raihan2004@gmail.com";

export function getWhatsAppSupportUrl(message = "") {
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${SUPPORT_WHATSAPP_E164}${query}`;
}

export function getMailtoSupportUrl({
  subject = "Lupa password akun GoQu",
  body = "",
} = {}) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${SUPPORT_EMAIL}${query ? `?${query}` : ""}`;
}

export function buildForgotPasswordMessage(email = "") {
  const trimmed = String(email || "").trim();
  return trimmed
    ? `Halo admin GoQu, saya lupa password akun dengan email ${trimmed}. Mohon bantuannya untuk mereset password.`
    : "Halo admin GoQu, saya lupa password akun. Mohon bantuannya untuk mereset password.";
}
