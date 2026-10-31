"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteJson, postFormData, putFormData, putJson } from "@/lib/api";
import type { Companion } from "./CompanionCard";

type UpdateCompanionPayload = Omit<Companion, "id" | "age" | "version"> & {
  age?: number;
  version?: number;
};
const inputClass =
  "h-11 w-full rounded-lg border border-[#41424A] bg-[#15161A] px-3 text-sm text-white outline-none placeholder:text-[#70717A] focus:border-[#C83B55]";
const textareaClass =
  "min-h-24 w-full resize-y rounded-lg border border-[#41424A] bg-[#15161A] px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-[#70717A] focus:border-[#C83B55]";
const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/"))
      return reject(new Error("Please select a valid image file."));
    if (file.size > 5 * 1024 * 1024)
      return reject(new Error("Each image must be smaller than 5 MB."));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

export function EditCompanionModal({ companion }: { companion: Companion }) {
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(
    companion.profileImage ?? "",
  );
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState(companion.coverImage ?? "");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState(companion.galleryImages);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [voiceId, setVoiceId] = useState(companion.voice.voiceId ?? "");
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setProfileImage(companion.profileImage ?? "");
    setProfileImageFile(null);
    setCoverImage(companion.coverImage ?? "");
    setCoverImageFile(null);
    setGalleryImages(companion.galleryImages);
    setGalleryImageFiles([]);
    setVoiceId(companion.voice.voiceId ?? "");
  }, [
    open,
    companion.coverImage,
    companion.galleryImages,
    companion.profileImage,
    companion.voice.voiceId,
  ]);
  const profileImageMutation = useMutation({
    mutationFn: () => {
      if (!session?.accessToken)
        throw new Error("Your session has expired. Please sign in again.");
      if (!profileImageFile)
        throw new Error("Please select a profile image first.");
      const formData = new FormData();
      formData.append("profileImage", profileImageFile);
      return putFormData<Companion>(
        `/api/v1/companions/${companion.id}/profile-image`,
        formData,
        session.accessToken,
      );
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Profile image updated successfully");
      setProfileImageFile(null);
      if (response.data?.profileImage)
        setProfileImage(response.data.profileImage);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companions"] }),
        queryClient.invalidateQueries({
          queryKey: ["companion", companion.id],
        }),
      ]);
    },
    onError: (error) =>
      toast.error("Unable to update profile image", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      }),
  });

  const coverImageMutation = useMutation({
    mutationFn: () => {
      if (!session?.accessToken)
        throw new Error("Your session has expired. Please sign in again.");
      if (!coverImageFile)
        throw new Error("Please select a cover image first.");
      const formData = new FormData();
      formData.append("coverImage", coverImageFile);
      return putFormData<Companion>(
        `/api/v1/companions/${companion.id}/cover-image`,
        formData,
        session.accessToken,
      );
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Cover image updated successfully");
      setCoverImageFile(null);
      if (response.data?.coverImage) setCoverImage(response.data.coverImage);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companions"] }),
        queryClient.invalidateQueries({
          queryKey: ["companion", companion.id],
        }),
      ]);
    },
    onError: (error) =>
      toast.error("Unable to update cover image", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      }),
  });

  const galleryImagesMutation = useMutation({
    mutationFn: () => {
      if (!session?.accessToken)
        throw new Error("Your session has expired. Please sign in again.");
      if (!galleryImageFiles.length)
        throw new Error("Please select at least one gallery image first.");

      const formData = new FormData();
      galleryImageFiles.forEach((file) =>
        formData.append("galleryImages", file),
      );

      return postFormData<Companion>(
        `/api/v1/companions/${companion.id}/gallery`,
        formData,
        session.accessToken,
      );
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Gallery images updated successfully");
      const existingImages = galleryImages.slice(
        0,
        galleryImages.length - galleryImageFiles.length,
      );
      setGalleryImageFiles([]);
      if (response.data?.galleryImages) {
        setGalleryImages(response.data.galleryImages);
      } else {
        setGalleryImages(existingImages);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companions"] }),
        queryClient.invalidateQueries({
          queryKey: ["companion", companion.id],
        }),
      ]);
    },
    onError: (error) =>
      toast.error("Unable to update gallery images", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      }),
  });

  const deleteGalleryImageMutation = useMutation({
    mutationFn: (imageUrl: string) => {
      if (!session?.accessToken)
        throw new Error("Your session has expired. Please sign in again.");

      return deleteJson<Companion>(
        `/api/v1/companions/${companion.id}/gallery?url=${encodeURIComponent(imageUrl)}`,
        session.accessToken,
      );
    },
    onSuccess: async (response, deletedImageUrl) => {
      setGalleryImages((currentImages) =>
        response.data?.galleryImages ??
        currentImages.filter((image) => image !== deletedImageUrl),
      );
      toast.success(response.message || "Gallery image deleted successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companions"] }),
        queryClient.invalidateQueries({
          queryKey: ["companion", companion.id],
        }),
      ]);
    },
    onError: (error) =>
      toast.error("Unable to delete gallery image", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      }),
  });

  const mutation = useMutation({
    mutationFn: (payload: UpdateCompanionPayload) => {
      if (!session?.accessToken)
        throw new Error("Your session has expired. Please sign in again.");
      return putJson<Companion, UpdateCompanionPayload>(
        `/api/v1/companions/${companion.id}`,
        payload,
        session.accessToken,
      );
    },
    onSuccess: async (response) => {
      toast.success(response.message || "Companion updated successfully");
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companions"] }),
        queryClient.invalidateQueries({
          queryKey: ["companion", companion.id],
        }),
      ]);
    },
    onError: (error) =>
      toast.error("Unable to update companion", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      }),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const age = String(form.get("age") ?? "").trim();
    const version = String(form.get("version") ?? "").trim();
    const payload: UpdateCompanionPayload = {
      name: String(form.get("name")).trim(),
      version: version ? Number(version) : undefined,
      title: String(form.get("title")).trim(),
      age: age ? Number(age) : undefined,
      backstory: String(form.get("backstory")).trim(),
      voiceDescription: lines(form.get("voiceDescription")),
      profileImage: profileImageFile
        ? companion.profileImage
        : profileImage || null,
      coverImage: coverImageFile ? companion.coverImage : coverImage || null,
      galleryImages: galleryImages.slice(
        0,
        galleryImages.length - galleryImageFiles.length,
      ),
      status: form.get("status") === "on",
      interests: lines(form.get("interests")),
      personality: {
        traits: lines(form.get("personalityTraits")),
        about: String(form.get("personalityAbout")).trim(),
        essence: String(form.get("personalityEssence")).trim(),
        sharedTraits: lines(form.get("sharedTraits")),
      },
      communicationStyle: {
        styleTraits: lines(form.get("styleTraits")),
        topicsSheEnjoys: String(form.get("topicsSheEnjoys")).trim(),
        whatYouExperience: lines(form.get("whatYouExperience")),
      },
      background: {
        location: String(form.get("location")).trim(),
        occupation: String(form.get("occupation")).trim(),
        lifestyle: lines(form.get("lifestyle")),
      },
      visualProfile: {
        aestheticKeywords: lines(form.get("aestheticKeywords")),
        note: String(form.get("visualNote")).trim(),
        referenceImages: lines(form.get("referenceImages")),
        physicalIdentity: String(form.get("physicalIdentity")).trim(),
        generationInstructions: String(
          form.get("generationInstructions"),
        ).trim(),
      },
      voice: {
        provider: String(form.get("voiceProvider")).trim(),
        voiceId: voiceId.trim() || null,
        settings: {
          stability: Number(form.get("stability")),
          similarityBoost: Number(form.get("similarityBoost")),
          style: Number(form.get("voiceStyle")),
          useSpeakerBoost: form.get("useSpeakerBoost") === "on",
          speed: Number(form.get("speed")),
        },
      },
    };
    mutation.mutate(payload);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !mutation.isPending && setOpen(next)}
    >
      <DialogTrigger className="h-10 w-full rounded-lg bg-[#C83B55] text-sm font-semibold text-white transition hover:bg-[#DF4965]">
        Edit
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-sm"
        className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] !max-w-[1200px] gap-0 overflow-y-auto rounded-2xl border border-[#303139] bg-[#191A1F] p-0 text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="sticky top-0 z-30 flex items-start justify-between border-b border-[#303139] bg-[#191A1F]/95 px-6 py-5 backdrop-blur-md">
          <div>
            <DialogDescription className="text-xs font-semibold uppercase tracking-wider text-[#C83B55]">
              Editing Companion
            </DialogDescription>
            <DialogTitle className="mt-1 text-2xl">
              {companion.name}
            </DialogTitle>
          </div>
          <DialogClose
            disabled={mutation.isPending}
            className="flex size-10 items-center justify-center rounded-xl border border-[#3C3D45] text-[#A5A5AE]"
          >
            <X className="size-5" />
          </DialogClose>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            <Group title="Images">
              <div className="grid gap-4 md:grid-cols-2">
                <SingleImagePicker
                  label="Profile image"
                  value={profileImage}
                  onChange={setProfileImage}
                  onFileSelect={setProfileImageFile}
                  onUpload={() => profileImageMutation.mutate()}
                  isUploading={profileImageMutation.isPending}
                  canUpload={Boolean(profileImageFile)}
                />
                <SingleImagePicker
                  label="Cover image"
                  value={coverImage}
                  onChange={setCoverImage}
                  onFileSelect={setCoverImageFile}
                  onUpload={() => coverImageMutation.mutate()}
                  isUploading={coverImageMutation.isPending}
                  canUpload={Boolean(coverImageFile)}
                  uploadLabel="Update Cover Image"
                />
              </div>
              <GalleryPicker
                images={galleryImages}
                onChange={setGalleryImages}
                selectedFiles={galleryImageFiles}
                onFilesChange={setGalleryImageFiles}
                onUpload={() => galleryImagesMutation.mutate()}
                isUploading={galleryImagesMutation.isPending}
                onDelete={(imageUrl) =>
                  deleteGalleryImageMutation.mutate(imageUrl)
                }
                deletingImage={
                  deleteGalleryImageMutation.isPending
                    ? deleteGalleryImageMutation.variables
                    : null
                }
              />
            </Group>
            <Group title="Basic information">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  name="name"
                  label="Name"
                  value={companion.name}
                  required
                />
                <Field
                  name="title"
                  label="Title"
                  value={companion.title}
                  required
                />
                <Field
                  name="version"
                  label="Version"
                  value={companion.version}
                  type="number"
                  min="1"
                />
                <Field
                  name="age"
                  label="Age"
                  value={companion.age ?? ""}
                  type="number"
                  min="18"
                />
              </div>
              <Area
                name="backstory"
                label="Backstory"
                value={companion.backstory ?? ""}
              />
              <Area
                name="voiceDescription"
                label="Voice descriptions (one per line)"
                value={companion.voiceDescription.join("\n")}
              />
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#41424A] bg-[#15161A] px-4 py-3 text-sm">
                <input
                  name="status"
                  type="checkbox"
                  defaultChecked={companion.status}
                  className="size-4 accent-[#C83B55]"
                />{" "}
                Active companion
              </label>
            </Group>
            <Group title="Personality & interests">
              <Area
                name="interests"
                label="Interests (one per line)"
                value={companion.interests.join("\n")}
              />
              <Area
                name="personalityTraits"
                label="Personality traits (one per line)"
                value={companion.personality.traits.join("\n")}
              />
              <Area
                name="personalityAbout"
                label="About"
                value={companion.personality.about}
                required
              />
              <Area
                name="personalityEssence"
                label="Essence"
                value={companion.personality.essence}
                required
              />
              <Area
                name="sharedTraits"
                label="Shared traits (one per line)"
                value={companion.personality.sharedTraits.join("\n")}
              />
            </Group>
            <Group title="Communication style">
              <Area
                name="styleTraits"
                label="Style traits (one per line)"
                value={companion.communicationStyle.styleTraits.join("\n")}
              />
              <Area
                name="topicsSheEnjoys"
                label="Topics she enjoys"
                value={companion.communicationStyle.topicsSheEnjoys}
                required
              />
              <Area
                name="whatYouExperience"
                label="What users experience (one per line)"
                value={companion.communicationStyle.whatYouExperience.join(
                  "\n",
                )}
              />
            </Group>
            <Group title="Background">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  name="location"
                  label="Location"
                  value={companion.background.location}
                  required
                />
                <Field
                  name="occupation"
                  label="Occupation"
                  value={companion.background.occupation}
                  required
                />
              </div>
              <Area
                name="lifestyle"
                label="Lifestyle (one per line)"
                value={companion.background.lifestyle.join("\n")}
              />
            </Group>
            <Group title="Visual profile">
              <Area
                name="aestheticKeywords"
                label="Aesthetic keywords (one per line)"
                value={companion.visualProfile.aestheticKeywords.join("\n")}
              />
              <Area
                name="visualNote"
                label="Visual note"
                value={companion.visualProfile.note ?? ""}
              />
              <Area
                name="referenceImages"
                label="Reference image URLs (one per line)"
                value={companion.visualProfile.referenceImages.join("\n")}
              />
              <Field
                name="physicalIdentity"
                label="Physical identity"
                value={companion.visualProfile.physicalIdentity ?? ""}
              />
              <Area
                name="generationInstructions"
                label="Generation instructions"
                value={companion.visualProfile.generationInstructions ?? ""}
              />
            </Group>
            <Group title="Voice">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  name="voiceProvider"
                  label="Provider"
                  value={companion.voice.provider}
                  required
                />
                <label className="block text-xs text-[#A7A7AF]">
                  Voice ID
                  <Input
                    name="voiceId"
                    value={voiceId}
                    onChange={(event) => setVoiceId(event.target.value)}
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
                <Field
                  name="stability"
                  label="Stability"
                  value={companion.voice.settings.stability}
                  type="number"
                  step="0.01"
                />
                <Field
                  name="similarityBoost"
                  label="Similarity boost"
                  value={companion.voice.settings.similarityBoost}
                  type="number"
                  step="0.01"
                />
                <Field
                  name="voiceStyle"
                  label="Style"
                  value={companion.voice.settings.style}
                  type="number"
                  step="0.01"
                />
                <Field
                  name="speed"
                  label="Speed"
                  value={companion.voice.settings.speed}
                  type="number"
                  step="0.01"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="useSpeakerBoost"
                  type="checkbox"
                  defaultChecked={companion.voice.settings.useSpeakerBoost}
                  className="accent-[#C83B55]"
                />{" "}
                Use speaker boost
              </label>
            </Group>
          </div>
          <div className="sticky bottom-0 border-t border-[#303139] bg-[#191A1F]/95 px-6 py-5 backdrop-blur-md">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C83B55] font-semibold text-white hover:bg-[#DF4965] disabled:opacity-60"
            >
              {mutation.isPending && (
                <Loader2 className="size-5 animate-spin" />
              )}
              {mutation.isPending ? "Updating..." : "Update Companion"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-[#303139] bg-[#1D1E23] p-5">
      <legend className="px-2 text-lg font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
function Field({
  name,
  label,
  value,
  type = "text",
  step,
  min,
  required,
}: {
  name: string;
  label: string;
  value: string | number;
  type?: string;
  step?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs text-[#A7A7AF]">
      {label}
      <Input
        name={name}
        type={type}
        step={step}
        min={min}
        required={required}
        defaultValue={value}
        className={`${inputClass} mt-1.5`}
      />
    </label>
  );
}
function Area({
  name,
  label,
  value,
  required,
}: {
  name: string;
  label: string;
  value: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs text-[#A7A7AF]">
      {label}
      <Textarea
        name={name}
        defaultValue={value}
        required={required}
        className={`${textareaClass} mt-1.5`}
      />
    </label>
  );
}

function SingleImagePicker({
  label,
  value,
  onChange,
  onFileSelect,
  onUpload,
  isUploading = false,
  canUpload = false,
  uploadLabel = "Update Profile Image",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFileSelect?: (file: File | null) => void;
  onUpload?: () => void;
  isUploading?: boolean;
  canUpload?: boolean;
  uploadLabel?: string;
}) {
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      onChange(await readImage(file));
      onFileSelect?.(file);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load image.",
      );
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-white">{label}</p>
      <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#4A4B54] bg-[#15161A]">
        {value ? (
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${JSON.stringify(value)})` }}
          />
        ) : (
          <div className="text-center text-[#777780]">
            <ImagePlus className="mx-auto mb-2 size-8" />
            <p className="text-xs">No image selected</p>
          </div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#C83B55] text-xs font-semibold text-[#F06A83] transition hover:bg-[#C83B55] hover:text-white">
          <ImagePlus className="size-4" />
          {value ? "Replace" : "Select image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="sr-only"
          />
        </label>
        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            disabled={!canUpload || isUploading}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#C83B55] px-2 text-xs font-semibold text-white transition hover:bg-[#DF4965] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isUploading && <Loader2 className="size-4 animate-spin" />}
            {isUploading ? "Updating..." : uploadLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function GalleryPicker({
  images,
  onChange,
  selectedFiles,
  onFilesChange,
  onUpload,
  isUploading,
  onDelete,
  deletingImage,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  selectedFiles: File[];
  onFilesChange: (files: File[]) => void;
  onUpload: () => void;
  isUploading: boolean;
  onDelete: (imageUrl: string) => void;
  deletingImage: string | null;
}) {
  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    try {
      const previews = await Promise.all(files.map(readImage));
      onChange([...images, ...previews]);
      onFilesChange([...selectedFiles, ...files]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load gallery images.",
      );
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Gallery images</p>
          <p className="mt-1 text-xs text-[#777780]">
            Select multiple images, maximum 5 MB each.
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#C83B55] px-3 text-xs font-semibold text-[#F06A83]">
            <ImagePlus className="size-4" />
            Add images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="sr-only"
            />
          </label>
          <button
            type="button"
            onClick={onUpload}
            disabled={!selectedFiles.length || isUploading}
            className="flex h-9 items-center gap-2 rounded-lg bg-[#C83B55] px-3 text-xs font-semibold text-white transition hover:bg-[#DF4965] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isUploading && <Loader2 className="size-4 animate-spin" />}
            {isUploading ? "Updating..." : "Update Gallery"}
          </button>
        </div>
      </div>
      {images.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image.slice(0, 40)}-${index}`}
              className="group/image relative h-44 overflow-hidden rounded-xl border border-[#34353D] bg-[#15161A]"
            >
              <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${JSON.stringify(image)})` }}
              />
              <button
                type="button"
                onClick={() => {
                  const selectedStartIndex =
                    images.length - selectedFiles.length;
                  if (index >= selectedStartIndex) {
                    onChange(
                      images.filter((_, itemIndex) => itemIndex !== index),
                    );
                    onFilesChange(
                      selectedFiles.filter(
                        (_, fileIndex) =>
                          fileIndex !== index - selectedStartIndex,
                      ),
                    );
                  } else {
                    onDelete(image);
                  }
                }}
                disabled={deletingImage !== null}
                className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full border border-red-400/70 bg-red-600 text-white shadow-lg opacity-0 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 group-hover/image:opacity-100 focus-visible:opacity-100"
                aria-label={`Delete gallery image ${index + 1}`}
              >
                {deletingImage === image ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#41424A] py-8 text-center text-xs text-[#777780]">
          No gallery images selected.
        </div>
      )}
    </div>
  );
}
