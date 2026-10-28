import { UsersRound } from "lucide-react";

type StatCard = {
  label: string;
  value: string;
  change: string;
};

const defaultStats: StatCard[] = [
  { label: "Total Users", value: "12,480", change: "+8.4% this month" },
  { label: "Total Users", value: "12,480", change: "+8.4% this month" },
  { label: "Total Users", value: "12,480", change: "+8.4% this month" },
  { label: "Total Users", value: "12,480", change: "+8.4% this month" },
];

export function StatsCards({ stats = defaultStats }: { stats?: StatCard[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <article
          key={`${stat.label}-${index}`}
          className="min-h-[106px] rounded-md border border-[#2A2B31] bg-[#1A1B20] px-5 py-4 shadow-[0_2px_0_rgba(255,255,255,0.08)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-[#9A9AA2]">{stat.label}</p>
            <UsersRound className="h-5 w-5 text-[#D23B5B]" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-none text-white">
            {stat.value}
          </h2>
          <p className="mt-3 text-xs text-[#D85A74]">{stat.change}</p>
        </article>
      ))}
    </section>
  );
}
