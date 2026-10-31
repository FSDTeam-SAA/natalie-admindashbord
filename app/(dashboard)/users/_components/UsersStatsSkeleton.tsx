export function UsersStatsSkeleton() {
  return (
    <section
      className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Loading user statistics"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          key={index}
          className="min-h-[106px] rounded-md border border-[#2A2B31] bg-[#1A1B20] px-5 py-4 shadow-[0_2px_0_rgba(255,255,255,0.08)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="h-4 w-24 rounded bg-[#292A30]" />
            <div className="h-5 w-5 rounded bg-[#292A30]" />
          </div>
          <div className="mt-4 h-6 w-20 rounded bg-[#292A30]" />
          <div className="mt-3 h-3 w-28 rounded bg-[#292A30]" />
        </article>
      ))}
    </section>
  );
}
