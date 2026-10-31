import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type NewlyJoinedUser = { id: string; name: string; email: string; profileImage: string | null; isSubscribed: boolean; createdAt: string };

function formatJoinedDate(date: string) {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(parsedDate);
}

export function NewlyJoinedTable({ users }: { users: NewlyJoinedUser[] }) {
  return (
    <section className="rounded-md border border-[#2A2B31] bg-[#1A1B20] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Newly Joined</h2>
        <Link href="/users" className="flex h-8 items-center rounded border border-[#C83B55] px-6 text-sm font-semibold text-[#C83B55] transition-colors hover:bg-[#C83B55] hover:text-white">View All</Link>
      </div>
      <div className="overflow-hidden rounded-md border border-[#303139]">
        <Table>
          <TableHeader className="bg-[#111216]"><TableRow className="border-[#303139] hover:bg-transparent">
            {["Customer", "Email", "Plan", "Joined"].map((head) => <TableHead key={head} className="text-xs font-semibold uppercase text-white">{head}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {users.length === 0 ? <TableRow className="border-[#303139] bg-[#1C1D22] hover:bg-[#1C1D22]"><TableCell colSpan={4} className="h-28 text-center text-[#A6A6AF]">No users found.</TableCell></TableRow> : users.map((user) => {
              const initials = (user.name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
              const plan = user.isSubscribed ? "Premium" : "Free";
              return (
                <TableRow key={user.id} className="border-[#303139] bg-[#1C1D22] hover:bg-[#22232A]">
                  <TableCell className="min-w-[220px] text-white"><div className="flex items-center gap-3">
                    <Avatar className="size-9 bg-[#D9D9D9]">{user.profileImage && <AvatarImage src={user.profileImage} alt={user.name} />}<AvatarFallback className="bg-[#D9D9D9] text-sm font-semibold text-[#222]">{initials}</AvatarFallback></Avatar>
                    <span>{user.name || "Unknown user"}</span>
                  </div></TableCell>
                  <TableCell className="min-w-[240px] text-[#E6E6EB]">{user.email}</TableCell>
                  <TableCell><span className={`inline-flex min-w-[72px] justify-center rounded-lg px-3 py-1.5 text-sm ${user.isSubscribed ? "bg-[#351D2B] text-[#F08CB0]" : "bg-[#242A33] text-[#B7C0CC]"}`}>{plan}</span></TableCell>
                  <TableCell className="min-w-[150px] text-[#E6E6EB]">{formatJoinedDate(user.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
