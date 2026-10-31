"use client";

import { useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteJson } from "@/lib/api";

export function DeletePlanButton({ planId, planName }: { planId: string; planName: string }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!session?.accessToken) throw new Error("Your session has expired. Please sign in again.");
      return deleteJson<unknown>(`/api/v1/subscription/${planId}`, session.accessToken);
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Subscription plan deleted successfully");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
    onError: (error) => {
      toast.error("Unable to delete subscription plan", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !deleteMutation.isPending && setOpen(nextOpen)}>
      <DialogTrigger
        className="absolute right-4 top-4 z-30 flex size-9 items-center justify-center rounded-full border border-red-400/50 bg-black/60 text-red-300 opacity-0 shadow-lg backdrop-blur-sm transition hover:bg-red-500 hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={`Delete ${planName}`}
      >
        <Trash2 className="size-4" />
      </DialogTrigger>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/70 backdrop-blur-sm" className="max-w-[420px] gap-0 overflow-hidden rounded-xl border border-[#34343A] bg-[#1E1E22] p-0 text-white">
        <div className="flex items-start justify-between border-b border-[#34343A] px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-400">Delete Plan</p>
            <DialogTitle className="text-xl font-semibold text-white">Are you sure?</DialogTitle>
          </div>
          <DialogClose disabled={deleteMutation.isPending} className="flex size-9 items-center justify-center rounded-lg border border-[#44444B] text-[#A5A5AE] hover:text-white">
            <X className="size-4" /><span className="sr-only">Close</span>
          </DialogClose>
        </div>
        <div className="px-6 py-6">
          <DialogDescription className="text-sm leading-6 text-[#A4A4AC]">
            You are about to delete <strong className="text-white">{planName}</strong>. This action cannot be undone.
          </DialogDescription>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <DialogClose disabled={deleteMutation.isPending} className="h-11 rounded-full border border-[#55555D] text-sm font-semibold text-white hover:bg-white/5">Cancel</DialogClose>
            <button type="button" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="flex h-11 items-center justify-center gap-2 rounded-full bg-red-500 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
              {deleteMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
