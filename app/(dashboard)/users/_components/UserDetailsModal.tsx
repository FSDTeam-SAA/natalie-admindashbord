"use client";

import type { ReactNode } from "react";
import { Eye, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type UserRow = {
  name: string;
  email: string;
  plan: string;
  joined: string;
  spent: string;
  status?: string;
  subscriptionDate?: string;
};

type UserDetailsModalProps = {
  user: UserRow;
};

export function UserDetailsModal({ user }: UserDetailsModalProps) {
  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-[#2A2B31] hover:text-[#C83B55]"
        aria-label={`View ${user.name}`}
      >
        <Eye className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 backdrop-blur-sm"
        className="max-w-[450px] gap-0 overflow-hidden rounded-xl border border-[#303139] bg-[#1C1D22] p-0 text-white sm:max-w-[450px]"
      >
        <div className="flex items-start justify-between border-b border-[#303139] px-5 py-4">
          <div>
            <DialogDescription className="text-[10px] font-semibold uppercase text-[#C83B55]">
              Selected Member
            </DialogDescription>
            <DialogTitle className="mt-1 text-xl font-semibold text-white">
              User Details
            </DialogTitle>
          </div>
          <DialogClose className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C83B55] text-[#C83B55]">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 bg-[#D9D9D9]">
              <AvatarFallback className="bg-[#D9D9D9] text-base font-semibold text-[#222]">
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold leading-tight">{user.name}</h3>
              <p className="text-sm text-[#A6A6AF]">{user.email}</p>
              <span className="mt-1 inline-flex rounded-full bg-[#C83B55] px-2 py-0.5 text-[10px] font-semibold text-white">
                {user.plan} member
              </span>
            </div>
          </div>

          <h4 className="mt-2 text-base font-semibold uppercase text-white">Profile</h4>
          <div className="mt-2 divide-y divide-[#303139] text-sm">
            <Detail label="Account status">
              <span className="inline-flex items-center gap-2 text-white">
                <span className="h-2 w-2 rounded-full bg-[#20E24B]" />
                {user.status ?? "Active"}
              </span>
            </Detail>
            <Detail label="Current plan">{user.plan}</Detail>
            <Detail label="Subscription date">
              {user.subscriptionDate ?? "12 Oct, 2023"}
            </Detail>
            <Detail label="Joined Date">{user.joined}</Detail>
            <Detail label="Total Spent">{user.spent}</Detail>
          </div>

          <h4 className="mt-5 text-base font-semibold uppercase text-white">
            Account Actions
          </h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <DialogClose className="h-9 rounded-full border border-[#C83B55] text-sm font-semibold text-white">
              Cancel
            </DialogClose>
            <button className="h-9 rounded-full bg-[#C83B55] text-sm font-semibold text-white">
              Suspend Account
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-[#A6A6AF]">{label}</span>
      <span className="text-right font-medium text-white">{children}</span>
    </div>
  );
}
