export function SubscriptionPlansSkeleton() {
  return (
    <section
      className="mt-10 grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading subscription plans"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <article
          key={index}
          className="flex min-h-[650px] flex-col rounded-lg border border-white/10 bg-[#19191f] px-7 pb-7 pt-8"
        >
          <div className="h-3 w-20 rounded bg-[#292A30]" />
          <div className="mt-5 h-8 w-36 rounded bg-[#292A30]" />
          <div className="mt-5 flex items-end gap-2">
            <div className="h-9 w-24 rounded bg-[#292A30]" />
            <div className="h-4 w-16 rounded bg-[#292A30]" />
          </div>
          <div className="mt-[50px] space-y-4">
            {Array.from({ length: index === 0 ? 5 : 8 }).map((_, featureIndex) => (
              <div key={featureIndex} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#292A30]" />
                <div className={`h-4 rounded bg-[#292A30] ${featureIndex % 2 === 0 ? "w-4/5" : "w-3/5"}`} />
              </div>
            ))}
          </div>
          <div className="mt-auto h-12 w-full rounded bg-[#292A30]" />
        </article>
      ))}
    </section>
  );
}
