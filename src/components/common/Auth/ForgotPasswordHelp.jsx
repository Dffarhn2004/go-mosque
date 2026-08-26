import React from "react";
import { Mail, MessageCircle, X } from "lucide-react";
import {
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_DISPLAY,
  buildForgotPasswordMessage,
  getMailtoSupportUrl,
  getWhatsAppSupportUrl,
} from "../../../config/supportContact";

export default function ForgotPasswordHelp({ open, onClose, email = "" }) {
  if (!open) return null;

  const message = buildForgotPasswordMessage(email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-black/5 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Lupa password?</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {`Reset otomatis belum tersedia. Hubungi admin GoQu dan sebutkan email akun Anda${
                email ? ` (${email})` : ""
              }. Admin akan mereset passwordnya.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <a
            href={getWhatsAppSupportUrl(message)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            <span>
              WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
            </span>
          </a>
          <a
            href={getMailtoSupportUrl({
              subject: "Lupa password akun GoQu",
              body: message,
            })}
            className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
          >
            <Mail className="h-5 w-5 shrink-0" />
            <span>{SUPPORT_EMAIL}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
