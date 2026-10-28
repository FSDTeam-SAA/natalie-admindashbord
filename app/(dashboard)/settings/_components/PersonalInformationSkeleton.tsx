export function PersonalInformationSkeleton() {
  return (
    <section
      className="animate-pulse rounded-lg border border-[#303139] bg-[#1A1B20] p-5"
      aria-label="Loading personal information"
    >
      <div className="mb-7 flex items-center justify-between gap-4">
        <div className="h-8 w-56 rounded-md bg-[#292A30]" />
        <div className="h-11 w-28 rounded-lg bg-[#292A30]" />
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 h-5 w-24 rounded bg-[#292A30]" />
          <div className="h-[54px] w-full rounded-md border border-[#34353D] bg-[#202126]" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-2 h-5 w-32 rounded bg-[#292A30]" />
            <div className="h-[54px] w-full rounded-md border border-[#34353D] bg-[#202126]" />
          </div>
          <div>
            <div className="mb-2 h-5 w-16 rounded bg-[#292A30]" />
            <div className="h-[54px] w-full rounded-md border border-[#34353D] bg-[#202126]" />
          </div>
        </div>
      </div>
    </section>
  );
}
