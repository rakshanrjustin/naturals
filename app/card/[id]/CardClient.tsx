"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Registration } from "@/lib/types";
import { ExternalLink, Link, Phone, Mail, Globe, MessageCircle, Download } from "lucide-react";

interface Props {
  registration: Registration;
  categoryLabel: string;
  connectionLabel: string;
}

export default function CardClient({ registration: r, categoryLabel, connectionLabel }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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

  async function downloadPDF() {
    if (isDownloading) return;
    setIsDownloading(true);

    const originalScrollY = window.scrollY;
    const originalScrollX = window.scrollX;

    try {
      // Scroll to the very top to ensure no element offset issues occur during capture
      window.scrollTo(0, 0);

      const html2canvas = (await import("html2canvas-pro")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = document.getElementById("pdf-render-template");
      if (!element) {
        setIsDownloading(false);
        window.scrollTo(originalScrollX, originalScrollY);
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#fdf8fb",
        width: 375,
        height: 750,
        scrollX: 0,
        scrollY: 0,
      });

      // Restore scroll position immediately after canvas rendering is complete
      window.scrollTo(originalScrollX, originalScrollY);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [375, 750],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 375, 750);

      // Detect iOS / iPhone / iPad environments
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      if (isIOS) {
        // iOS Safari and In-App browsers block async blob downloads. 
        // Direct window navigation triggers native Safari preview and Share Sheet flow reliably.
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        window.location.href = url;
        // Revoke after 5 seconds to ensure Safari has loaded it
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 5000);
      } else {
        pdf.save(`${r.full_name.replace(/\s+/g, "_")}_card.pdf`);
      }
    } catch (error) {
      console.error("Failed to download PDF:", error);
      window.scrollTo(originalScrollX, originalScrollY);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fdf8fb] pb-16">
      <div id="card-to-download" className="bg-[#fdf8fb] w-full">
        {/* Header banner */}
        <div className="bg-gradient-to-br from-[#5B2A6F] to-[#3d1b4a] pt-10 pb-20 text-center px-4">
          {r.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.photo_url}
              alt={r.full_name}
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto border-4 border-white bg-[#F3CCE0] flex items-center justify-center text-5xl font-bold text-[#5B2A6F] shadow-lg">
              {r.full_name.charAt(0).toUpperCase()}
            </div>
          )}
        <h1 className="text-[clamp(1.5rem,5vw,1.875rem)] font-extrabold text-white mt-5 tracking-tight max-w-[280px] sm:max-w-sm mx-auto leading-tight break-words">
          {r.full_name}
        </h1>
        <p className="text-[#F3CCE0] text-xs sm:text-sm font-semibold tracking-widest uppercase mt-2 max-w-[260px] sm:max-w-xs mx-auto leading-relaxed break-words">
          {r.designation}
        </p>
        <p className="text-white text-base sm:text-lg font-bold mt-1.5 max-w-[280px] sm:max-w-sm mx-auto leading-snug break-words">
          {r.business_name}
        </p>
        <div className="mt-4">
          <span className="inline-block bg-[#F3CCE0] text-[#5B2A6F] text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Card body — overlaps header */}
      <div className="max-w-sm mx-auto px-4 -mt-10 space-y-4">

        {/* Description card */}
        {r.description && r.description !== "Naturals networking member." && (
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-[#5B2A6F] text-center italic text-sm leading-relaxed">
              &ldquo;{r.description}&rdquo;
            </p>
          </div>
        )}

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
        {r.looking_for && r.looking_for !== "customers" && (
          <div className="bg-[#F3CCE0] rounded-2xl shadow-md p-5">
            <p className="text-xs font-bold tracking-widest text-[#5B2A6F] uppercase mb-2">Looking for</p>
            <p className="text-[#3d1b4a] font-semibold">{connectionLabel}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3" data-html2canvas-ignore="true">
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
          data-html2canvas-ignore="true"
        >
          {copied ? "✓ Link copied!" : "Copy Card Link"}
        </button>

        <button
          onClick={downloadPDF}
          disabled={isDownloading}
          className="w-full py-3 rounded-xl border-2 border-[#5B2A6F] text-[#5B2A6F] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          data-html2canvas-ignore="true"
        >
          <Download size={16} />
          {isDownloading ? "Downloading PDF..." : "Download PDF"}
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



      {/* Hidden PDF template for high-fidelity export */}
      <div
        id="pdf-render-template"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "0",
          width: "375px",
          height: "750px",
          backgroundColor: "#fdf8fb",
          fontFamily: "var(--font-inter), sans-serif",
          display: "flex",
          flexDirection: "column",
          color: "#374151",
          boxSizing: "border-box"
        }}
      >
        {/* Header gradient banner */}
        <div 
          style={{
            background: "linear-gradient(135deg, #5B2A6F 0%, #3d1b4a 100%)",
            padding: "36px 24px 44px 24px",
            textAlign: "center",
            position: "relative"
          }}
        >
          {r.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.photo_url}
              alt={r.full_name}
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
                margin: "0 auto",
                border: "4px solid #ffffff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
              }}
            />
          ) : (
            <div 
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                margin: "0 auto",
                border: "4px solid #ffffff",
                backgroundColor: "#F3CCE0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "44px",
                fontWeight: "bold",
                color: "#5B2A6F",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
              }}
            >
              {r.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: "800", marginTop: "16px", marginBottom: "4px", lineHeight: "1.2", overflowWrap: "break-word" }}>
            {r.full_name}
          </h1>
          <p style={{ color: "#F3CCE0", fontSize: "12px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", margin: "4px 0 6px 0", lineHeight: "1.3" }}>
            {r.designation}
          </p>
          <p style={{ color: "#ffffff", fontSize: "16px", fontWeight: "700", margin: "0", lineHeight: "1.3" }}>
            {r.business_name}
          </p>
          <div style={{ marginTop: "14px" }}>
            <span style={{ backgroundColor: "#F3CCE0", color: "#5B2A6F", fontSize: "10px", fontWeight: "800", padding: "6px 14px", borderRadius: "9999px", display: "inline-block", textTransform: "uppercase" }}>
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Content body */}
        <div style={{ padding: "28px 24px", flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {r.description && r.description !== "Naturals networking member." && (
              <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B7280", textAlign: "center", marginBottom: "20px", marginTop: "0", lineHeight: "1.5" }}>
                &ldquo;{r.description}&rdquo;
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <span style={{ color: "#5B2A6F", fontWeight: "600" }}>Mobile:</span>
                <span>{r.mobile_number}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <span style={{ color: "#5B2A6F", fontWeight: "600" }}>Email:</span>
                <span style={{ wordBreak: "break-all" }}>{r.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <span style={{ color: "#5B2A6F", fontWeight: "600" }}>City:</span>
                <span>{r.city}</span>
              </div>
              {r.linkedin && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                  <span style={{ color: "#5B2A6F", fontWeight: "600" }}>LinkedIn:</span>
                  <span style={{ wordBreak: "break-all" }}>{r.linkedin}</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code and Footer */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.05em", color: "#5B2A6F", textTransform: "uppercase", marginBottom: "8px" }}>
              Scan to connect
            </p>
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: "120px", height: "120px", margin: "0 auto", display: "block" }}
              />
            )}
            <p style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "6px", marginBottom: "20px" }}>{r.full_name}</p>

            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "14px" }}>
              <p style={{ fontSize: "9px", color: "#9CA3AF", margin: "0", textTransform: "uppercase" }}>Powered by</p>
              <p style={{ fontSize: "13px", fontWeight: "800", color: "#5B2A6F", margin: "2px 0 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>naturals e-connect</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
