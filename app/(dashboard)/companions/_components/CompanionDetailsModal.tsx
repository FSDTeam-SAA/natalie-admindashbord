"use client";

import { useState } from "react";
import { BriefcaseBusiness, Loader2, MapPin, Mic2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getJson } from "@/lib/api";
import type { Companion } from "./CompanionCard";

export function CompanionDetailsModal({ companionId, companionName }: { companionId: string; companionName: string }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const detailsQuery = useQuery({
    queryKey: ["companion", companionId],
    queryFn: () => getJson<Companion>(`/api/v1/companions/${companionId}`, session?.accessToken),
    enabled: open && Boolean(session?.accessToken),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const companion = detailsQuery.data?.data;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-10 w-full rounded-lg border border-[#C83B55] text-sm font-semibold text-[#F06A83] transition hover:bg-[#C83B55] hover:text-white">View Details</DialogTrigger>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/75 backdrop-blur-sm" className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] !max-w-[900px] gap-0 overflow-y-auto rounded-2xl border border-[#303139] bg-[#191A1F] p-0 text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="sticky top-0 z-30 flex items-start justify-between border-b border-[#303139] bg-[#191A1F]/95 px-6 py-5 backdrop-blur-md">
          <div><DialogDescription className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C83B55]">Companion Profile</DialogDescription><DialogTitle className="mt-1 text-2xl font-semibold">{companion?.name || companionName}</DialogTitle></div>
          <DialogClose className="flex size-10 items-center justify-center rounded-xl border border-[#3C3D45] text-[#A5A5AE] hover:border-[#C83B55] hover:text-white"><X className="size-5" /><span className="sr-only">Close</span></DialogClose>
        </div>

        {detailsQuery.isPending ? (
          <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="size-8 animate-spin text-[#C83B55]" /></div>
        ) : detailsQuery.isError ? (
          <div className="m-6 rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300"><p>{detailsQuery.error instanceof Error ? detailsQuery.error.message : "Unable to load companion details."}</p><button type="button" onClick={() => detailsQuery.refetch()} className="mt-3 rounded-md bg-[#C83B55] px-4 py-2 font-semibold text-white">Try again</button></div>
        ) : companion ? (
          <div className="space-y-8 p-6">
            <section className="grid gap-6 md:grid-cols-[280px_1fr]">
              <div className="h-[360px] w-full rounded-xl bg-[#24252B] bg-contain bg-center bg-no-repeat" style={companion.profileImage ? { backgroundImage: `url(${JSON.stringify(companion.profileImage)})` } : undefined} role="img" aria-label={`${companion.name} profile`} />
              <div>
                <div className="flex flex-wrap items-center gap-3"><h3 className="font-serif text-3xl font-semibold">{companion.name}{companion.age ? `, ${companion.age}` : ""}</h3><span className={`rounded-full px-3 py-1 text-xs ${companion.status ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{companion.status ? "Active" : "Inactive"}</span></div>
                <p className="mt-2 text-[#D0D0D5]">{companion.title}</p>
                <div className="mt-5 space-y-2 text-sm text-[#A7A7AF]"><p className="flex items-center gap-2"><MapPin className="size-4 text-[#C83B55]" />{companion.background?.location}</p><p className="flex items-center gap-2"><BriefcaseBusiness className="size-4 text-[#C83B55]" />{companion.background?.occupation}</p><p className="flex items-center gap-2 capitalize"><Mic2 className="size-4 text-[#C83B55]" />{companion.voice?.provider}</p></div>
                <p className="mt-6 text-sm leading-7 text-[#B4B4BC]">{companion.personality?.about}</p>
              </div>
            </section>

            {companion.galleryImages.length > 0 && <Section title="Gallery"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{companion.galleryImages.map((image, index) => <div key={image} className="h-56 w-full rounded-xl bg-[#24252B] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${JSON.stringify(image)})` }} role="img" aria-label={`${companion.name} gallery image ${index + 1}`} />)}</div></Section>}
            <Section title="Personality"><p className="mb-4 text-sm leading-7 text-[#B4B4BC]">{companion.personality?.essence}</p><Tags items={companion.personality?.traits ?? []} /><List title="Shared traits" items={companion.personality?.sharedTraits ?? []} /></Section>
            <Section title="Communication style"><Tags items={companion.communicationStyle?.styleTraits ?? []} /><p className="mt-4 text-sm leading-7 text-[#B4B4BC]"><span className="font-semibold text-white">Topics:</span> {companion.communicationStyle?.topicsSheEnjoys}</p><List title="What you experience" items={companion.communicationStyle?.whatYouExperience ?? []} /></Section>
            <Section title="Interests"><Tags items={companion.interests} /></Section>
            <Section title="Lifestyle"><List items={companion.background?.lifestyle ?? []} /></Section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-[#303139] bg-[#1D1E23] p-5"><h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>{children}</section>;
}

function Tags({ items }: { items: string[] }) {
  return <div className="flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full border border-[#47303A] bg-[#351D2B] px-3 py-1.5 text-xs text-[#F08CB0]">{item}</span>)}</div>;
}

function List({ title, items }: { title?: string; items: string[] }) {
  if (!items.length) return null;
  return <div className="mt-5">{title && <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>}<ul className="grid gap-2 text-sm text-[#B4B4BC] sm:grid-cols-2">{items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#C83B55]" />{item}</li>)}</ul></div>;
}
