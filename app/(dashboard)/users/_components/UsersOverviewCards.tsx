"use client";

import { Crown, UserCheck, UserRound, UsersRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { StatsCards } from "@/components/home/StatsCards";
import { getJson } from "@/lib/api";

import { UsersStatsSkeleton } from "./UsersStatsSkeleton";

type UserOverview = {
  totalUser: number;
  totalActiveUser: number;
  totalPremiumUser: number;
  totalFreeUser: number;
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

export function UsersOverviewCards() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const overviewQuery = useQuery({
    queryKey: ["user-overview"],
    queryFn: () => getJson<UserOverview>("/api/v1/user/overview", accessToken),
    enabled: status === "authenticated" && Boolean(accessToken),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoading =
    status === "loading" ||
    (status === "authenticated" && !accessToken) ||
    overviewQuery.isPending;

  if (isLoading) return <UsersStatsSkeleton />;

  if (overviewQuery.isError || !overviewQuery.data?.data) {
    return (
      <section className="rounded-md border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-300">
          {overviewQuery.error instanceof Error
            ? overviewQuery.error.message
            : "Unable to load user overview."}
        </p>
        <button
          type="button"
          onClick={() => overviewQuery.refetch()}
          className="mt-3 rounded-md bg-[#C83B55] px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </section>
    );
  }

  const overview = overviewQuery.data.data;
  const stats = [
    { label: "Total Users", value: formatNumber(overview.totalUser), change: "All registered users", icon: UsersRound },
    { label: "Active Users", value: formatNumber(overview.totalActiveUser), change: "Currently active", icon: UserCheck },
    { label: "Premium Users", value: formatNumber(overview.totalPremiumUser), change: "Subscribed users", icon: Crown },
    { label: "Free Users", value: formatNumber(overview.totalFreeUser), change: "Free plan users", icon: UserRound },
  ];

  return <StatsCards stats={stats} />;
}
