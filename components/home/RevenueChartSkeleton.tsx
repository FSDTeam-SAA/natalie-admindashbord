export function RevenueChartSkeleton() {
  return (
    <section className="h-[364px] animate-pulse rounded-md border border-[#2A2B31] bg-[#1A1B20] p-5" aria-label="Loading revenue overview">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 rounded bg-[#292A30]" />
        <div className="h-10 w-32 rounded-md bg-[#292A30]" />
      </div>
      <div className="mt-10 h-8 w-44 rounded bg-[#292A30]" />
      <div className="mt-8 h-[190px] w-full rounded bg-gradient-to-b from-[#3A2028] to-[#202126]" />
    </section>
  );
}
