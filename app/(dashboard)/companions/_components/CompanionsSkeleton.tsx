export function CompanionsSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Loading companions">
      <section className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#191A1F] p-4">
            <div className="size-11 rounded-xl bg-[#292A30]" />
            <div className="space-y-2"><div className="h-5 w-10 rounded bg-[#292A30]" /><div className="h-3 w-24 rounded bg-[#292A30]" /></div>
          </div>
        ))}
      </section>
      <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <article key={index} className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#191A1F]">
            <div className="h-72 bg-[#292A30]" />
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-2"><div className="h-9 rounded-xl bg-[#292A30]" /><div className="h-9 rounded-xl bg-[#292A30]" /></div>
              <div className="space-y-2"><div className="h-4 w-full rounded bg-[#292A30]" /><div className="h-4 w-5/6 rounded bg-[#292A30]" /></div>
              <div className="flex gap-2">{Array.from({ length: 4 }).map((_, item) => <div key={item} className="h-7 w-16 rounded-full bg-[#292A30]" />)}</div>
              <div className="h-10 border-t border-[#303139]" />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
