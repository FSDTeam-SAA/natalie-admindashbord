import { UsersTable } from "./_components/UsersTable";
import { UsersOverviewCards } from "./_components/UsersOverviewCards";

const page = () => {
  return (
    <main className="space-y-4">
      <UsersOverviewCards />
      <UsersTable />
    </main>
  );
};

export default page;
