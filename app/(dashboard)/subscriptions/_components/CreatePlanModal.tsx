"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const fieldClassName =
  "h-12 w-full rounded-lg border border-[#44444B] bg-[#19191C] px-4 text-sm text-white outline-none transition placeholder:text-[#777780] focus:border-[#C2384F]";

export function CreatePlanModal() {
  const [open, setOpen] = useState(false);
  const [features, setFeatures] = useState(["", ""]);

  const addFeature = () => setFeatures((current) => [...current, ""]);

  const updateFeature = (index: number, value: string) => {
    setFeatures((current) =>
      current.map((feature, featureIndex) =>
        featureIndex === index ? value : feature,
      ),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);
    setFeatures(["", ""]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="shrink-0 rounded-full bg-[#C2384F] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#D1455E] sm:text-sm"
      >
        Create Plan
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/75 backdrop-blur-[6px]"
        className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[379px] gap-0 overflow-y-auto rounded-[16px] border-0 bg-[#1E1E22] p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-0"
      >
        <div className="flex min-h-[89px] items-start justify-between border-b border-[#34343A] px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.13em] text-[#EC4B6A]">
              Creating Plan
            </p>
            <DialogTitle className="text-[18px] font-medium leading-none text-white">
              New Subscription
            </DialogTitle>
          </div>

          <DialogClose
            render={
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-xl border border-[#3C3C42] text-[#A5A5AE] transition hover:border-[#C2384F] hover:text-white"
                aria-label="Close create plan modal"
              />
            }
          >
            <X className="size-5" />
          </DialogClose>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 px-6 py-6">
            <DialogDescription className="mb-[13px] text-sm leading-6 text-[#A4A4AC]">
              Create the plan members see at checkout. The plan will be
              available for new subscriptions.
            </DialogDescription>

            <div>
              <label htmlFor="plan-name" className="sr-only">
                Plan name
              </label>
              <input
                id="plan-name"
                name="name"
                required
                placeholder="VIP"
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="plan-price" className="sr-only">
                Monthly price
              </label>
              <input
                id="plan-price"
                name="price"
                required
                inputMode="decimal"
                placeholder="$24"
                className={fieldClassName}
              />
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-white">
                Features
              </legend>

              <div className="space-y-3">
                <label htmlFor="plan-feature-summary" className="sr-only">
                  Feature summary
                </label>
                <textarea
                  id="plan-feature-summary"
                  name="featureSummary"
                  rows={3}
                  placeholder={"All companion connections\nUnlimited conversations\nEnhanced personal moments"}
                  className="h-[99px] w-full resize-none rounded-lg border border-[#44444B] bg-[#19191C] px-4 py-2.5 text-sm leading-[19px] text-white outline-none transition placeholder:text-[#777780] focus:border-[#C2384F]"
                />

                {features.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <label htmlFor={`plan-feature-${index}`} className="sr-only">
                      Feature {index + 1}
                    </label>
                    <input
                      id={`plan-feature-${index}`}
                      name="features"
                      value={feature}
                      onChange={(event) =>
                        updateFeature(index, event.target.value)
                      }
                      placeholder={
                        index === 0
                          ? "Voice messages"
                          : "5,000 messages per month"
                      }
                      className={fieldClassName}
                    />

                    {index === 0 && (
                      <button
                        type="button"
                        onClick={addFeature}
                        className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-white text-white transition hover:border-[#C2384F] hover:bg-[#C2384F]"
                        aria-label="Add another feature"
                      >
                        <Plus className="size-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-3 border-t border-[#34343A] px-6 py-5">
            <button
              type="submit"
              className="h-12 w-full rounded-full bg-[#CF3B57] text-base font-medium text-white transition-colors hover:bg-[#DF4965]"
            >
              Create Plan
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
