"use client";

import {
  BadgeDollarSign,
  CircleDollarSign,
  PackageCheck,
  Repeat2,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { getJson } from "@/lib/api";
import { RevenueChart } from "@/components/home/RevenueChart";
import { RevenueChartSkeleton } from "@/components/home/RevenueChartSkeleton";
import { NewlyJoinedTable, type NewlyJoinedUser } from "@/components/home/NewlyJoinedTable";
import { NewlyJoinedTableSkeleton } from "@/components/home/NewlyJoinedTableSkeleton";
import { StatsCards } from "@/components/home/StatsCards";
import { StatsCardsSkeleton } from "@/components/home/StatsCardsSkeleton";

type DashboardOverview = {
  totalUsers: number;
  totalSubscriptions: number;
  totalConversions: number;
  totalRevenue: number;
  totalSubscriptionPlans: number;
  activeSubscriptions: number;
  activeSubscribers: number;
  totalMessages: number;
  totalConversations: number;
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

export function HomeDashboard() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const overviewQuery = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => getJson<DashboardOverview>("/api/v1/dashboard/overview", accessToken),
    enabled: status === "authenticated" && Boolean(accessToken),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const usersQuery = useQuery({
    queryKey: ["newly-joined-users"],
    queryFn: () => getJson<NewlyJoinedUser[]>("/api/v1/user?page=1&limit=5&sortBy=createdAt&sortOrder=desc", accessToken),
    enabled: status === "authenticated" && Boolean(accessToken),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoading = status === "loading" ||
    (status === "authenticated" && !accessToken) ||
    overviewQuery.isPending;

  if (isLoading) {
    return (
      <main className="space-y-5">
        <StatsCardsSkeleton count={5} />
        <RevenueChartSkeleton />
        <NewlyJoinedTableSkeleton />
      </main>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data?.data) {
    return (
      <main className="rounded-md border border-red-500/30 bg-red-500/10 p-5">
        <p className="text-sm text-red-300">
          {overviewQuery.error instanceof Error
            ? overviewQuery.error.message
            : "Unable to load dashboard overview."}
        </p>
        <button
          type="button"
          onClick={() => overviewQuery.refetch()}
          className="mt-3 rounded-md bg-[#C83B55] px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </main>
    );
  }

  const overview = overviewQuery.data.data;
  const stats = [
    { label: "Total Users", value: formatNumber(overview.totalUsers), change: "Registered users", icon: UsersRound },
    { label: "Total Subscriptions", value: formatNumber(overview.totalSubscriptions), change: "All subscriptions", icon: Repeat2 },
    { label: "Active Subscriptions", value: formatNumber(overview.activeSubscriptions), change: "Currently active", icon: PackageCheck },
    { label: "Active Subscribers", value: formatNumber(overview.activeSubscribers), change: "Subscribed users", icon: UserCheck },
    { label: "Subscription Plans", value: formatNumber(overview.totalSubscriptionPlans), change: "Available plans", icon: BadgeDollarSign },
  ];

  return (
    <main className="space-y-5">
      <StatsCards stats={stats} />
      <RevenueChart totalRevenue={overview.totalRevenue} icon={CircleDollarSign} />
      {usersQuery.isPending ? (
        <NewlyJoinedTableSkeleton />
      ) : usersQuery.isError ? (
        <section className="rounded-md border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">Unable to load newly joined users.</section>
      ) : (
        <NewlyJoinedTable users={usersQuery.data?.data ?? []} />
      )}
    </main>
  );
}
