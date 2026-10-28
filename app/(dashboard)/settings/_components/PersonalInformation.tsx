"use client";

import { useEffect, useState } from "react";
import { Loader2, PencilLine, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getJson, putJson } from "@/lib/api";
import { PersonalInformationSkeleton } from "./PersonalInformationSkeleton";

type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  phoneNumber: string | null;
  profileImage: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type UpdateProfilePayload = {
  name: string;
  email: string;
  phoneNumber: string | null;
};

export function PersonalInformation() {
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const profileQuery = useQuery({
    queryKey: ["my-profile", session?.user?.userId],
    queryFn: () => getJson<Profile>("/user/my-profile", accessToken),
    enabled: status === "authenticated" && Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const profile = profileQuery.data?.data;

  useEffect(() => {
    if (!profile || isEditing) return;
    setName(profile.name ?? "");
    setEmail(profile.email ?? "");
    setPhoneNumber(profile.phoneNumber ?? "");
  }, [profile, isEditing]);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => {
      if (!profile?.id) throw new Error("Profile ID was not found");
      if (!accessToken) throw new Error("Your session has expired. Please sign in again.");

      return putJson<Profile, UpdateProfilePayload>(
        `/api/v1/user/${profile.id}`,
        payload,
        accessToken,
      );
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Profile updated successfully");
      setIsEditing(false);
      await queryClient.invalidateQueries({
        queryKey: ["my-profile", session?.user?.userId],
      });
    },
    onError: (error) => {
      toast.error("Profile update failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const cancelEditing = () => {
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
    setPhoneNumber(profile?.phoneNumber ?? "");
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    updateProfileMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim() || null,
    });
  };

  if (
    status === "loading" ||
    (status === "authenticated" && !accessToken) ||
    profileQuery.isPending
  ) {
    return <PersonalInformationSkeleton />;
  }

  if (profileQuery.isError) {
    return (
      <section className="rounded-lg border border-[#303139] bg-[#1A1B20] p-5">
        <h2 className="text-2xl font-semibold text-white">Personal Information</h2>
        <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">
            {profileQuery.error instanceof Error
              ? profileQuery.error.message
              : "Unable to load profile information."}
          </p>
          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="mt-3 rounded-md bg-[#C83B55] px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[#303139] bg-[#1A1B20] p-5">
      <div className="mb-7 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-white">Personal Information</h2>
        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={cancelEditing}
              disabled={updateProfileMutation.isPending}
              className="flex h-11 items-center gap-2 rounded-lg border border-[#464750] px-5 text-base font-semibold text-white hover:bg-white/5"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
          )}
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex h-11 items-center gap-2 rounded-lg bg-[#C83B55] px-6 text-base font-semibold text-white"
            >
              <PencilLine className="h-5 w-5" />
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="flex h-11 items-center gap-2 rounded-lg bg-[#C83B55] px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateProfileMutation.isPending && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              {updateProfileMutation.isPending ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-base font-semibold text-white">Full Name</span>
          <input
            readOnly={!isEditing}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`h-[54px] w-full rounded-md border bg-[#15161A] px-4 text-base outline-none ${isEditing ? "border-[#C83B55] text-white" : "border-[#3A3B43] text-[#8B8B95]"}`}
          />
        </label>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-white">
              Email Address
            </span>
            <input
              type="email"
              readOnly={!isEditing}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`h-[54px] w-full rounded-md border bg-[#15161A] px-4 text-base outline-none ${isEditing ? "border-[#C83B55] text-white" : "border-[#3A3B43] text-[#8B8B95]"}`}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-white">Phone</span>
            <input
              type="tel"
              readOnly={!isEditing}
              value={phoneNumber}
              placeholder={isEditing ? "Enter phone number" : "Not provided"}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className={`h-[54px] w-full rounded-md border bg-[#15161A] px-4 text-base outline-none placeholder:text-[#8B8B95] ${isEditing ? "border-[#C83B55] text-white" : "border-[#3A3B43] text-[#8B8B95]"}`}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
