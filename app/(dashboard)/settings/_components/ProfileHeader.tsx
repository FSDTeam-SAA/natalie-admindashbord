"use client";

import { ChangeEvent, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getJson, putFormData } from "@/lib/api";

type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  profileImage: string | null;
};

export function ProfileHeader() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;

  const profileQuery = useQuery({
    queryKey: ["my-profile", session?.user?.userId],
    queryFn: () => getJson<Profile>("/user/my-profile", accessToken),
    enabled: status === "authenticated" && Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const profile = profileQuery.data?.data;

  const imageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.id) throw new Error("Profile ID was not found");
      if (!accessToken) throw new Error("Your session has expired. Please sign in again.");
      if (!file.type.startsWith("image/")) throw new Error("Please select a valid image file");
      if (file.size > 5 * 1024 * 1024) throw new Error("Image must be smaller than 5 MB");

      const formData = new FormData();
      formData.append("profileImage", file);

      return putFormData<Profile>(
        `/api/v1/user/${profile.id}`,
        formData,
        accessToken,
      );
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Profile image updated successfully");
      await queryClient.invalidateQueries({
        queryKey: ["my-profile", session?.user?.userId],
      });
    },
    onError: (error) => {
      toast.error("Profile image update failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) imageMutation.mutate(file);
    event.target.value = "";
  };

  if (profileQuery.isPending) {
    return (
      <section className="flex min-h-[160px] animate-pulse items-center gap-5 rounded-lg border border-[#303139] bg-[#1A1B20] p-5">
        <div className="h-[112px] w-[112px] rounded-full bg-[#292A30]" />
        <div className="space-y-3">
          <div className="h-7 w-40 rounded bg-[#292A30]" />
          <div className="h-5 w-28 rounded bg-[#292A30]" />
        </div>
      </section>
    );
  }

  const initials =
    profile?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <section className="flex min-h-[160px] items-center gap-5 rounded-lg border border-[#303139] bg-[#1A1B20] p-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={imageMutation.isPending || !profile}
        className="group relative h-[112px] w-[112px] shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#E6C6A2] via-[#63706D] to-[#141417] text-3xl font-semibold text-white ring-2 ring-[#303139] disabled:cursor-not-allowed"
        aria-label="Update profile image"
      >
        {profile?.profileImage ? (
          <span
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${JSON.stringify(profile.profileImage)})` }}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">{initials}</span>
        )}

        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/65 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {imageMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
          {imageMutation.isPending ? "Uploading" : "Edit"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="sr-only"
        tabIndex={-1}
      />

      <div>
        <h1 className="text-2xl font-semibold text-white">
          {profile?.name || "Admin"}
        </h1>
        <p className="mt-2 text-lg font-medium capitalize text-white">
          {profile?.role || "admin"}
        </p>
      </div>
    </section>
  );
}
