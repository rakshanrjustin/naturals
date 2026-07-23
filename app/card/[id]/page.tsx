export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Registration } from "@/lib/types";
import { BUSINESS_CATEGORIES, CONNECTION_OPTIONS } from "@/lib/types";
import CardClient from "./CardClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("registrations")
    .select("full_name, business_name, description")
    .eq("id", id)
    .single();

  if (!data) return { title: "Card not found — Naturals" };

  return {
    title: `${data.full_name} | Naturals Networking`,
    description: data.description,
    openGraph: {
      title: `${data.full_name} — ${data.business_name}`,
      description: data.description,
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const registration = data as Registration;
  const categoryLabel = BUSINESS_CATEGORIES.find((c) => c.value === registration.business_category)?.label ?? registration.business_category;
  const connectionLabel = CONNECTION_OPTIONS.find((c) => c.value === registration.looking_for)?.label ?? "";

  return (
    <CardClient
      registration={registration}
      categoryLabel={categoryLabel}
      connectionLabel={connectionLabel}
    />
  );
}
