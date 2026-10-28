import { NewlyJoinedTable } from "@/components/home/NewlyJoinedTable";
import { RevenueChart } from "@/components/home/RevenueChart";
import { StatsCards } from "@/components/home/StatsCards";

export function HomeDashboard() {
  return (
    <main className="space-y-5">
      <StatsCards />
      <RevenueChart />
      <NewlyJoinedTable />
    </main>
  );
}
