"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Profile = {
  name: string;
  profileImage: string | null;
};

export default function Header() {
  const { data: session } = useSession();
  const profileQuery = useQuery<ApiResponse<Profile>>({
    queryKey: ["my-profile", session?.user?.userId],
    enabled: false,
  });
  const profile = profileQuery.data?.data;
  const name = profile?.name || session?.user?.name || "Admin";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-[80px] items-center justify-between gap-4  bg-[#141417] px-6 lg:left-[300px]">
      <div className="min-w-0">
       
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Avatar className="size-11 shadow-sm">
          {profile?.profileImage && (
            <AvatarImage src={profile.profileImage} alt={`${name}'s profile`} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
