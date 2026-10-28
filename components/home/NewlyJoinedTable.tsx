import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const customers = [
  {
    name: "Amelia Ross",
    email: "amelia.ross@elysia.com",
    plan: "Free",
    joined: "Aug 02, 2026",
  },
  {
    name: "Amelia Ross",
    email: "amelia.ross@elysia.com",
    plan: "Premium",
    joined: "Today",
  },
  {
    name: "Amelia Ross",
    email: "amelia.ross@elysia.com",
    plan: "VIP",
    joined: "Aug 05, 2026",
  },
  {
    name: "Amelia Ross",
    email: "amelia.ross@elysia.com",
    plan: "Free",
    joined: "Aug 02, 2026",
  },
  {
    name: "Amelia Ross",
    email: "amelia.ross@elysia.com",
    plan: "VIP",
    joined: "Aug 05, 2026",
  },
];

const planStyles = {
  Free: "bg-[#242A33] text-[#B7C0CC]",
  Premium: "bg-[#351D2B] text-[#F08CB0]",
  VIP: "bg-[#35290F] text-[#E0B735]",
};

export function NewlyJoinedTable() {
  return (
    <section className="rounded-md border border-[#2A2B31] bg-[#1A1B20] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Newly Joined</h2>
        <button className="h-8 rounded border border-[#C83B55] px-6 text-sm font-semibold text-[#C83B55] transition-colors hover:bg-[#C83B55] hover:text-white">
          View All
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-[#303139]">
        <Table>
          <TableHeader className="bg-[#111216]">
            <TableRow className="border-[#303139] hover:bg-transparent">
              <TableHead className="pl-20 text-xs font-semibold uppercase text-white">
                Customer
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase text-white">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase text-white">
                Plan
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase text-white">
                Joined
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow
                key={`${customer.email}-${customer.plan}-${index}`}
                className="border-[#303139] bg-[#1C1D22] hover:bg-[#22232A]"
              >
                <TableCell className="min-w-[220px] pl-14 text-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 bg-[#D9D9D9]">
                      <AvatarFallback className="bg-[#D9D9D9] text-sm font-semibold text-[#222]">
                        AR
                      </AvatarFallback>
                    </Avatar>
                    <span>{customer.name}</span>
                  </div>
                </TableCell>
                <TableCell className="min-w-[240px] text-[#E6E6EB]">
                  {customer.email}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex min-w-[64px] items-center justify-center rounded-lg px-3 py-1.5 text-sm",
                      planStyles[customer.plan as keyof typeof planStyles],
                    )}
                  >
                    {customer.plan}
                  </span>
                </TableCell>
                <TableCell className="min-w-[150px] text-[#E6E6EB]">
                  {customer.joined}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
