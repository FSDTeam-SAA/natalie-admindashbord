import { StatsCards } from "@/components/home/StatsCards";

import { UsersTable } from "./_components/UsersTable";

const userStats = [
  { label: "Total Users", value: "12,480", change: "+8.4% this month" },
  { label: "Active Users", value: "12,480", change: "+8.4% this month" },
  { label: "Premium Users", value: "12,480", change: "+8.4% this month" },
  { label: "Free Users", value: "12,480", change: "+8.4% this month" },
];

const page = () => {
  return (
    <main className="space-y-4">
      <StatsCards stats={userStats} />
      <UsersTable />
    </main>
  );
};

export default page;
