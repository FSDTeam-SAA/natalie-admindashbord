import { BriefcaseBusiness, ImageIcon, MapPin, MessageCircleHeart, Mic2 } from "lucide-react";
import { CompanionDetailsModal } from "./CompanionDetailsModal";
import { EditCompanionModal } from "./EditCompanionModal";
import { LifestyleManagerModal } from "./LifestyleManagerModal";
import { PublishingManagerModal } from "./PublishingManagerModal";

export type Companion = {
  id: string;
  name: string;
  title: string;
  version: number;
  age: number | null;
  backstory: string | null;
  voiceDescription: string[];
  profileImage: string | null;
  coverImage: string | null;
  galleryImages: string[];
  status: boolean;
  interests: string[];
  personality: {
    traits: string[];
    about: string;
    essence: string;
    sharedTraits: string[];
  };
  communicationStyle: {
    styleTraits: string[];
    topicsSheEnjoys: string;
    whatYouExperience: string[];
  };
  background: {
    location: string;
    occupation: string;
    lifestyle: string[];
  };
  voice: {
    provider: string;
    voiceId: string | null;
    settings: {
      stability: number;
      similarityBoost: number;
      style: number;
      useSpeakerBoost: boolean;
      speed: number;
    };
  };
  visualProfile: {
    aestheticKeywords: string[];
    note: string | null;
    referenceImages: string[];
    physicalIdentity: string | null;
    generationInstructions: string | null;
  };
};

export function CompanionCard({ companion }: { companion: Companion }) {
  const initials = companion.name.slice(0, 2).toUpperCase();
  const backgroundImage = companion.profileImage;
  const ambientImage = companion.coverImage || companion.profileImage;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#191A1F] text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition duration-500 hover:-translate-y-1.5 hover:border-[#C83B55]/55 hover:shadow-[0_28px_70px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-[#F0788F]/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-[#40202A] via-[#24252C] to-[#111216]">
        {ambientImage && <div className="absolute -inset-6 scale-110 bg-cover bg-center opacity-35 blur-2xl" style={{ backgroundImage: `url(${JSON.stringify(ambientImage)})` }} />}
        {backgroundImage ? (
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.04]"
            style={{ backgroundImage: `url(${JSON.stringify(backgroundImage)})` }}
            role="img"
            aria-label={companion.name}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl font-semibold text-white/70">{initials}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#191A1F] via-transparent to-black/30" />
        <span className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-xl ${companion.status ? "border-emerald-400/25 bg-emerald-950/55 text-emerald-300" : "border-red-400/25 bg-red-950/55 text-red-300"}`}>
          <span className={`size-1.5 rounded-full shadow-[0_0_8px_currentColor] ${companion.status ? "bg-emerald-400" : "bg-red-400"}`} />
          {companion.status ? "Active" : "Inactive"}
        </span>
        {companion.galleryImages.length > 0 && (
          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[11px] text-white backdrop-blur-xl">
            <ImageIcon className="size-3.5" /> {companion.galleryImages.length}
          </span>
        )}
        <div className="absolute inset-x-5 bottom-5">
          <h2 className="font-serif text-3xl font-semibold tracking-tight">{companion.name}{companion.age ? `, ${companion.age}` : ""}</h2>
          <p className="mt-1.5 line-clamp-1 text-sm text-white/70">{companion.title}</p>
        </div>
      </div>

      <div className="space-y-5 p-5 pt-4">
        <div className="grid grid-cols-2 gap-2 text-xs text-[#C8C8CE]">
          <p className="flex min-w-0 items-center gap-2 rounded-xl bg-white/[0.035] px-3 py-2.5"><MapPin className="size-3.5 shrink-0 text-[#E15A73]" /><span className="truncate">{companion.background?.location || "Not available"}</span></p>
          <p className="flex min-w-0 items-center gap-2 rounded-xl bg-white/[0.035] px-3 py-2.5"><BriefcaseBusiness className="size-3.5 shrink-0 text-[#E15A73]" /><span className="truncate">{companion.background?.occupation || "Not available"}</span></p>
        </div>

        {companion.personality?.about && <p className="line-clamp-3 text-sm leading-6 text-[#A7A7AF]">{companion.personality.about}</p>}

        <div>
          <p className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E86981]"><MessageCircleHeart className="size-4" /> Personality</p>
          <div className="flex flex-wrap gap-2">
            {(companion.personality?.traits ?? []).slice(0, 4).map((trait) => <span key={trait} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] text-[#D7D7DC]">{trait}</span>)}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8F8F98]">Top interests</p>
          <div className="flex flex-wrap gap-2">
            {companion.interests.slice(0, 4).map((interest) => <span key={interest} className="rounded-lg border border-[#C83B55]/15 bg-[#C83B55]/10 px-2.5 py-1.5 text-[11px] text-[#F08CB0]">{interest}</span>)}
            {companion.interests.length > 4 && <span className="rounded-md bg-[#25262C] px-2.5 py-1 text-xs text-[#A7A7AF]">+{companion.interests.length - 4}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 text-[11px] text-[#8F8F98]">
          <span className="flex items-center gap-2 capitalize"><span className="flex size-7 items-center justify-center rounded-lg bg-[#C83B55]/10"><Mic2 className="size-3.5 text-[#E86981]" /></span>{companion.voice?.provider || "No voice"}</span>
          <span>{companion.communicationStyle?.styleTraits?.length ?? 0} communication traits</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CompanionDetailsModal companionId={companion.id} companionName={companion.name} />
          <EditCompanionModal companion={companion} />
          <div className="col-span-2">
            <LifestyleManagerModal companionId={companion.id} companionName={companion.name} />
          </div>
          <div className="col-span-2">
            <PublishingManagerModal companionId={companion.id} companionName={companion.name} />
          </div>
        </div>
      </div>
    </article>
  );
}
