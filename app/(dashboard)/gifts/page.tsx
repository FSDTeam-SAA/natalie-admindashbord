"use client";
import { useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJson, patchJson, postFormData, putJson } from "@/lib/api";
import { toast } from "sonner";

type Gift = {
  id: string;
  name: string;
  creditCost: number;
  isActive: boolean;
  image?: string;
};
const field =
  "w-full rounded-lg border border-white/20 bg-[#17171b] p-3 text-white";
const button =
  "rounded-lg bg-[#c2384f] px-5 py-3 text-sm text-white disabled:opacity-40";
export default function GiftsPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Gift | null>(null);
  const gifts = useQuery({
    queryKey: ["admin-gifts", page],
    queryFn: () =>
      getJson<Gift[]>(`/api/v1/gifts/admin?page=${page}&limit=20`, token),
    enabled: !!token,
  });
  const costs = useQuery({
    queryKey: ["admin-credit-costs"],
    queryFn: () =>
      getJson<Record<string, number>>("/api/v1/credits/costs", token),
    enabled: !!token,
  });
  const save = useMutation({
    mutationFn: async (form: FormData) => {
      if (!token) throw new Error("Please sign in again");
      if (editing)
        return patchJson(
          `/api/v1/gifts/${editing.id}`,
          {
            name: String(form.get("name")).trim(),
            creditCost: Number(form.get("creditCost")),
            isActive: form.get("isActive") === "on",
          },
          token,
        );
      // Omit the optional boolean so multipart coercion cannot turn 'false' into true.
      form.delete("isActive");
      return postFormData("/api/v1/gifts", form, token);
    },
    onSuccess: async () => {
      setEditing(null);
      toast.success("Gift saved");
      await client.invalidateQueries({ queryKey: ["admin-gifts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const cost = useMutation({
    mutationFn: ({ action, credits }: { action: string; credits: number }) => {
      if (!token) throw new Error("Please sign in again");
      return putJson(
        `/api/v1/admin/credit-costs/${action}`,
        { credits },
        token,
      );
    },
    onSuccess: async () => {
      toast.success("Credit cost updated");
      await client.invalidateQueries({ queryKey: ["admin-credit-costs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate(new FormData(event.currentTarget));
  }
  return (
    <div className="space-y-8 p-4 text-white sm:p-8">
      <h1 className="text-3xl font-semibold">Gifts & credit costs</h1>
      <p className="text-sm text-white/50">
        Changes affect future purchases and actions. Previous gift transactions
        keep their original credit cost. Credit bundles are managed under
        Credits.
      </p>
      <section className="rounded-2xl border border-white/10 bg-[#1e1e22] p-6">
        <h2 className="mb-5 text-xl">
          {editing ? "Edit gift" : "Create gift"}
        </h2>
        <form
          key={editing?.id || "new"}
          onSubmit={submit}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label>
            Gift name
            <input
              className={`${field} mt-2`}
              name="name"
              required
              maxLength={100}
              defaultValue={editing?.name}
            />
          </label>
          <label>
            Credit cost
            <input
              className={`${field} mt-2`}
              name="creditCost"
              type="number"
              min="1"
              step="1"
              required
              defaultValue={editing?.creditCost}
            />
          </label>
          {!editing && (
            <label>
              Gift image
              <input
                className="mt-2 block w-full"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
          )}
          {editing && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={editing.isActive}
              />{" "}
              Available to customers
            </label>
          )}
          <div className="flex items-center gap-4">
            <button disabled={save.isPending || !token} className={button}>
              {save.isPending ? "Saving…" : "Save gift"}
            </button>
            {editing && (
              <button
                disabled={save.isPending}
                type="button"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
      <section>
        <h2 className="mb-4 text-xl">Gift catalogue</h2>
        {gifts.isPending ? (
          <p>Loading gifts…</p>
        ) : gifts.isError ? (
          <button onClick={() => void gifts.refetch()}>
            Unable to load gifts. Retry
          </button>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gifts.data.data.map((g) => (
                <article
                  key={g.id}
                  className="rounded-xl border border-white/10 p-5"
                >
                  <h3>{g.name}</h3>
                  <p className="my-3 text-sm text-white/60">
                    {g.creditCost} credits ·{" "}
                    {g.isActive ? "Active" : "Inactive"}
                  </p>
                  <button
                    className={button}
                    disabled={save.isPending}
                    onClick={() => setEditing(g)}
                  >
                    Edit / activate
                  </button>
                </article>
              ))}
            </div>
            {!gifts.data.data.length && <p>No gifts on this page.</p>}
            <div className="mt-5 flex justify-between">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                disabled={page * 20 >= (gifts.data.meta?.total || 0)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
      <section className="rounded-2xl border border-white/10 p-6">
        <h2 className="mb-4 text-xl">Credit costs per action</h2>
        {costs.isPending ? (
          <p>Loading costs…</p>
        ) : costs.isError ? (
          <button onClick={() => void costs.refetch()}>
            Unable to load costs. Retry
          </button>
        ) : (
          <div className="space-y-4">
            {Object.entries(costs.data.data).map(([action, value]) => (
              <form
                key={`${action}:${value}`}
                className="flex flex-wrap items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  cost.mutate({
                    action,
                    credits: Number(
                      new FormData(e.currentTarget).get("credits"),
                    ),
                  });
                }}
              >
                <label className="grow capitalize">
                  {action.replaceAll("_", " ")}
                  <input
                    name="credits"
                    className={`${field} mt-2`}
                    type="number"
                    min="0"
                    step="1"
                    required
                    defaultValue={value}
                  />
                </label>
                <button disabled={cost.isPending || !token} className={button}>
                  Save cost
                </button>
              </form>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
