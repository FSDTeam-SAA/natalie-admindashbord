"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { putJson } from "@/lib/api";
import type { SubscriptionPlan } from "./SubscriptionCard";

type UpdatePlanPayload = {
  name: string;
  price: string;
  creditAllowance: number;
  messageLimit: number;
  durationDays: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  entitlementPolicy: { kind: "free" | "paid"; dailyPhoto: boolean; dailyText: boolean };
};

const fieldClassName = "h-12 w-full rounded-lg border border-[#44444B] bg-[#19191C] px-4 text-sm text-white outline-none transition placeholder:text-[#777780] focus:border-[#C2384F]";

export function EditPlanModal({ plan }: { plan: SubscriptionPlan }) {
  const [open, setOpen] = useState(false);
  const [features, setFeatures] = useState(plan.features);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) setFeatures(plan.features);
  }, [open, plan.features]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdatePlanPayload) => {
      if (!session?.accessToken) throw new Error("Your session has expired. Please sign in again.");
      return putJson<unknown, UpdatePlanPayload>(`/api/v1/subscription/${plan.id}`, payload, session.accessToken);
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Subscription plan updated successfully");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
    onError: (error) => toast.error("Unable to update subscription plan", {
      description: error instanceof Error ? error.message : "Please try again.",
    }),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const cleanedFeatures = features.map((feature) => feature.trim()).filter(Boolean);
    if (!cleanedFeatures.length) return toast.error("Please add at least one feature");

    updateMutation.mutate({
      name: String(form.get("name")).trim(),
      price: String(form.get("price")).trim(),
      creditAllowance: Number(form.get("creditAllowance")),
      messageLimit: Number(form.get("messageLimit")),
      durationDays: Number(form.get("durationDays")),
      features: cleanedFeatures,
      isPopular: form.get("isPopular") === "on",
      isActive: form.get("isActive") === "on",
      entitlementPolicy: {
        kind: String(form.get("kind")) as "free" | "paid",
        dailyPhoto: form.get("dailyPhoto") === "on",
        dailyText: form.get("dailyText") === "on",
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !updateMutation.isPending && setOpen(nextOpen)}>
      <DialogTrigger className={`mt-auto inline-flex h-12 w-full items-center justify-center rounded-[3px] border border-[#C2384F] px-5 text-base font-medium text-white transition-colors ${plan.variant === "free" ? "hover:bg-[#C2384F]" : "bg-[#C2384F] hover:bg-[#df4567]"}`}>
        Edit Plan
      </DialogTrigger>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/75 backdrop-blur-[6px]" className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] !max-w-[720px] gap-0 overflow-y-auto rounded-[16px] border-0 bg-[#1E1E22] p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-start justify-between border-b border-[#34343A] px-6 py-5">
          <div><p className="mb-2 text-xs font-medium uppercase tracking-[0.13em] text-[#EC4B6A]">Editing Plan</p><DialogTitle className="text-[18px] font-medium text-white">Edit Subscription</DialogTitle></div>
          <DialogClose disabled={updateMutation.isPending} className="flex size-10 items-center justify-center rounded-xl border border-[#3C3C42] text-[#A5A5AE] hover:text-white"><X className="size-5" /><span className="sr-only">Close</span></DialogClose>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <DialogDescription className="text-sm text-[#A4A4AC]">Update the subscription plan details and benefits.</DialogDescription>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required defaultValue={plan.rawName} placeholder="Plan name" className={fieldClassName} />
              <input name="price" required type="number" min="0" step="0.01" defaultValue={plan.rawPrice} placeholder="Price" className={fieldClassName} />
              <input name="messageLimit" required type="number" min="0" defaultValue={plan.messageLimit} placeholder="Message limit" className={fieldClassName} />
              <input name="creditAllowance" required type="number" min="0" defaultValue={plan.creditAllowance} placeholder="Credit allowance" className={fieldClassName} />
              <input name="durationDays" required type="number" min="1" defaultValue={plan.durationDays} placeholder="Duration days" className={fieldClassName} />
              <select name="kind" defaultValue={plan.entitlementPolicy.kind} className={fieldClassName}><option value="paid">Paid plan</option><option value="free">Free plan</option></select>
            </div>
            <fieldset><legend className="mb-2 text-sm font-medium text-white">Entitlement policy</legend><div className="flex flex-wrap gap-6 rounded-lg border border-[#44444B] bg-[#19191C] px-4 py-3 text-sm">
              <label className="flex items-center gap-2"><input name="dailyPhoto" type="checkbox" defaultChecked={plan.entitlementPolicy.dailyPhoto} className="accent-[#C2384F]" /> Daily photos</label>
              <label className="flex items-center gap-2"><input name="dailyText" type="checkbox" defaultChecked={plan.entitlementPolicy.dailyText} className="accent-[#C2384F]" /> Daily text</label>
            </div></fieldset>
            <fieldset><div className="mb-2 flex items-center justify-between"><legend className="text-sm font-medium">Features</legend><button type="button" onClick={() => setFeatures((current) => [...current, ""])} className="flex items-center gap-1 text-xs text-[#EC4B6A]"><Plus className="size-4" /> Add feature</button></div>
              <div className="space-y-3">{features.map((feature, index) => <div key={index} className="flex gap-2"><input value={feature} onChange={(event) => setFeatures((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className={fieldClassName} placeholder="Feature description" />{features.length > 1 && <button type="button" onClick={() => setFeatures((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#44444B] text-[#A5A5AE] hover:text-red-300"><Trash2 className="size-4" /></button>}</div>)}</div>
            </fieldset>
            <div className="flex flex-wrap gap-6 text-sm"><label className="flex items-center gap-2"><input name="isPopular" type="checkbox" defaultChecked={plan.isPopular} className="accent-[#C2384F]" /> Most popular</label><label className="flex items-center gap-2"><input name="isActive" type="checkbox" defaultChecked={plan.isActive} className="accent-[#C2384F]" /> Active plan</label></div>
          </div>
          <div className="border-t border-[#34343A] px-6 py-5"><button type="submit" disabled={updateMutation.isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#CF3B57] font-medium text-white hover:bg-[#DF4965] disabled:opacity-60">{updateMutation.isPending && <Loader2 className="size-5 animate-spin" />}{updateMutation.isPending ? "Updating..." : "Update Plan"}</button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
