import {
  Calendar,
  ChevronDown,
  ListFilter,
  Search,
} from "lucide-react";

import { AppPagination } from "@/components/common/AppPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { UserDetailsModal, type UserRow } from "./UserDetailsModal";

const users: UserRow[] = [
  { name: "Amelia Ross", email: "amelia.ross@elysia.com", plan: "Free", joined: "Aug 02, 2026", spent: "$230.00" },
  { name: "Amelia Ross", email: "amelia.ross@elysia.com", plan: "Free", joined: "Aug 02, 2026", spent: "$230.00" },
  { name: "Liam Parker", email: "liam.parker@elysia.com", plan: "Premium", joined: "Jul 15, 2026", spent: "$540.00" },
  { name: "Noah Kim", email: "noah.kim@elysia.com", plan: "Premium", joined: "Aug 19, 2026", spent: "$670.00" },
  { name: "Isabella Clark", email: "isabella.clark@elysia.com", plan: "Basic", joined: "Jul 30, 2026", spent: "$150.00" },
  { name: "Oliver Martinez", email: "oliver.martinez@elysia.com", plan: "Pro", joined: "Sep 22, 2026", spent: "$390.00" },
  { name: "Oliver Martinez", email: "oliver.martinez@elysia.com", plan: "Pro", joined: "Sep 22, 2026", spent: "$390.00" },
  { name: "Sophia Nguyen", email: "sophia.nguyen@elysia.com", plan: "Basic", joined: "Sep 12, 2026", spent: "$120.00" },
];

export function UsersTable() {
  return (
    <section className="space-y-4">
      <div className="rounded-md border border-[#2A2B31] bg-[#1A1B20] p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_140px_140px_170px_auto]">
          <label className="flex h-10 items-center gap-2 rounded-md border border-[#303139] px-3 text-[#9A9AA2]">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#9A9AA2]"
              placeholder="Search by name or email..."
            />
          </label>
          <button className="flex h-10 items-center justify-between rounded-md border border-[#303139] px-3 text-sm text-white">
            All Plans <ChevronDown className="h-4 w-4 text-[#9A9AA2]" />
          </button>
          <button className="flex h-10 items-center justify-between rounded-md border border-[#303139] px-3 text-sm text-white">
            All Status <ChevronDown className="h-4 w-4 text-[#9A9AA2]" />
          </button>
          <button className="flex h-10 items-center gap-2 rounded-md border border-[#303139] px-3 text-sm text-[#9A9AA2]">
            <Calendar className="h-4 w-4" /> Select date range
          </button>
          <button className="flex h-10 items-center gap-2 rounded-md bg-[#C83B55] px-5 text-sm font-semibold text-white">
            <ListFilter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      <div className="rounded-md border border-[#2A2B31] bg-[#1A1B20] p-5">
        <h2 className="mb-5 text-lg font-semibold text-white">Newly Joined</h2>
        <div className="overflow-hidden rounded-md border border-[#303139]">
          <Table>
            <TableHeader className="bg-[#111216]">
              <TableRow className="border-[#303139] hover:bg-transparent">
                {["User", "Email", "Plan", "Joined", "Spent", "Actions"].map((head) => (
                  <TableHead
                    key={head}
                    className="h-10 text-center text-xs font-semibold uppercase text-white"
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow
                  key={`${user.email}-${user.plan}-${index}`}
                  className="h-[54px] border-[#303139] bg-[#1C1D22] hover:bg-[#22232A]"
                >
                  <TableCell className="text-center text-white">{user.name}</TableCell>
                  <TableCell className="text-center text-[#E6E6EB]">{user.email}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex min-w-[64px] justify-center rounded-full bg-[#242A33] px-3 py-1.5 text-sm text-[#B7C0CC]">
                      {user.plan}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-[#E6E6EB]">{user.joined}</TableCell>
                  <TableCell className="text-center text-[#E6E6EB]">{user.spent}</TableCell>
                  <TableCell className="text-center">
                    <UserDetailsModal user={user} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-[#A6A6AF]">
          <p>Showing 1 to 10 of 1,280 results</p>
          <AppPagination currentPage={1} totalPages={28} />
        </div>
      </div>
    </section>
  );
}
