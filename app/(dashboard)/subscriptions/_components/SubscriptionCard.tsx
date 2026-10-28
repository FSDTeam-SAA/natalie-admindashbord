import Image from "next/image";
import { Check } from "lucide-react";

export type SubscriptionPlan = {
  eyebrow: string;
  name: string;
  price: string;
  priceSuffix: string;
  features: string[];
  badge?: string;
  variant: "free" | "premium" | "vip";
};

type SubscriptionCardProps = {
  plan: SubscriptionPlan;
};

export function SubscriptionCard({ plan }: SubscriptionCardProps) {
  const isVip = plan.variant === "vip";
  const isPremium = plan.variant === "premium";

  return (
    <article
      className={`relative flex min-h-[650px] flex-col overflow-visible rounded-lg border bg-[#19191f] text-white transition-transform duration-300 hover:-translate-y-2 ${
        isPremium
          ? "border-[#C2384F] shadow-[0_0_0_1px_rgba(194,56,79,0.85)]"
          : "border-white/10"
      }`}
    >
      {isPremium && (
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background:
              "linear-gradient(251.66deg, rgba(0, 0, 0, 0) 30.37%, #000000 54.42%, #000000 94.48%)",
          }}
        />
      )}

      {isVip && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <Image
            src="/auth.png"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #000000 0%, #000000 22%, rgba(0, 0, 0, 0.22) 58%, rgba(0, 0, 0, 0) 100%)",
            }}
          />
        </div>
      )}

      {plan.badge && (
        <span className="absolute left-1/2 top-[-24px] z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#C2384F] px-7 py-3 font-serif text-lg leading-5 text-white shadow-[0_8px_22px_rgba(194,56,79,0.35)]">
          {plan.badge}
        </span>
      )}

      <div className="relative z-10 flex h-full flex-1 flex-col overflow-hidden rounded-lg px-7 pb-7 pt-8">
        <p className="text-xs text-[#C2384F]">{plan.eyebrow}</p>
        <h2 className="mt-5 font-serif text-2xl font-semibold text-white sm:text-[28px]">
          {plan.name}
        </h2>

        <div className="mt-5 flex items-end gap-1">
          <span className="text-[32px] font-semibold leading-none text-white">
            {plan.price}
          </span>
          <span className="pb-1 text-sm text-white/55">{plan.priceSuffix}</span>
        </div>

        <ul className="mt-[50px] space-y-4 text-base leading-5 text-[#FAFAFA]">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <Check className="mt-1 h-3 w-3 shrink-0 text-[#C2384F]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={`mt-auto inline-flex h-12 w-full items-center justify-center rounded-[3px] border border-[#C2384F] px-5 text-base font-medium text-white transition-colors ${
            plan.variant === "free"
              ? "hover:bg-[#C2384F]"
              : "bg-[#C2384F] hover:bg-[#df4567]"
          }`}
        >
          Edit Plan
        </button>
      </div>
    </article>
  );
}
