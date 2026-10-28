import { SubscriptionCard, type SubscriptionPlan } from "./_components/SubscriptionCard";
import { CreatePlanModal } from "./_components/CreatePlanModal";

const subscriptionPlans: SubscriptionPlan[] = [
  {
    eyebrow: "Free Trial",
    name: "Introduction",
    price: "Free",
    priceSuffix: "/ 7 days",
    features: [
      "7-day trial access",
      "Up to 50 messages",
      "Limited access to photos and videos",
      "Character personality, lifestyle & story",
      "Experience memory and continuity features",
    ],
    variant: "free",
  },
  {
    eyebrow: "Companion",
    name: "Premium",
    price: "$29",
    priceSuffix: "/ month",
    features: [
      "5,000 messages per month",
      "Photos and videos",
      "Spontaneous messages and check-ins",
      "Romantic and flirtatious conversations",
      "Birthday wishes and milestone recognition",
      "Access to the character's more personal side",
      "Limited access to exclusive private content",
      "Long-term memory and relationship continuity",
      "Up to 2 exclusive intimate photos per week",
    ],
    badge: "Most Popular",
    variant: "premium",
  },
  {
    eyebrow: "Companion",
    name: "VIP",
    price: "$54.99",
    priceSuffix: "/ month",
    features: [
      "10,000 messages per month",
      "Voice messages",
      "More intimate conversations",
      "Exclusive stories & connections",
      "More exclusive photos and videos",
      "More frequent spontaneous interactions",
      "Enhanced memory and relationship depth",
      "Up to 1-3 exclusive intimate photos per day",
    ],
    variant: "vip",
  },
];

export default function SubscriptionsPage() {
  return (
    <main className="mx-auto w-full ">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-xs text-[#8F8F95] sm:text-sm">
          Manage your subscription plans and pricing.
        </p>

        <CreatePlanModal />
      </div>

      <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <SubscriptionCard key={plan.name} plan={plan} />
        ))}
      </section>
    </main>
  );
}
