"use client";

import { FormEvent, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { postJson } from "@/lib/api";

type CreateSubscriptionPayload = {
  entitlementPolicy: {
    kind: "free" | "paid";
    dailyPhoto: boolean;
    dailyText: boolean;
  };
  name: string;
  price: string;
  messageLimit: number;
  creditAllowance: number;
  durationDays: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
};

type CreatedSubscription = CreateSubscriptionPayload & { id: string };

const fieldClassName =
  "h-12 w-full rounded-lg border border-[#44444B] bg-[#19191C] px-4 text-sm text-white outline-none transition placeholder:text-[#777780] focus:border-[#C2384F]";

export function CreatePlanModal() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [features, setFeatures] = useState([""]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateSubscriptionPayload) => {
      if (!session?.accessToken) {
        throw new Error("Your session has expired. Please sign in again.");
      }
      return postJson<CreatedSubscription, CreateSubscriptionPayload>(
        "/api/v1/subscription",
        payload,
        session.accessToken,
      );
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Subscription plan created successfully");
      setOpen(false);
      setFeatures([""]);
      await queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
    onError: (error) => {
      toast.error("Unable to create subscription plan", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const updateFeature = (index: number, value: string) => {
    setFeatures((current) => current.map((feature, featureIndex) => featureIndex === index ? value : feature));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const cleanedFeatures = features.map((feature) => feature.trim()).filter(Boolean);

    if (cleanedFeatures.length === 0) {
      toast.error("Please add at least one feature");
      return;
    }

    createMutation.mutate({
      entitlementPolicy: {
        kind: String(form.get("kind")) as "free" | "paid",
        dailyPhoto: form.get("dailyPhoto") === "on",
        dailyText: form.get("dailyText") === "on",
      },
      name: String(form.get("name")).trim(),
      price: String(form.get("price")).trim(),
      messageLimit: Number(form.get("messageLimit")),
      creditAllowance: Number(form.get("creditAllowance")),
      durationDays: Number(form.get("durationDays")),
      features: cleanedFeatures,
      isPopular: form.get("isPopular") === "on",
      isActive: form.get("isActive") === "on",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !createMutation.isPending && setOpen(nextOpen)}>
      <DialogTrigger className="shrink-0 rounded-full bg-[#C2384F] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#D1455E] sm:text-sm">
        Create Plan
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[6px]"
        className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] !max-w-[720px] gap-0 overflow-y-auto rounded-[16px] border-0 bg-[#1E1E22] p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-0"
      >
        <div className="flex items-start justify-between border-b border-[#34343A] px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.13em] text-[#EC4B6A]">Creating Plan</p>
            <DialogTitle className="text-[18px] font-medium leading-none text-white">New Subscription</DialogTitle>
          </div>
          <DialogClose disabled={createMutation.isPending} className="flex size-10 items-center justify-center rounded-xl border border-[#3C3C42] text-[#A5A5AE] hover:border-[#C2384F] hover:text-white">
            <X className="size-5" /><span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <DialogDescription className="text-sm leading-6 text-[#A4A4AC]">Create the plan members see at checkout.</DialogDescription>

            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Premium Plan" className={fieldClassName} />
              <input name="price" required type="number" min="0" step="0.01" placeholder="Price" className={fieldClassName} />
              <input name="messageLimit" required type="number" min="0" placeholder="Message limit" className={fieldClassName} />
              <input name="creditAllowance" required type="number" min="0" placeholder="Credit allowance" className={fieldClassName} />
              <input name="durationDays" required type="number" min="1" placeholder="Duration days" className={fieldClassName} />
              <select name="kind" defaultValue="paid" className={fieldClassName}>
                <option value="paid">Paid plan</option>
                <option value="free">Free plan</option>
              </select>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-white">Entitlement policy</legend>
              <div className="flex flex-wrap gap-6 rounded-lg border border-[#44444B] bg-[#19191C] px-4 py-3 text-sm text-white">
                <label className="flex items-center gap-2">
                  <input name="dailyPhoto" type="checkbox" className="accent-[#C2384F]" />
                  Daily photos
                </label>
                <label className="flex items-center gap-2">
                  <input name="dailyText" type="checkbox" className="accent-[#C2384F]" />
                  Daily text
                </label>
              </div>
            </fieldset>

            <fieldset>
              <div className="mb-2 flex items-center justify-between">
                <legend className="text-sm font-medium text-white">Features</legend>
                <button type="button" onClick={() => setFeatures((current) => [...current, ""])} className="flex items-center gap-1 text-xs text-[#EC4B6A]"><Plus className="size-4" /> Add feature</button>
              </div>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input value={feature} onChange={(event) => updateFeature(index, event.target.value)} placeholder="Feature description" className={fieldClassName} />
                    {features.length > 1 && <button type="button" onClick={() => setFeatures((current) => current.filter((_, featureIndex) => featureIndex !== index))} className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#44444B] text-[#A5A5AE] hover:border-red-400 hover:text-red-300" aria-label={`Remove feature ${index + 1}`}><Trash2 className="size-4" /></button>}
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-6 text-sm text-white">
              <label className="flex items-center gap-2"><input name="isPopular" type="checkbox" className="accent-[#C2384F]" /> Most popular</label>
              <label className="flex items-center gap-2"><input name="isActive" type="checkbox" defaultChecked className="accent-[#C2384F]" /> Active plan</label>
            </div>
          </div>

          <div className="border-t border-[#34343A] px-6 py-5">
            <button type="submit" disabled={createMutation.isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#CF3B57] text-base font-medium text-white hover:bg-[#DF4965] disabled:cursor-not-allowed disabled:opacity-60">
              {createMutation.isPending && <Loader2 className="size-5 animate-spin" />}
              {createMutation.isPending ? "Creating..." : "Create Plan"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
