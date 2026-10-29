"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { AppPagination } from "@/components/common/AppPagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getJson } from "@/lib/api";
import { UserDetailsModal, type UserRow } from "./UserDetailsModal";
import { UsersTableSkeleton } from "./UsersTableSkeleton";

type ApiUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  isSubscribed: boolean;
  createdAt: string;
};

const tableHeaders = ["User", "Email", "Plan", "Joined", "Spent", "Actions"];

function formatJoinedDate(date: string) {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(parsedDate);
}

function toUserRow(user: ApiUser): UserRow {
  return {
    name: user.name || "Unknown user",
    email: user.email,
    plan: user.isSubscribed ? "Premium" : "Free",
    joined: formatJoinedDate(user.createdAt),
    spent: "—",
    status: user.status,
    subscriptionDate: user.isSubscribed ? formatJoinedDate(user.createdAt) : "Not subscribed",
  };
}

export function UsersTable() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
    ...(searchTerm ? { searchTerm } : {}),
    ...(role ? { role } : {}),
  }).toString();

  const usersQuery = useQuery({
    queryKey: ["users", page, limit, searchTerm, role, sortBy, sortOrder],
    queryFn: () => getJson<ApiUser[]>(`/api/v1/user?${queryString}`, accessToken),
    enabled: status === "authenticated" && Boolean(accessToken),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoading = status === "loading" || (status === "authenticated" && !accessToken) || usersQuery.isPending;
  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;
  const currentPage = meta?.page ?? page;
  const responseLimit = meta?.limit ?? limit;
  const total = meta?.total ?? users.length;
  const firstResult = total === 0 ? 0 : (currentPage - 1) * responseLimit + 1;
  const lastResult = Math.min(currentPage * responseLimit, total);
  const totalPages = Math.max(1, Math.ceil(total / Math.max(responseLimit, 1)));

  const resetFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setRole("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setLimit(10);
    setPage(1);
  };

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-[#2A2B31] bg-[#1A1B20] p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_130px_150px_130px_110px_auto]">
          <label className="flex h-10 items-center gap-2 rounded-md border border-[#303139] px-3 text-[#9A9AA2]">
            <Search className="h-4 w-4" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#9A9AA2]"
              placeholder="Search by name or email..."
            />
          </label>
          <select
            value={role}
            onChange={(event) => { setRole(event.target.value); setPage(1); }}
            className="h-10 rounded-md border border-[#303139] bg-[#1A1B20] px-3 text-sm text-white outline-none"
            aria-label="Filter by role"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => { setSortBy(event.target.value); setPage(1); }}
            className="h-10 rounded-md border border-[#303139] bg-[#1A1B20] px-3 text-sm text-white outline-none"
            aria-label="Sort users by"
          >
            <option value="createdAt">Joined Date</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
          </select>
          <select
            value={sortOrder}
            onChange={(event) => { setSortOrder(event.target.value); setPage(1); }}
            className="h-10 rounded-md border border-[#303139] bg-[#1A1B20] px-3 text-sm text-white outline-none"
            aria-label="Sort order"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <select
            value={limit}
            onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}
            className="h-10 rounded-md border border-[#303139] bg-[#1A1B20] px-3 text-sm text-white outline-none"
            aria-label="Users per page"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#C83B55] px-4 text-sm font-semibold text-white"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {isLoading ? (
        <UsersTableSkeleton />
      ) : (
        <div className="rounded-md border border-[#2A2B31] bg-[#1A1B20] p-5">
          <h2 className="mb-5 text-lg font-semibold text-white">Newly Joined</h2>
          <div className="overflow-hidden rounded-md border border-[#303139]">
            <Table>
              <TableHeader className="bg-[#111216]">
                <TableRow className="border-[#303139] hover:bg-transparent">
                  {tableHeaders.map((head) => (
                    <TableHead key={head} className="h-10 text-center text-xs font-semibold uppercase text-white">{head}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.isError ? (
                  <TableRow className="border-[#303139] bg-[#1C1D22] hover:bg-[#1C1D22]">
                    <TableCell colSpan={6} className="h-32 text-center">
                      <p className="text-sm text-red-300">
                        {usersQuery.error instanceof Error ? usersQuery.error.message : "Unable to load users."}
                      </p>
                      <button type="button" onClick={() => usersQuery.refetch()} className="mt-3 rounded-md bg-[#C83B55] px-4 py-2 text-sm font-semibold text-white">Try again</button>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow className="border-[#303139] bg-[#1C1D22] hover:bg-[#1C1D22]">
                    <TableCell colSpan={6} className="h-32 text-center text-[#A6A6AF]">No users found.</TableCell>
                  </TableRow>
                ) : (
                  users.map((apiUser) => {
                    const user = toUserRow(apiUser);
                    return (
                      <TableRow key={apiUser.id} className="h-[54px] border-[#303139] bg-[#1C1D22] hover:bg-[#22232A]">
                        <TableCell className="text-center text-white">{user.name}</TableCell>
                        <TableCell className="text-center text-[#E6E6EB]">{user.email}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex min-w-[64px] justify-center rounded-full bg-[#242A33] px-3 py-1.5 text-sm text-[#B7C0CC]">{user.plan}</span>
                        </TableCell>
                        <TableCell className="text-center text-[#E6E6EB]">{user.joined}</TableCell>
                        <TableCell className="text-center text-[#E6E6EB]">{user.spent}</TableCell>
                        <TableCell className="text-center"><UserDetailsModal user={user} /></TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {!usersQuery.isError && total > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-[#A6A6AF]">
              <p>Showing {firstResult} to {lastResult} of {total.toLocaleString()} results</p>
              <AppPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                disabled={usersQuery.isFetching}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
