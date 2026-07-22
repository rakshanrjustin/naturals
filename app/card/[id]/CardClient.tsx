"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Registration } from "@/lib/types";
import { ExternalLink, Link, Phone, Mail, Globe, MessageCircle } from "lucide-react";

interface Props {
  registration: Registration;
  categoryLabel: string;
  connectionLabel: string;
}

export default function CardClient({ registration: r, categoryLabel, connectionLabel }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const cardUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    const url = window.location.href;
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: { dark: "#5B2A6F", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, []);

  function downloadVCard() {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${r.full_name}`,
      `ORG:${r.business_name}`,
      `TITLE:${r.designation}`,
      `TEL;TYPE=CELL:${r.mobile_number}`,
      r.whatsapp_number ? `TEL;TYPE=WORK:${r.whatsapp_number}` : "",
      `EMAIL:${r.email}`,
      r.website ? `URL:${r.website}` : "",
      r.photo_url ? `PHOTO;VALUE=URI:${r.photo_url}` : "",
      `NOTE:${r.description} | Looking for: ${connectionLabel} | City: ${r.city}`,
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n");

    const blob = new Blob([lines], { type: "text/vcard" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${r.full_name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  function shareWhatsApp() {
    const msg = encodeURIComponent(
      `Hi! Here's my digital business card from Naturals Networking: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <main className="min-h-screen bg-[#fdf8fb] pb-16">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-[#5B2A6F] to-[#3d1b4a] pt-10 pb-20 text-center px-4">
        {r.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.photo_url}
            alt={r.full_name}
            className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-28 h-28 rounded-full mx-auto border-4 border-white bg-[#F3CCE0] flex items-center justify-center text-4xl font-bold text-[#5B2A6F] shadow-lg">
            {r.full_name.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-2xl font-bold text-white mt-4">{r.full_name}</h1>
        <p className="text-[#F3CCE0] text-sm mt-1">{r.designation}</p>
        <p className="text-white font-semibold mt-1">{r.business_name}</p>
        <span className="inline-block mt-2 bg-[#F3CCE0] text-[#5B2A6F] text-xs font-semibold px-3 py-1 rounded-full">
          {categoryLabel}
        </span>
      </div>

      {/* Card body — overlaps header */}
      <div className="max-w-sm mx-auto px-4 -mt-10 space-y-4">

        {/* Description card */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-[#5B2A6F] text-center italic text-sm leading-relaxed">
            &ldquo;{r.description}&rdquo;
          </p>
        </div>

        {/* Contact actions */}
        <div className="bg-white rounded-2xl shadow-md p-5 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-[#5B2A6F] uppercase">Contact</h2>

          <a href={`tel:${r.mobile_number}`} className="contact-row">
            <Phone size={16} className="text-[#5B2A6F]" />
            <span>{r.mobile_number}</span>
          </a>

          <a href={`mailto:${r.email}`} className="contact-row">
            <Mail size={16} className="text-[#5B2A6F]" />
            <span>{r.email}</span>
          </a>

          {r.whatsapp_number && (
            <a
              href={`https://wa.me/${r.whatsapp_number.replace(/\+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-row"
            >
              <MessageCircle size={16} className="text-[#5B2A6F]" />
              <span>WhatsApp</span>
            </a>
          )}

          {r.website && (
            <a href={r.website} target="_blank" rel="noopener noreferrer" className="contact-row">
              <Globe size={16} className="text-[#5B2A6F]" />
              <span className="truncate">{r.website.replace(/^https?:\/\//, "")}</span>
            </a>
          )}

          {r.linkedin && (
            <a href={r.linkedin} target="_blank" rel="noopener noreferrer" className="contact-row">
              <Link size={16} className="text-[#5B2A6F]" />
              <span>LinkedIn</span>
            </a>
          )}

          {r.instagram && (
            <a
              href={
                r.instagram.startsWith("http")
                  ? r.instagram
                  : `https://instagram.com/${r.instagram.replace(/^@/, "")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="contact-row"
            >
              <ExternalLink size={16} className="text-[#5B2A6F]" />
              <span>{r.instagram}</span>
            </a>
          )}

          <div className="flex items-center gap-2 pt-1 text-sm text-gray-500">
            <span className="text-[#5B2A6F] font-medium">City:</span>
            <span>{r.city}</span>
          </div>
        </div>

        {/* Looking for */}
        <div className="bg-[#F3CCE0] rounded-2xl shadow-md p-5">
          <p className="text-xs font-bold tracking-widest text-[#5B2A6F] uppercase mb-2">Looking for</p>
          <p className="text-[#3d1b4a] font-semibold">{connectionLabel}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={downloadVCard}
            className="flex-1 py-3.5 rounded-xl bg-[#5B2A6F] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            💾 Save Contact
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex-1 py-3.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <MessageCircle size={16} /> Share
          </button>
        </div>

        <button
          onClick={copyLink}
          className="w-full py-3 rounded-xl border-2 border-[#5B2A6F] text-[#5B2A6F] font-semibold text-sm"
        >
          {copied ? "✓ Link copied!" : "Copy Card Link"}
        </button>

        {/* QR code */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <p className="text-xs font-bold tracking-widest text-[#5B2A6F] uppercase mb-4">
            Scan to connect
          </p>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR code for this e-card"
              className="w-44 h-44 mx-auto"
            />
          ) : (
            <div className="w-44 h-44 mx-auto bg-[#fae6f0] rounded-xl animate-pulse" />
          )}
          <p className="text-xs text-gray-400 mt-3">{r.full_name}</p>
        </div>

        {/* Naturals branding footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Powered by</p>
          <p className="text-sm font-bold tracking-widest text-[#5B2A6F] uppercase">naturals</p>
        </div>
      </div>

      <style jsx>{`
        .contact-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #374151;
          font-size: 0.875rem;
          text-decoration: none;
          padding: 6px 0;
        }
        .contact-row:hover {
          color: #5B2A6F;
        }
      `}</style>
    </main>
  );
}
