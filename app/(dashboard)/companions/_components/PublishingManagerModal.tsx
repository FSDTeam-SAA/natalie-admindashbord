"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock3, ImagePlus, Loader2, Megaphone, RefreshCw, Send, Smartphone, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteJson, getJson, postFormData, postJson, putFormData, putJson, type ApiResponse } from "@/lib/api";

type TelegramProfile = {
  displayName?: string;
  about?: string;
  description?: string;
  photoUrl?: string | null;
  status?: string;
  publishingStatus?: string;
  lastError?: string | null;
  error?: string | null;
  updatedAt?: string;
};
type MediaStory = {
  id: string;
  caption?: string | null;
  mediaUrl?: string;
  mediaPath?: string;
  url?: string;
  mimeType?: string;
  mediaType?: string;
  createdAt?: string;
  expiresAt?: string;
  publishedAt?: string;
};
type UnknownRecord = Record<string, unknown>;
type ProfileImageResponse = {
  profileImage: string | null;
  telegramSync?: {
    status?: string;
    lastError?: string | null;
  };
};

const inputClass = "h-11 w-full rounded-lg border border-[#3D3E46] bg-[#15161A] px-3 text-sm text-white outline-none placeholder:text-[#6F7079] focus:border-[#C83B55]";
const textareaClass = "w-full resize-y rounded-lg border border-[#3D3E46] bg-[#15161A] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-[#6F7079] focus:border-[#C83B55]";

function asStories(value: unknown): MediaStory[] {
  if (Array.isArray(value)) return value as MediaStory[];
  if (value && typeof value === "object") {
    const record = value as UnknownRecord;
    for (const key of ["items", "stories", "results", "data"]) {
      if (Array.isArray(record[key])) return record[key] as MediaStory[];
    }
  }
  return [];
}

function apiMediaUrl(storyId: string, mediaPath?: string) {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
  const path = mediaPath || `/api/v1/media-stories/${storyId}/media`;
  if (/^https?:\/\//i.test(path)) return path;
  return base.endsWith("/api/v1") ? `${base}${path.replace("/api/v1", "")}` : `${base}${path}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

export function PublishingManagerModal({ companionId, companionName }: { companionId: string; companionName: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"profile" | "stories">("profile");
  const { data: session } = useSession();
  const token = session?.accessToken;
  const base = `/api/v1/admin/companions/${companionId}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-sky-500/35 bg-sky-500/10 text-sm font-semibold text-sky-300 transition hover:bg-sky-500 hover:text-white">
        <Megaphone className="size-4" /> Publishing & Stories
      </DialogTrigger>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/80 backdrop-blur-[5px]" className="max-h-[calc(100vh-1.5rem)] w-[calc(100%-1.5rem)] !max-w-[1000px] gap-0 overflow-hidden rounded-2xl border border-[#34353D] bg-[#1B1C21] p-0 text-white shadow-2xl ring-0">
        <header className="flex items-start justify-between border-b border-[#303139] px-5 py-4 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-400">Admin publishing</p><DialogTitle className="mt-1 text-xl font-semibold">{companionName}&apos;s Publishing</DialogTitle><DialogDescription className="mt-1 text-sm text-[#8F9099]">Manage Telegram identity and publish temporary media stories.</DialogDescription></div>
          <DialogClose className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#3D3E46] text-[#A5A6AE] hover:border-sky-500 hover:text-white"><X className="size-5" /></DialogClose>
        </header>
        <nav className="flex border-b border-[#303139] px-5 pt-3 sm:px-6">
          <button type="button" onClick={() => setTab("profile")} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${tab === "profile" ? "border-sky-400 text-white" : "border-transparent text-[#858690]"}`}><Smartphone className="size-4" /> Telegram Profile</button>
          <button type="button" onClick={() => setTab("stories")} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${tab === "stories" ? "border-sky-400 text-white" : "border-transparent text-[#858690]"}`}><ImagePlus className="size-4" /> 24-hour Stories</button>
        </nav>
        <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-5 sm:p-6">
          {tab === "profile" ? <ProfileTab base={base} companionId={companionId} token={token} companionName={companionName} /> : <StoriesTab base={base} companionId={companionId} token={token} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProfileTab({ base, companionId, token, companionName }: { base: string; companionId: string; token?: string; companionName: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["telegram-profile", companionId], queryFn: () => getJson<TelegramProfile>(`${base}/telegram-profile`, token), enabled: Boolean(token) });
  const profile = query.data?.data;
  const [displayName, setDisplayName] = useState(companionName);
  const [about, setAbout] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  useEffect(() => { if (profile) { setDisplayName(profile.displayName || companionName); setAbout(profile.about || ""); setDescription(profile.description || ""); } }, [profile, companionName]);
  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(profile?.photoUrl || "");
      return;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile, profile?.photoUrl]);
  const save = useMutation({ mutationFn: () => putJson<TelegramProfile, Pick<TelegramProfile, "displayName" | "about" | "description">>(`${base}/telegram-profile`, { displayName: displayName.trim(), about: about.trim(), description: description.trim() }, token), onSuccess: async (response) => { toast.success(response.message || "Telegram profile updated successfully"); await queryClient.invalidateQueries({ queryKey: ["telegram-profile", companionId] }); }, onError: (error) => toast.error("Unable to update Telegram profile", { description: errorMessage(error) }) });
  const photo = useMutation({
    mutationFn: () => {
      if (!photoFile) throw new Error("Please select a profile image first.");
      const formData = new FormData();
      formData.append("profileImage", photoFile);
      return putFormData<ProfileImageResponse>(`/api/v1/companions/${companionId}/profile-image`, formData, token);
    },
    onSuccess: async (response) => {
      setPhotoFile(null);
      setPhotoPreview(response.data.profileImage || "");
      if (response.data.telegramSync?.lastError) {
        toast.warning("Website photo updated, but Telegram sync needs attention", { description: response.data.telegramSync.lastError });
      } else {
        toast.success("Profile photo updated and queued for Telegram sync");
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["telegram-profile", companionId] }),
        queryClient.invalidateQueries({ queryKey: ["companions"] }),
        queryClient.invalidateQueries({ queryKey: ["companion", companionId] }),
      ]);
    },
    onError: (error) => toast.error("Unable to update profile photo", { description: errorMessage(error) }),
  });
  const retry = useMutation({ mutationFn: () => postJson<TelegramProfile, Record<string, never>>(`${base}/telegram-profile/retry`, {}, token), onSuccess: async (response) => { toast.success(response.message || "Publishing retry started"); await queryClient.invalidateQueries({ queryKey: ["telegram-profile", companionId] }); }, onError: (error) => toast.error("Unable to retry publishing", { description: errorMessage(error) }) });
  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const status = profile?.publishingStatus || profile?.status || "Ready";
  const failure = profile?.lastError || profile?.error;
  return <section>
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#303139] bg-[#16171B] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className={`flex size-10 items-center justify-center rounded-xl ${failure ? "bg-red-500/12 text-red-300" : "bg-emerald-500/12 text-emerald-300"}`}>{failure ? <AlertCircle className="size-5" /> : <CheckCircle2 className="size-5" />}</span><div><p className="text-xs uppercase tracking-wider text-[#7D7E87]">Publishing status</p><p className="mt-1 font-semibold capitalize text-white">{status}</p></div></div><button type="button" onClick={() => retry.mutate()} disabled={retry.isPending} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-sky-500/30 px-4 text-sm font-semibold text-sky-300 hover:bg-sky-500 hover:text-white disabled:opacity-50">{retry.isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Retry publishing</button></div>
    {failure && <p className="mb-5 rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">{failure}</p>}
    <div className="mb-6 rounded-xl border border-[#303139] bg-[#16171B] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#3D3E46] bg-[#101115]">
          {photoPreview ? <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${JSON.stringify(photoPreview)})` }} /> : <Smartphone className="size-8 text-[#555660]" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">Telegram profile photo</h3>
          <p className="mt-1 text-xs leading-5 text-[#858690]">JPEG, PNG or WebP. The website image is saved first, then Telegram sync runs in the background.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-sky-500/35 px-4 text-sm font-semibold text-sky-300 transition hover:bg-sky-500 hover:text-white">
              <ImagePlus className="size-4" /> {photoFile ? "Change image" : "Select image"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)} />
            </label>
            <button type="button" onClick={() => photo.mutate()} disabled={!photoFile || photo.isPending} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
              {photo.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {photo.isPending ? "Uploading..." : "Update photo"}
            </button>
          </div>
          {photoFile && <p className="mt-2 truncate text-xs text-[#A7A8B0]">Selected: {photoFile.name}</p>}
        </div>
      </div>
    </div>
    <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="space-y-4">
      <label className="block text-sm text-[#C8C9CF]">Display name <span className="text-[#777881]">({displayName.length}/64)</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={64} required className={`${inputClass} mt-2`} /></label>
      <label className="block text-sm text-[#C8C9CF]">About <span className="text-[#777881]">({about.length}/120)</span><input value={about} onChange={(event) => setAbout(event.target.value)} maxLength={120} className={`${inputClass} mt-2`} placeholder="A short Telegram bio" /></label>
      <label className="block text-sm text-[#C8C9CF]">Description <span className="text-[#777881]">({description.length}/512)</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={512} rows={5} className={`${textareaClass} mt-2`} placeholder="Full companion description" /></label>
      <button disabled={save.isPending || !displayName.trim()} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50">{save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Update Telegram Profile</button>
    </form>
  </section>;
}

function StoriesTab({ base, companionId, token }: { base: string; companionId: string; token?: string }) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<{ url: string; type: string } | null>(null);
  const query = useQuery({ queryKey: ["media-stories", companionId], queryFn: () => getJson<unknown>(`${base}/media-stories`, token), enabled: Boolean(token) });
  const stories = useMemo(() => asStories(query.data?.data), [query.data]);
  const publish = useMutation({ mutationFn: (formData: FormData) => postFormData<MediaStory>(`${base}/media-stories`, formData, token), onSuccess: async (response) => { toast.success(response.message || "Story published successfully"); setPreview(null); await queryClient.invalidateQueries({ queryKey: ["media-stories", companionId] }); }, onError: (error) => toast.error("Unable to publish story", { description: errorMessage(error) }) });
  const remove = useMutation({ mutationFn: (storyId: string) => deleteJson<unknown>(`${base}/media-stories/${storyId}`, token), onSuccess: async (response, storyId) => {
    queryClient.setQueryData<ApiResponse<unknown>>(["media-stories", companionId], (current) => {
      if (!current) return current;
      if (Array.isArray(current.data)) return { ...current, data: current.data.filter((item) => (item as MediaStory).id !== storyId) };
      return current;
    });
    toast.success(response.message || "Story deleted successfully");
    await queryClient.invalidateQueries({ queryKey: ["media-stories", companionId] });
  }, onError: (error) => toast.error("Unable to delete story", { description: errorMessage(error) }) });
  const pickMedia = (file?: File) => { if (preview) URL.revokeObjectURL(preview.url); setPreview(file ? { url: URL.createObjectURL(file), type: file.type } : null); };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const file = form.get("media"); if (!(file instanceof File) || !file.size) return toast.error("Please select an image or video"); publish.mutate(form); };
  return <section>
    <div className="mb-5"><h3 className="text-lg font-semibold">Publish a story</h3><p className="mt-1 text-sm text-[#858690]">Stories remain available for 24 hours. Images and videos are supported.</p></div>
    <form onSubmit={submit} className="mb-7 grid gap-4 rounded-xl border border-[#303139] bg-[#16171B] p-4 md:grid-cols-[220px_1fr]">
      <label className="relative flex h-56 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#41434C] bg-[#101115] text-center text-[#777881] hover:border-sky-500">
        {preview ? preview.type.startsWith("video/") ? <video src={preview.url} className="size-full object-contain" controls /> : <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${JSON.stringify(preview.url)})` }} /> : <span><ImagePlus className="mx-auto mb-2 size-8" />Choose media</span>}
        <input name="media" type="file" accept="image/*,video/*" required className="sr-only" onChange={(event) => pickMedia(event.target.files?.[0])} />
      </label>
      <div className="flex flex-col"><label className="text-sm text-[#C8C9CF]">Caption<textarea name="caption" maxLength={2048} rows={6} className={`${textareaClass} mt-2 flex-1`} placeholder="Write a story caption..." /></label><button disabled={publish.isPending} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50">{publish.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Publish Story</button></div>
    </form>
    <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Published stories</h3><span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-[#A1A2AA]">{stories.length} active</span></div>
    {query.isPending ? <Loading /> : query.isError ? <ErrorState error={query.error} retry={() => query.refetch()} /> : stories.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stories.map((story) => <StoryCard key={story.id} story={story} deleting={remove.isPending && remove.variables === story.id} onDelete={() => remove.mutate(story.id)} />)}</div> : <Empty />}
  </section>;
}

function StoryCard({ story, deleting, onDelete }: { story: MediaStory; deleting: boolean; onDelete: () => void }) {
  const source = story.mediaUrl || story.url || apiMediaUrl(story.id, story.mediaPath);
  const video = story.mimeType?.startsWith("video/") || story.mediaType === "video";
  return <article className="group overflow-hidden rounded-xl border border-[#303139] bg-[#15161A]"><div className="relative h-56 bg-[#0E0F12]">{video ? <video src={source} className="size-full object-contain" controls preload="metadata" /> : <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${JSON.stringify(source)})` }} />}<button type="button" onClick={onDelete} disabled={deleting} className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full border border-red-400/40 bg-red-600 text-white opacity-0 shadow-lg transition group-hover:opacity-100 focus:opacity-100 disabled:opacity-60">{deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button></div><div className="p-4"><p className="line-clamp-2 min-h-10 text-sm text-[#D0D1D6]">{story.caption || "No caption"}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-[#777881]"><Clock3 className="size-3.5" />{story.expiresAt ? `Expires ${new Date(story.expiresAt).toLocaleString()}` : story.createdAt || story.publishedAt ? `Published ${new Date(story.createdAt || story.publishedAt!).toLocaleString()}` : "Active for 24 hours"}</p></div></article>;
}

function Loading() { return <div className="flex min-h-48 items-center justify-center"><Loader2 className="size-7 animate-spin text-sky-400" /></div>; }
function Empty() { return <div className="rounded-xl border border-dashed border-[#3A3B43] py-12 text-center"><ImagePlus className="mx-auto size-8 text-[#555660]" /><p className="mt-3 text-sm text-[#777881]">No active stories found.</p></div>; }
function ErrorState({ error, retry }: { error: unknown; retry: () => void }) { return <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-300"><p>{errorMessage(error)}</p><button type="button" onClick={retry} className="mt-3 rounded-lg bg-[#C83B55] px-4 py-2 font-semibold text-white">Try again</button></div>; }
