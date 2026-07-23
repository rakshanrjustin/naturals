"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";
import type { Registration } from "@/lib/types";
import { BUSINESS_CATEGORIES, CONNECTION_OPTIONS } from "@/lib/types";

interface Props {
  registrations: Registration[];
  adminEmail: string;
}

const PAGE_SIZE = 25;

export default function DashboardClient({ registrations, adminEmail }: Props) {
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterConsent, setFilterConsent] = useState<"" | "true" | "false">("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  // Unique cities for filter dropdown
  const cities = useMemo(
    () => [...new Set(registrations.map((r) => r.city))].sort(),
    [registrations]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return registrations.filter((r) => {
      if (q && !`${r.full_name} ${r.business_name} ${r.email} ${r.city}`.toLowerCase().includes(q)) return false;
      if (filterCity && r.city !== filterCity) return false;
      if (filterConsent === "true" && !r.consent_marketing) return false;
      if (filterConsent === "false" && r.consent_marketing) return false;
      if (filterCategory && r.business_category !== filterCategory) return false;
      return true;
    });
  }, [registrations, search, filterCity, filterConsent, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setSearch(""); setFilterCity(""); setFilterConsent(""); setFilterCategory(""); setPage(1);
  }

  function exportExcel() {
    const rows = filtered.map((r) => ({
      "Full Name": r.full_name,
      "Designation": r.designation,
      "Business Name": r.business_name,
      "Category": BUSINESS_CATEGORIES.find((c) => c.value === r.business_category)?.label ?? r.business_category,
      "Description": r.description,
      "Mobile": r.mobile_number,
      "WhatsApp": r.whatsapp_number ?? "",
      "Email": r.email,
      "Website": r.website ?? "",
      "LinkedIn": r.linkedin ?? "",
      "Instagram": r.instagram ?? "",
      "City": r.city,
      "Looking For": CONNECTION_OPTIONS.find((c) => c.value === r.looking_for)?.label ?? r.looking_for,
      "Consent (E-card)": r.consent_required ? "Yes" : "No",
      "Consent (Marketing)": r.consent_marketing ? "Yes" : "No",
      "Card Status": r.card_delivery_status,
      "Registered At": new Date(r.created_at).toLocaleString("en-IN"),
      "Card URL": `${window.location.origin}/card/${r.id}`,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, `naturals-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      sent: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] ?? "bg-gray-100 text-gray-600"}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-[#5B2A6F] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-widest uppercase opacity-70">naturals</p>
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs opacity-70 hidden sm:block">{adminEmail}</span>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            {signingOut ? "…" : "Sign out"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total" value={registrations.length} />
          <StatCard label="Filtered" value={filtered.length} />
          <StatCard label="Wants updates" value={registrations.filter((r) => r.consent_marketing).length} />
          <StatCard label="Cards sent" value={registrations.filter((r) => r.card_delivery_status === "sent").length} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2A6F]"
              placeholder="Name, business, email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2A6F]"
              value={filterCity}
              onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}
            >
              <option value="">All cities</option>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2A6F]"
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            >
              <option value="">All categories</option>
              {BUSINESS_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Consent (updates)</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2A6F]"
              value={filterConsent}
              onChange={(e) => { setFilterConsent(e.target.value as "" | "true" | "false"); setPage(1); }}
            >
              <option value="">All</option>
              <option value="true">Opted in</option>
              <option value="false">Not opted in</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={exportExcel}
              className="px-4 py-2 text-sm bg-[#5B2A6F] text-white rounded-lg font-semibold hover:bg-[#3d1b4a] transition-colors"
            >
              ↓ Export Excel ({filtered.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#fae6f0] text-[#5B2A6F] text-xs font-semibold">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Business</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">City</th>
                  <th className="px-4 py-3 text-left">Looking for</th>
                  <th className="px-4 py-3 text-center">Updates</th>
                  <th className="px-4 py-3 text-center">Card</th>
                  <th className="px-4 py-3 text-left">Registered</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400">
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  paged.map((r) => (
                    <tr key={r.id} className="hover:bg-[#fdf8fb] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{r.full_name}</div>
                        <div className="text-xs text-gray-400">{r.designation}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{r.business_name}</div>
                        <div className="text-xs text-gray-400">
                          {BUSINESS_CATEGORIES.find((c) => c.value === r.business_category)?.label ?? r.business_category}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${r.email}`} className="text-[#5B2A6F] hover:underline block">
                          {r.email}
                        </a>
                        <a href={`tel:${r.mobile_number}`} className="text-xs text-gray-500 block">
                          {r.mobile_number}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.city}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {CONNECTION_OPTIONS.find((c) => c.value === r.looking_for)?.label}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.consent_marketing ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge(r.card_delivery_status)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/card/${r.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#5B2A6F] hover:underline whitespace-nowrap"
                        >
                          View card →
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
      <div className="text-2xl font-bold text-[#5B2A6F]">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
