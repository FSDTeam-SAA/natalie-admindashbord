"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, DollarSign, Loader2, Package, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/api";

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: string;
  currency: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CreditPackagePayload = {
  name: string;
  credits: number;
  price: string;
  currency: string;
  isActive: boolean;
};

const fieldClass =
  "h-12 w-full rounded-lg border border-[#414149] bg-[#17171B] px-4 text-sm text-white outline-none transition placeholder:text-[#707078] focus:border-[#C2384F]";

function PackageModal({ creditPackage }: { creditPackage?: CreditPackage }) {
  const editing = Boolean(creditPackage);
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreditPackagePayload) => {
      if (!session?.accessToken) throw new Error("Your session has expired. Please sign in again.");
      return editing
        ? patchJson<CreditPackage, CreditPackagePayload>(
            `/api/v1/credits/packages/${creditPackage!.id}`,
            payload,
            session.accessToken,
          )
        : postJson<CreditPackage, CreditPackagePayload>(
            "/api/v1/credits/packages",
            payload,
            session.accessToken,
          );
    },
    onSuccess: async (response) => {
      toast.success(response.message || `Credit package ${editing ? "updated" : "created"} successfully`);
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["credit-packages"] });
    },
    onError: (error) =>
      toast.error(`Unable to ${editing ? "update" : "create"} credit package`, {
        description: error instanceof Error ? error.message : "Please try again.",
      }),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    mutation.mutate({
      name: String(form.get("name")).trim(),
      credits: Number(form.get("credits")),
      price: Number(form.get("price")).toFixed(2),
      currency: String(form.get("currency")).trim().toLowerCase(),
      isActive: form.get("isActive") === "on",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !mutation.isPending && setOpen(value)}>
      <DialogTrigger
        className={editing
          ? "flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#414149] text-sm font-medium text-white transition hover:border-[#C2384F] hover:bg-[#C2384F]/10"
          : "flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#C2384F] px-5 text-sm font-semibold text-white transition hover:bg-[#D1455E]"}
      >
        {editing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
        {editing ? "Edit" : "Create Package"}
      </DialogTrigger>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/75 backdrop-blur-[5px]" className="w-[calc(100%-2rem)] !max-w-[580px] gap-0 overflow-hidden rounded-2xl border border-[#34343A] bg-[#1E1E22] p-0 text-white shadow-2xl ring-0">
        <div className="flex items-start justify-between border-b border-[#34343A] px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#EC4B6A]">{editing ? "Editing package" : "New package"}</p>
            <DialogTitle className="text-xl font-semibold">{editing ? "Update Credit Package" : "Create Credit Package"}</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-[#9999A2]">Set the credits and checkout price customers will see.</DialogDescription>
          </div>
          <DialogClose className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#3C3C42] text-[#A5A5AE] hover:border-[#C2384F] hover:text-white"><X className="size-5" /></DialogClose>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="text-sm text-[#D7D7DD] sm:col-span-2">Package name<input name="name" required defaultValue={creditPackage?.name} placeholder="Starter Credits" className={`${fieldClass} mt-2`} /></label>
            <label className="text-sm text-[#D7D7DD]">Credits<input name="credits" required type="number" min="1" step="1" defaultValue={creditPackage?.credits} placeholder="100" className={`${fieldClass} mt-2`} /></label>
            <label className="text-sm text-[#D7D7DD]">Price<input name="price" required type="number" min="0" step="0.01" defaultValue={creditPackage?.price} placeholder="4.99" className={`${fieldClass} mt-2`} /></label>
            <label className="text-sm text-[#D7D7DD] sm:col-span-2">Currency<input name="currency" required maxLength={3} defaultValue={creditPackage?.currency ?? "usd"} placeholder="usd" className={`${fieldClass} mt-2 uppercase`} /></label>
            <label className="flex items-center gap-3 rounded-lg border border-[#414149] bg-[#17171B] px-4 py-3 text-sm text-white sm:col-span-2"><input name="isActive" type="checkbox" defaultChecked={creditPackage?.isActive ?? true} className="size-4 accent-[#C2384F]" /> Active and available for purchase</label>
          </div>
          <div className="border-t border-[#34343A] px-6 py-5">
            <button type="submit" disabled={mutation.isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C2384F] font-semibold text-white transition hover:bg-[#DF4965] disabled:cursor-not-allowed disabled:opacity-60">
              {mutation.isPending && <Loader2 className="size-5 animate-spin" />}
              {mutation.isPending ? "Saving..." : editing ? "Update Package" : "Create Package"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeactivateButton({ creditPackage }: { creditPackage: CreditPackage }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      if (!session?.accessToken) throw new Error("Your session has expired. Please sign in again.");
      return deleteJson<CreditPackage>(`/api/v1/credits/packages/${creditPackage.id}`, session.accessToken);
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Credit package deactivated successfully");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["credit-packages"] });
    },
    onError: (error) => toast.error("Unable to deactivate credit package", { description: error instanceof Error ? error.message : "Please try again." }),
  });

  return (
    <Dialog open={open} onOpenChange={(value) => !mutation.isPending && setOpen(value)}>
      <DialogTrigger className="flex size-10 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 transition hover:bg-red-500 hover:text-white" aria-label={`Deactivate ${creditPackage.name}`}><Trash2 className="size-4" /></DialogTrigger>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/75 backdrop-blur-[5px]" className="w-[calc(100%-2rem)] !max-w-[440px] rounded-2xl border border-[#34343A] bg-[#1E1E22] p-6 text-white ring-0">
        <DialogTitle className="text-xl font-semibold">Deactivate package?</DialogTitle>
        <DialogDescription className="mt-2 leading-6 text-[#A4A4AC]">{creditPackage.name} will no longer be available for customers to purchase.</DialogDescription>
        <div className="mt-6 flex justify-end gap-3">
          <DialogClose className="h-11 rounded-lg border border-[#414149] px-5 text-sm font-medium">Cancel</DialogClose>
          <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending} className="flex h-11 items-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold hover:bg-red-500 disabled:opacity-60">{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Deactivate</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoadingCards() {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border border-[#292A31] bg-[#18191E]" />)}</div>;
}

export default function CreditsPage() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const packagesQuery = useQuery({
    queryKey: ["credit-packages"],
    queryFn: () => getJson<CreditPackage[]>("/api/v1/credits/packages", accessToken),
    enabled: status === "authenticated" && Boolean(accessToken),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const packages = packagesQuery.data?.data ?? [];
  const totalCredits = packages.reduce((sum, item) => sum + item.credits, 0);
  const averagePrice = packages.length ? packages.reduce((sum, item) => sum + Number(item.price), 0) / packages.length : 0;
  const loading = status === "loading" || (status === "authenticated" && !accessToken) || packagesQuery.isPending;

  return (
    <main className="mx-auto w-full max-w-[1500px]">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold text-white sm:text-3xl">Credit Packages</h1><p className="mt-2 text-sm text-[#8F8F98]">Create and manage credit bundles available to customers.</p></div>
        <PackageModal />
      </header>

      <section className="mb-7 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active Packages", value: packages.length, icon: Package },
          { label: "Credits Offered", value: totalCredits.toLocaleString(), icon: Coins },
          { label: "Average Price", value: `$${averagePrice.toFixed(2)}`, icon: DollarSign },
        ].map((item) => <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-[#292A31] bg-[#18191E] p-5"><div className="flex size-11 items-center justify-center rounded-xl bg-[#C2384F]/15 text-[#EF5874]"><item.icon className="size-5" /></div><div><p className="text-xs uppercase tracking-wider text-[#777780]">{item.label}</p><p className="mt-1 text-2xl font-semibold text-white">{item.value}</p></div></div>)}
      </section>

      {loading ? <LoadingCards /> : packagesQuery.isError ? (
        <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6"><p className="text-sm text-red-300">{packagesQuery.error instanceof Error ? packagesQuery.error.message : "Unable to load credit packages."}</p><button type="button" onClick={() => packagesQuery.refetch()} className="mt-4 rounded-lg bg-[#C2384F] px-4 py-2 text-sm font-semibold text-white">Try again</button></section>
      ) : packages.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#383940] bg-[#18191E] p-12 text-center"><Coins className="mx-auto size-10 text-[#62636C]" /><h2 className="mt-4 text-lg font-semibold text-white">No credit packages yet</h2><p className="mt-2 text-sm text-[#888891]">Create your first package to get started.</p></section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((item, index) => (
            <article key={item.id} className="group relative overflow-hidden rounded-2xl border border-[#2D2E35] bg-gradient-to-b from-[#1E1F25] to-[#17181C] p-6 transition hover:-translate-y-0.5 hover:border-[#C2384F]/60 hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#C2384F]/10 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3"><div className="flex size-12 items-center justify-center rounded-xl bg-[#C2384F] text-white"><Coins className="size-6" /></div><span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">Active</span></div>
              <div className="relative mt-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#EF5874]">Package {String(index + 1).padStart(2, "0")}</p><h2 className="mt-2 truncate text-xl font-semibold text-white">{item.name}</h2><div className="mt-5 flex items-end justify-between"><div><p className="text-3xl font-bold text-white">{item.credits.toLocaleString()}</p><p className="mt-1 text-xs text-[#81818A]">Credits</p></div><p className="text-2xl font-semibold text-white">{new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency.toUpperCase() }).format(Number(item.price))}</p></div></div>
              <div className="relative mt-6 flex gap-2 border-t border-[#303139] pt-5"><PackageModal creditPackage={item} /><DeactivateButton creditPackage={item} /></div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
