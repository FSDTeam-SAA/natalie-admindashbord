"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Bot, CircleOff } from "lucide-react";

import { getJson } from "@/lib/api";
import { CompanionCard, type Companion } from "./CompanionCard";
import { CompanionsSkeleton } from "./CompanionsSkeleton";

export function CompanionsList() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const companionsQuery = useQuery({
    queryKey: ["companions"],
    queryFn: () => getJson<Companion[]>("/api/v1/companions", accessToken),
    enabled: status === "authenticated" && Boolean(accessToken),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoading = status === "loading" || (status === "authenticated" && !accessToken) || companionsQuery.isPending;
  if (isLoading) return <CompanionsSkeleton />;

  if (companionsQuery.isError) {
    return <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-5"><p className="text-sm text-red-300">{companionsQuery.error instanceof Error ? companionsQuery.error.message : "Unable to load companions."}</p><button type="button" onClick={() => companionsQuery.refetch()} className="mt-3 rounded-md bg-[#C83B55] px-4 py-2 text-sm font-semibold text-white">Try again</button></section>;
  }

  const companions = companionsQuery.data?.data ?? [];
  if (!companions.length) return <section className="rounded-xl border border-[#2D2E35] bg-[#191A1F] p-12 text-center text-[#A7A7AF]">No companions found.</section>;

  const activeCount = companions.filter((companion) => companion.status).length;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Companion overview">
        <Summary icon={Bot} label="Total companions" value={companions.length} tone="rose" />
        <Summary icon={Activity} label="Active profiles" value={activeCount} tone="green" />
        <Summary icon={CircleOff} label="Inactive profiles" value={companions.length - activeCount} tone="gray" />
      </section>
      <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {companions.map((companion) => <CompanionCard key={companion.id} companion={companion} />)}
      </section>
    </div>
  );
}

function Summary({ icon: Icon, label, value, tone }: { icon: typeof Bot; label: string; value: number; tone: "rose" | "green" | "gray" }) {
  const styles = tone === "rose" ? "border-[#C83B55]/20 bg-[#C83B55]/10 text-[#F0788F]" : tone === "green" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-[#A8A8B2]";
  return <article className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#191A1F] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"><span className={`flex size-11 items-center justify-center rounded-xl border ${styles}`}><Icon className="size-5" /></span><div><p className="text-2xl font-semibold text-white">{value}</p><p className="text-xs text-[#8F8F98]">{label}</p></div></article>;
}
