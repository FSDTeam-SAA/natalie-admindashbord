"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Clock3, ImagePlus, Images, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getJson, patchJson, postFormData, postJson, putJson } from "@/lib/api";

type Tab = "routine" | "photos" | "daily" | "context" | "deliveries";
type RoutineSlot = { day: number; start: string; end: string; activity: string; location?: string };
type Routine = { timezone: string; weekly: RoutineSlot[] };
type LibraryPhoto = { id: string; url?: string; imageUrl?: string; secureUrl?: string; caption?: string; tags?: string[] | string; approved?: boolean; createdAt?: string };
type DailyContent = { id: string; day: string; publishAt: string; expiresAt: string; photoId: string; text: string; activity?: unknown; published?: unknown };
type UnknownRecord = Record<string, unknown>;

const tabs: { id: Tab; label: string }[] = [
  { id: "routine", label: "Routine" },
  { id: "photos", label: "Photo Library" },
  { id: "daily", label: "Daily Content" },
  { id: "context", label: "Live Context" },
  { id: "deliveries", label: "Deliveries" },
];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const fieldClass = "h-11 w-full rounded-lg border border-[#3D3E46] bg-[#15161A] px-3 text-sm text-white outline-none placeholder:text-[#6F7079] focus:border-[#C83B55]";

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as UnknownRecord;
    for (const key of ["items", "results", "photos", "contents", "deliveries", "data"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

export function LifestyleManagerModal({ companionId, companionName }: { companionId: string; companionName: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("routine");
  const { data: session } = useSession();
  const token = session?.accessToken;
  const base = `/api/v1/admin/companions/${companionId}/lifestyle`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#C83B55]/45 bg-[#C83B55]/10 text-sm font-semibold text-[#F0788F] transition hover:bg-[#C83B55] hover:text-white">
        <Sparkles className="size-4" /> Lifestyle & Photo Library
      </DialogTrigger>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/80 backdrop-blur-[5px]" className="max-h-[calc(100vh-1.5rem)] w-[calc(100%-1.5rem)] !max-w-[1100px] gap-0 overflow-hidden rounded-2xl border border-[#34353D] bg-[#1B1C21] p-0 text-white shadow-2xl ring-0">
        <header className="flex items-start justify-between border-b border-[#303139] px-5 py-4 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E86981]">Admin lifestyle</p><DialogTitle className="mt-1 text-xl font-semibold">{companionName}&apos;s Lifestyle Library</DialogTitle><DialogDescription className="mt-1 text-sm text-[#8F9099]">Manage routine, approved photos and scheduled content.</DialogDescription></div>
          <DialogClose className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#3D3E46] text-[#A5A6AE] hover:border-[#C83B55] hover:text-white"><X className="size-5" /></DialogClose>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-[#303139] px-4 pt-3 sm:px-6" aria-label="Lifestyle sections">
          {tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-semibold transition sm:text-sm ${tab === item.id ? "border-[#E0526E] text-white" : "border-transparent text-[#858690] hover:text-white"}`}>{item.label}</button>)}
        </nav>
        <div className="max-h-[calc(100vh-13.5rem)] overflow-y-auto p-5 sm:p-6">
          {tab === "routine" && <RoutineTab base={base} token={token} companionId={companionId} />}
          {tab === "photos" && <PhotosTab base={base} token={token} companionId={companionId} />}
          {tab === "daily" && <DailyTab base={base} token={token} companionId={companionId} />}
          {tab === "context" && <ReadOnlyTab url={`${base}/context`} token={token} queryKey={["lifestyle-context", companionId]} empty="No live context is available yet." />}
          {tab === "deliveries" && <ReadOnlyTab url={`${base}/deliveries?page=1`} token={token} queryKey={["lifestyle-deliveries", companionId]} empty="No deliveries have been recorded yet." list />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RoutineTab({ base, token, companionId }: { base: string; token?: string; companionId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["lifestyle-routine", companionId], queryFn: () => getJson<Routine>(`${base}/routine`, token), enabled: Boolean(token) });
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [weekly, setWeekly] = useState<RoutineSlot[]>([]);
  useEffect(() => { if (query.data?.data) { setTimezone(query.data.data.timezone || "Asia/Dhaka"); setWeekly(query.data.data.weekly ?? []); } }, [query.data]);
  const mutation = useMutation({ mutationFn: () => putJson<Routine, Routine>(`${base}/routine`, { timezone, weekly }, token), onSuccess: async (response) => { toast.success(response.message || "Routine saved successfully"); await queryClient.invalidateQueries({ queryKey: ["lifestyle-routine", companionId] }); }, onError: (error) => toast.error("Unable to save routine", { description: message(error) }) });
  const addSlot = () => setWeekly((current) => [...current, { day: 1, start: "09:00", end: "10:00", activity: "", location: "" }]);
  const update = (index: number, patch: Partial<RoutineSlot>) => setWeekly((current) => current.map((slot, itemIndex) => itemIndex === index ? { ...slot, ...patch } : slot));
  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  return <section><SectionHeader title="Weekly routine" description="Set activities using ISO weekdays and the companion's local timezone." action={<button type="button" onClick={addSlot} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#C83B55]/50 px-4 text-sm font-semibold text-[#F0788F] transition hover:bg-[#C83B55] hover:text-white"><Plus className="size-4" /> Add slot</button>} />
    <label className="mb-5 block max-w-sm text-sm text-[#C7C8CE]">Timezone<input value={timezone} onChange={(event) => setTimezone(event.target.value)} className={`${fieldClass} mt-2`} placeholder="Asia/Dhaka" /></label>
    <div className="space-y-3">{weekly.map((slot, index) => <div key={index} className="grid gap-3 rounded-xl border border-[#303139] bg-[#17181C] p-4 md:grid-cols-[1.2fr_1fr_1fr_2fr_2fr_auto]">
      <select value={slot.day} onChange={(event) => update(index, { day: Number(event.target.value) })} className={fieldClass}>{days.map((day, dayIndex) => <option key={day} value={dayIndex + 1}>{day}</option>)}</select>
      <input type="time" value={slot.start} onChange={(event) => update(index, { start: event.target.value })} className={fieldClass} />
      <input type="time" value={slot.end} onChange={(event) => update(index, { end: event.target.value })} className={fieldClass} />
      <input value={slot.activity} onChange={(event) => update(index, { activity: event.target.value })} className={fieldClass} placeholder="Activity" />
      <input value={slot.location ?? ""} onChange={(event) => update(index, { location: event.target.value })} className={fieldClass} placeholder="Location (optional)" />
      <button type="button" onClick={() => setWeekly((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="flex size-11 items-center justify-center rounded-lg border border-red-500/25 text-red-300 hover:bg-red-500 hover:text-white"><Trash2 className="size-4" /></button>
    </div>)}</div>
    {!weekly.length && <Empty text="No routine slots added." />}
    <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending || weekly.some((slot) => !slot.activity || !slot.start || !slot.end)} className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#C83B55] px-5 text-sm font-semibold text-white transition hover:bg-[#DF4965] disabled:cursor-not-allowed disabled:opacity-50">{mutation.isPending && <Loader2 className="size-4 animate-spin" />} Save Routine</button>
  </section>;
}

function PhotosTab({ base, token, companionId }: { base: string; token?: string; companionId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["lifestyle-photos", companionId], queryFn: () => getJson<unknown>(`${base}/photos?page=1`, token), enabled: Boolean(token) });
  const photos = useMemo(() => asList<LibraryPhoto>(query.data?.data), [query.data]);
  const upload = useMutation({ mutationFn: (formData: FormData) => postFormData<LibraryPhoto>(`${base}/photos`, formData, token), onSuccess: async (response) => { toast.success(response.message || "Photo uploaded successfully"); await queryClient.invalidateQueries({ queryKey: ["lifestyle-photos", companionId] }); }, onError: (error) => toast.error("Unable to upload photo", { description: message(error) }) });
  const approve = useMutation({ mutationFn: ({ id, approved }: { id: string; approved: boolean }) => patchJson<LibraryPhoto, { approved: boolean }>(`${base}/photos/${id}`, { approved }, token), onSuccess: async (response) => { toast.success(response.message || "Photo status updated"); await queryClient.invalidateQueries({ queryKey: ["lifestyle-photos", companionId] }); }, onError: (error) => toast.error("Unable to update photo", { description: message(error) }) });
  const handleUpload = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const file = form.get("image"); if (!(file instanceof File) || !file.size) return toast.error("Please select an image"); upload.mutate(form); };
  return <section><SectionHeader title="Photo library" description="Upload tagged images and control which photos are approved for delivery." />
    <form onSubmit={handleUpload} className="mb-6 grid gap-3 rounded-xl border border-[#353640] bg-[#17181C] p-4 md:grid-cols-[1.2fr_1fr_1fr_auto]">
      <label className={`${fieldClass} flex cursor-pointer items-center gap-2 text-[#A9AAB2]`}><ImagePlus className="size-4" /><span className="truncate">Choose image</span><input name="image" type="file" accept="image/*" required className="sr-only" /></label>
      <input name="caption" className={fieldClass} placeholder="Caption (optional)" /><input name="tags" className={fieldClass} placeholder="Tags: gym,morning" />
      <button disabled={upload.isPending} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#C83B55] px-5 text-sm font-semibold text-white transition hover:bg-[#DF4965] disabled:opacity-50">{upload.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Upload</button>
    </form>
    {query.isPending ? <Loading /> : query.isError ? <ErrorState error={query.error} retry={() => query.refetch()} /> : photos.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo) => { const url = photo.url || photo.imageUrl || photo.secureUrl; return <article key={photo.id} className="overflow-hidden rounded-xl border border-[#303139] bg-[#17181C]"><div className="h-44 bg-[#111216] bg-contain bg-center bg-no-repeat" style={url ? { backgroundImage: `url(${JSON.stringify(url)})` } : undefined}>{!url && <Images className="mx-auto h-full size-8 text-[#555660]" />}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><p className="line-clamp-2 text-sm font-medium text-white">{photo.caption || "Untitled photo"}</p><span className={`rounded-full px-2 py-1 text-[10px] ${photo.approved ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{photo.approved ? "Approved" : "Pending"}</span></div><p className="mt-2 line-clamp-1 text-xs text-[#7F8089]">{Array.isArray(photo.tags) ? photo.tags.join(", ") : photo.tags || "No tags"}</p><button type="button" disabled={approve.isPending} onClick={() => approve.mutate({ id: photo.id, approved: !photo.approved })} className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#3D3E46] text-xs font-semibold hover:border-[#C83B55]"><Check className="size-3.5" />{photo.approved ? "Mark pending" : "Approve photo"}</button></div></article>; })}</div> : <Empty text="No library photos found." />}
  </section>;
}

function DailyTab({ base, token, companionId }: { base: string; token?: string; companionId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["lifestyle-daily", companionId], queryFn: () => getJson<unknown>(`${base}/daily-content?page=1`, token), enabled: Boolean(token) });
  const contents = useMemo(() => asList<DailyContent>(query.data?.data), [query.data]);
  const save = useMutation({ mutationFn: (payload: Omit<DailyContent, "id">) => putJson<DailyContent, Omit<DailyContent, "id">>(`${base}/daily-content`, payload, token), onSuccess: async (response) => { toast.success(response.message || "Daily content saved successfully"); await queryClient.invalidateQueries({ queryKey: ["lifestyle-daily", companionId] }); }, onError: (error) => toast.error("Unable to save daily content", { description: message(error) }) });
  const unpublish = useMutation({ mutationFn: (id: string) => postJson<DailyContent, Record<string, never>>(`${base}/daily-content/${id}/unpublish`, {}, token), onSuccess: async (response) => { toast.success(response.message || "Content unpublished"); await queryClient.invalidateQueries({ queryKey: ["lifestyle-daily", companionId] }); }, onError: (error) => toast.error("Unable to unpublish content", { description: message(error) }) });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const toIso = (name: string) => new Date(String(form.get(name))).toISOString(); save.mutate({ day: String(form.get("day")), publishAt: toIso("publishAt"), expiresAt: toIso("expiresAt"), photoId: String(form.get("photoId")).trim(), text: String(form.get("text")).trim() }); };
  return <section><SectionHeader title="Daily content" description="Schedule a photo and message inside a defined delivery window." />
    <form onSubmit={submit} className="mb-6 grid gap-3 rounded-xl border border-[#353640] bg-[#17181C] p-4 sm:grid-cols-2 lg:grid-cols-3">
      <input name="day" type="date" required className={fieldClass} /><input name="publishAt" type="datetime-local" required className={fieldClass} /><input name="expiresAt" type="datetime-local" required className={fieldClass} />
      <input name="photoId" required className={fieldClass} placeholder="Approved photo ID" /><input name="text" required className={`${fieldClass} sm:col-span-2`} placeholder="Daily message" />
      <button disabled={save.isPending} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#C83B55] px-5 text-sm font-semibold text-white transition hover:bg-[#DF4965] disabled:opacity-50 sm:col-span-2 lg:col-span-3">{save.isPending ? <Loader2 className="size-4 animate-spin" /> : <CalendarDays className="size-4" />} Save Daily Content</button>
    </form>
    {query.isPending ? <Loading /> : query.isError ? <ErrorState error={query.error} retry={() => query.refetch()} /> : contents.length ? <div className="space-y-3">{contents.map((content) => <article key={content.id} className="flex flex-col gap-4 rounded-xl border border-[#303139] bg-[#17181C] p-4 sm:flex-row sm:items-center"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#C83B55]/12 text-[#E86981]"><CalendarDays className="size-5" /></div><div className="min-w-0 flex-1"><p className="font-medium text-white">{content.day}</p><p className="mt-1 line-clamp-2 text-sm text-[#999AA3]">{content.text}</p><p className="mt-2 flex items-center gap-1 text-xs text-[#6F7079]"><Clock3 className="size-3" /> {new Date(content.publishAt).toLocaleString()} — {new Date(content.expiresAt).toLocaleString()}</p></div><button type="button" onClick={() => unpublish.mutate(content.id)} disabled={unpublish.isPending} className="rounded-lg border border-amber-500/25 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/10">Unpublish</button></article>)}</div> : <Empty text="No daily content scheduled." />}
  </section>;
}

function ReadOnlyTab({ url, token, queryKey, empty, list = false }: { url: string; token?: string; queryKey: string[]; empty: string; list?: boolean }) {
  const query = useQuery({ queryKey, queryFn: () => getJson<unknown>(url, token), enabled: Boolean(token) });
  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const value = query.data?.data;
  const items = list ? asList<UnknownRecord>(value) : [];
  if (list && !items.length) return <Empty text={empty} />;
  if (!list && (!value || (typeof value === "object" && !Object.keys(value as object).length))) return <Empty text={empty} />;
  return <section><SectionHeader title={list ? "Delivery history" : "Current lifestyle context"} description={list ? "Read-only log of scheduled content deliveries." : "Live server-calculated context based on the saved routine."} /><div className="space-y-3">{(list ? items : [value]).map((item, index) => <div key={index} className="rounded-xl border border-[#303139] bg-[#15161A] p-4"><pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#C3C4CB]">{JSON.stringify(item, null, 2)}</pre></div>)}</div></section>;
}

function SectionHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-lg font-semibold text-white">{title}</h3><p className="mt-1 text-sm text-[#858690]">{description}</p></div>{action}</div>; }
function Loading() { return <div className="flex min-h-48 items-center justify-center"><Loader2 className="size-7 animate-spin text-[#E86981]" /></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-[#3A3B43] py-12 text-center text-sm text-[#777881]">{text}</div>; }
function ErrorState({ error, retry }: { error: unknown; retry: () => void }) { return <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-300"><p>{message(error)}</p><button type="button" onClick={retry} className="mt-3 rounded-lg bg-[#C83B55] px-4 py-2 font-semibold text-white">Try again</button></div>; }
