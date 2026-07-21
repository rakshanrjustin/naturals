export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Registration } from "@/lib/types";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Server-side auth check — middleware also guards this route
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load registrations: {error.message}
      </main>
    );
  }

  return <DashboardClient registrations={data as Registration[]} adminEmail={user.email ?? ""} />;
}
