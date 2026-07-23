"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import HeartbeatLoader from "@/components/HeartbeatLoader";
import CustomSelect from "@/components/CustomSelect";
import {
  BUSINESS_CATEGORIES,
  type BusinessCategory,
  type ConnectionLookingFor,
} from "@/lib/types";

interface FormData {
  full_name: string;
  designation: string;
  business_name: string;
  business_category: string;
  custom_category: string;
  one_line_description: string;
  mobile_number: string;
  whatsapp_number: string;
  email: string;
  website: string;
  linkedin: string;
  instagram: string;
  city: string;
  connection_looking_for: ConnectionLookingFor | "";
  consent_required: boolean;
  consent_marketing: boolean;
}

const INITIAL: FormData = {
  full_name: "",
  designation: "",
  business_name: "",
  business_category: "",
  custom_category: "",
  one_line_description: "",
  mobile_number: "+91",
  whatsapp_number: "",
  email: "",
  website: "",
  linkedin: "",
  instagram: "",
  city: "",
  connection_looking_for: "",
  consent_required: false,
  consent_marketing: false,
};

function validate(data: FormData): Record<string, string> {
  const e: Record<string, string> = {};
  if (!data.full_name.trim() || data.full_name.length < 2)
    e.full_name = "Name must be at least 2 characters.";
  if (!data.designation.trim()) e.designation = "Designation is required.";
  if (!data.business_name.trim()) e.business_name = "Business name is required.";
  
  if (!data.business_category) {
    e.business_category = "Select a business category.";
  } else if (data.business_category === "other" && !data.custom_category.trim()) {
    e.business_category = "Enter your industry.";
  }

  const phoneReg = /^\+[1-9]\d{6,14}$/;
  if (!phoneReg.test(data.mobile_number.replace(/\s/g, "")))
    e.mobile_number = "Enter a valid mobile number with country code (e.g. +919876543210).";
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    e.email = "Enter a valid email address.";
  if (!data.city.trim()) e.city = "City is required.";
  if (!data.consent_required)
    e.consent_required = "You must agree to the terms to create your e-card.";
  return e;
}

const inputClass =
  "w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors " +
  "border-[#e8a8c8] focus:ring-[#5B2A6F] focus:border-[#5B2A6F] bg-white placeholder-gray-400";

const labelClass = "block text-sm font-medium text-[#5B2A6F] mb-1";
const errorClass = "text-xs text-red-500 mt-1";

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "preview">("form");
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cropper states
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  }

  function handleCategoryChange(value: string) {
    setForm((p) => ({
      ...p,
      business_category: value,
      custom_category: value === "other" ? p.custom_category : "",
    }));
    setErrors((p) => {
      const n = { ...p };
      delete n.business_category;
      return n;
    });
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, photo: "Only image files are allowed." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, photo: "Image must be smaller than 5 MB." }));
      return;
    }
    setErrors((p) => { const n = { ...p }; delete n.photo; return n; });
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageSrc(ev.target?.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  }

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    try {
      setSubmitting(true);
      const croppedBlob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      const file = new File([croppedBlob], "profile-photo.jpg", {
        type: "image/jpeg",
      });
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(croppedBlob));
      setShowCropModal(false);
    } catch (err) {
      console.error("Failed to crop image:", err);
      setErrors((p) => ({ ...p, photo: "Failed to process image. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCropCancel = () => {
    setRawImageSrc(null);
    setShowCropModal(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (showCropModal) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [showCropModal]);

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep("preview");
    window.scrollTo(0, 0);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setGlobalError("");
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    try {
      let photo_url: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, photoFile, { contentType: photoFile.type, upsert: false });
        if (uploadError) throw new Error("Photo upload failed: " + uploadError.message);
        const { data: urlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);
        photo_url = urlData.publicUrl;
      }

      const payload = {
        full_name: form.full_name.trim(),
        designation: form.designation.trim(),
        business_name: form.business_name.trim(),
        business_category: form.business_category === "other" ? form.custom_category.trim() : form.business_category,
        description: "Naturals networking member.",
        mobile_number: form.mobile_number.replace(/\s/g, ""),
        whatsapp_number: null,
        email: form.email.trim().toLowerCase(),
        website: null,
        linkedin: form.linkedin.trim() || null,
        instagram: null,
        city: form.city.trim(),
        photo_url,
        looking_for: "customers" as ConnectionLookingFor,
        consent_required: form.consent_required,
        consent_marketing: form.consent_marketing,
      };

      const { data, error } = await supabase
        .from("registrations")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      router.push(`/card/${data.id}`);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (submitting) return <HeartbeatLoader />;

  const categoryLabel = form.business_category === "other"
    ? form.custom_category
    : (BUSINESS_CATEGORIES.find((c) => c.value === form.business_category)?.label || form.business_category);

  if (step === "preview") {
    return (
      <main className="min-h-screen bg-[#fdf8fb] pb-16">
        <header className="bg-[#5B2A6F] text-white text-center py-5">
          <p className="text-xs tracking-widest uppercase opacity-70">naturals salon chain</p>
          <h1 className="text-xl font-bold tracking-wide mt-1">Preview Your E-Card</h1>
        </header>

        <div className="max-w-md mx-auto px-4 mt-8 space-y-4">
          {/* Card preview */}
          <div className="rounded-2xl border border-[#e8a8c8] bg-white shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#5B2A6F] to-[#7a3d92] px-6 pt-8 pb-12 text-center">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Your photo"
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto border-4 border-white bg-[#F3CCE0] flex items-center justify-center text-3xl font-bold text-[#5B2A6F]">
                  {form.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="mt-4 text-xl font-bold text-white">{form.full_name}</h2>
              <p className="text-[#F3CCE0] text-sm mt-1">{form.designation}</p>
              <p className="text-white font-medium mt-1">{form.business_name}</p>
            </div>

            <div className="px-6 py-5 space-y-2 text-sm text-gray-700">
              <Row label="Category" value={categoryLabel} />
              <Row label="Mobile" value={form.mobile_number} />
              <Row label="Email" value={form.email} />
              <Row label="City" value={form.city} />
              {form.linkedin && <Row label="LinkedIn" value={form.linkedin} />}
            </div>
          </div>

          {globalError && (
            <p className="text-red-500 text-sm text-center">{globalError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setStep("form"); setGlobalError(""); window.scrollTo(0, 0); }}
              className="flex-1 py-3 rounded-xl border-2 border-[#5B2A6F] text-[#5B2A6F] font-semibold text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-[#5B2A6F] text-white font-semibold text-sm shadow"
            >
              Confirm & Create Card
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdf8fb] pb-16">
      <header className="bg-[#5B2A6F] text-white text-center py-5">
        <p className="text-xs tracking-widest uppercase opacity-70">naturals salon chain</p>
        <h1 className="text-xl font-bold tracking-wide mt-1">Create Your E-Card</h1>
        <p className="text-[#F3CCE0] text-xs mt-1">Takes under 2 minutes</p>
      </header>

      <form onSubmit={handleReview} noValidate className="max-w-md mx-auto px-4 mt-8 space-y-5">

        {/* Photo upload */}
        <div className="text-center">
          <div className="relative inline-block">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#5B2A6F] mx-auto"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#e8a8c8] bg-[#fae6f0] flex flex-col items-center justify-center mx-auto">
                <span className="text-3xl">👤</span>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="text-xs font-semibold text-[#5B2A6F] bg-white px-3 py-2 rounded-xl border border-[#e8a8c8] flex items-center gap-1 active:scale-[0.98] transition-transform shadow-sm"
            >
              📷 Take Photo
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold text-[#5B2A6F] bg-white px-3 py-2 rounded-xl border border-[#e8a8c8] flex items-center gap-1 active:scale-[0.98] transition-transform shadow-sm"
            >
              📁 Upload Photo
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handlePhoto}
          />
          {errors.photo && <p className={errorClass}>{errors.photo}</p>}
          <p className="text-xs text-gray-400 mt-2">Optional · Max 5 MB</p>
        </div>

        <Field label="Full Name *" error={errors.full_name}>
          <input
            className={inputClass}
            placeholder="e.g. Priya Sharma"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </Field>

        <Field label="Designation *" error={errors.designation}>
          <input
            className={inputClass}
            placeholder="e.g. Founder & CEO"
            value={form.designation}
            onChange={(e) => set("designation", e.target.value)}
          />
        </Field>

        <Field label="Business Name *" error={errors.business_name}>
          <input
            className={inputClass}
            placeholder="e.g. Glow Studio"
            value={form.business_name}
            onChange={(e) => set("business_name", e.target.value)}
          />
        </Field>

        <Field label="Business Category *" error={errors.business_category}>
          <CustomSelect
            value={form.business_category}
            onChange={handleCategoryChange}
            options={BUSINESS_CATEGORIES}
            placeholder="Select a category…"
          />
          {form.business_category === "other" && (
            <div className="mt-3">
              <input
                className={inputClass}
                placeholder="Enter your industry"
                value={form.custom_category}
                onChange={(e) => set("custom_category", e.target.value)}
              />
            </div>
          )}
        </Field>

        <Field label="Mobile Number * (with country code)" error={errors.mobile_number}>
          <input
            className={inputClass}
            placeholder="+919876543210"
            value={form.mobile_number}
            onChange={(e) => set("mobile_number", e.target.value)}
            inputMode="tel"
          />
        </Field>

        <Field label="Email Address *" error={errors.email}>
          <input
            className={inputClass}
            type="email"
            placeholder="priya@glowstudio.in"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            inputMode="email"
          />
        </Field>

        <Field label="LinkedIn (optional)" error={errors.linkedin}>
          <input
            className={inputClass}
            placeholder="https://linkedin.com/in/priyasharma"
            value={form.linkedin}
            onChange={(e) => set("linkedin", e.target.value)}
          />
        </Field>

        <Field label="City *" error={errors.city}>
          <input
            className={inputClass}
            placeholder="e.g. Chennai"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>

        {/* Consent checkboxes — kept separate per spec */}
        <div className="space-y-3 pt-2">
          <label className="flex gap-3 items-start cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-[#5B2A6F] w-4 h-4 flex-shrink-0"
              checked={form.consent_required}
              onChange={(e) => set("consent_required", e.target.checked)}
            />
            <span className="text-sm text-gray-700">
              <span className="font-medium text-red-500">*</span>{" "}
              I agree to the use of my information for creating and delivering my e-card.
            </span>
          </label>
          {errors.consent_required && <p className={errorClass}>{errors.consent_required}</p>}

          <label className="flex gap-3 items-start cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-[#5B2A6F] w-4 h-4 flex-shrink-0"
              checked={form.consent_marketing}
              onChange={(e) => set("consent_marketing", e.target.checked)}
            />
            <span className="text-sm text-gray-700">
              I would like to receive future event, networking and business opportunity updates.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-[#5B2A6F] text-white font-bold text-base shadow-md mt-4 active:scale-[0.98] transition-transform"
        >
          Preview My Card →
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
          Your information is kept private and secure.
        </p>
      </form>

      {/* Image Cropping Modal */}
      {showCropModal && rawImageSrc && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#5B2A6F]">Adjust Profile Photo</h3>
              <button 
                type="button"
                onClick={handleCropCancel}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative w-full h-[320px] bg-neutral-900">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 block">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5B2A6F]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCropCancel}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropSave}
                  className="flex-1 py-3 rounded-xl bg-[#5B2A6F] text-white font-semibold text-sm hover:bg-[#4a215b] transition-colors shadow-md"
                >
                  Use Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#5B2A6F] font-medium w-24 flex-shrink-0">{label}:</span>
      <span className="break-all">{value}</span>
    </div>
  );
}
