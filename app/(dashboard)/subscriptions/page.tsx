"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { getJson } from "@/lib/api";

import { CreatePlanModal } from "./_components/CreatePlanModal";
import { SubscriptionCard, type SubscriptionPlan } from "./_components/SubscriptionCard";
import { SubscriptionPlansSkeleton } from "./_components/SubscriptionPlansSkeleton";

type ApiSubscriptionPlan = {
  entitlementPolicy?: {
    kind?: "free" | "paid";
    dailyPhoto?: boolean;
    dailyText?: boolean;
  };
  id: string;
  name: string;
  price: string;
  messageLimit: number;
  creditAllowance: number;
  durationDays: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
};

function getVariant(name: string): SubscriptionPlan["variant"] {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes("vip")) return "vip";
  if (normalizedName.includes("free")) return "free";
  return "premium";
}

function toSubscriptionPlan(plan: ApiSubscriptionPlan): SubscriptionPlan {
  const numericPrice = Number(plan.price);
  const variant = getVariant(plan.name);

  return {
    id: plan.id,
    rawName: plan.name,
    rawPrice: plan.price,
    messageLimit: plan.messageLimit,
    creditAllowance: plan.creditAllowance,
    durationDays: plan.durationDays,
    isPopular: plan.isPopular,
    isActive: plan.isActive,
    entitlementPolicy: {
      kind: plan.entitlementPolicy?.kind ?? (variant === "free" ? "free" : "paid"),
      dailyPhoto: plan.entitlementPolicy?.dailyPhoto ?? false,
      dailyText: plan.entitlementPolicy?.dailyText ?? false,
    },
    eyebrow: variant === "free" ? "Free Trial" : "Companion",
    name: plan.name.replace(/\s+plan$/i, ""),
    price: numericPrice === 0 ? "Free" : `$${numericPrice.toFixed(2)}`,
    priceSuffix: `/ ${plan.durationDays} days`,
    features: plan.features,
    badge: plan.isPopular ? "Most Popular" : undefined,
    variant,
  };
}

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const plansQuery = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => getJson<ApiSubscriptionPlan[]>("/api/v1/subscription", accessToken),
    enabled: status === "authenticated" && Boolean(accessToken),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoading =
    status === "loading" ||
    (status === "authenticated" && !accessToken) ||
    plansQuery.isPending;
  const subscriptionPlans = plansQuery.data?.data ?? [];

  return (
    <main className="mx-auto w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-xs text-[#8F8F95] sm:text-sm">
          Manage your subscription plans and pricing.
        </p>
        <CreatePlanModal />
      </div>

      {isLoading ? (
        <SubscriptionPlansSkeleton />
      ) : plansQuery.isError ? (
        <section className="mt-10 rounded-md border border-red-500/30 bg-red-500/10 p-5">
          <p className="text-sm text-red-300">
            {plansQuery.error instanceof Error
              ? plansQuery.error.message
              : "Unable to load subscription plans."}
          </p>
          <button
            type="button"
            onClick={() => plansQuery.refetch()}
            className="mt-3 rounded-md bg-[#C2384F] px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </section>
      ) : subscriptionPlans.length === 0 ? (
        <section className="mt-10 rounded-md border border-[#2A2B31] bg-[#1A1B20] p-10 text-center text-[#A6A6AF]">
          No subscription plans found.
        </section>
      ) : (
        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <SubscriptionCard key={plan.id} plan={toSubscriptionPlan(plan)} />
          ))}
        </section>
      )}
    </main>
  );
}
