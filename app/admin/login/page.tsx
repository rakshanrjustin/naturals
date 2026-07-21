"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#fdf8fb] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest uppercase text-[#5B2A6F] opacity-70">naturals salon chain</p>
          <h1 className="text-2xl font-bold text-[#5B2A6F] mt-1">Admin Login</h1>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-md p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#5B2A6F] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-[#e8a8c8] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2A6F]"
              placeholder="admin@naturals.in"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5B2A6F] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-[#e8a8c8] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2A6F]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#5B2A6F] text-white rounded-xl font-semibold text-sm disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
