"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, PencilLine } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { postJson } from "@/lib/api";

type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export function ChangePassword() {
  const { data: session } = useSession();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => {
      if (!session?.accessToken) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      return postJson<unknown, ChangePasswordPayload>(
        "/auth/change-password",
        payload,
        session.accessToken,
      );
    },
    onSuccess: (response) => {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(response.message || "Password changed successfully");
    },
    onError: (error) => {
      toast.error("Password change failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("New password must be different from the current password");
      return;
    }

    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  const fields = [
    {
      id: "current-password",
      label: "Current Password",
      placeholder: "Enter current password",
      value: oldPassword,
      onChange: setOldPassword,
      autoComplete: "current-password",
    },
    {
      id: "new-password",
      label: "New Password",
      placeholder: "Enter new password",
      value: newPassword,
      onChange: setNewPassword,
      autoComplete: "new-password",
    },
    {
      id: "confirm-new-password",
      label: "Confirm New Password",
      placeholder: "Confirm new password",
      value: confirmPassword,
      onChange: setConfirmPassword,
      autoComplete: "new-password",
    },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <section className="rounded-lg border border-[#303139] bg-[#1A1B20] p-5">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-white">Change Password</h2>
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="flex h-11 items-center gap-2 rounded-lg bg-[#C83B55] px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changePasswordMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PencilLine className="h-5 w-5" />
            )}
            {changePasswordMutation.isPending ? "Changing..." : "Change"}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {fields.map((field) => {
            const isVisible = Boolean(visiblePasswords[field.id]);

            return (
              <div key={field.id} className="block">
                <label
                  htmlFor={field.id}
                  className="mb-2 block text-base font-semibold text-white"
                >
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    id={field.id}
                    type={isVisible ? "text" : "password"}
                    required
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    disabled={changePasswordMutation.isPending}
                    className="h-[54px] w-full rounded-md border border-[#3A3B43] bg-[#15161A] px-4 pr-12 text-base text-white outline-none placeholder:text-[#8B8B95] focus:border-[#C83B55] disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.id)}
                    disabled={changePasswordMutation.isPending}
                    aria-label={
                      isVisible ? `Hide ${field.label}` : `Show ${field.label}`
                    }
                    aria-pressed={isVisible}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8B8B95] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C83B55] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isVisible ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </form>
  );
}
