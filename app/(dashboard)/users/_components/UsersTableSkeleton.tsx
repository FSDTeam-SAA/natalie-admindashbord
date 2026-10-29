import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const tableHeaders = ["User", "Email", "Plan", "Joined", "Spent", "Actions"];

export function UsersTableSkeleton() {
  return (
    <div className="animate-pulse rounded-md border border-[#2A2B31] bg-[#1A1B20] p-5" aria-label="Loading users">
      <div className="mb-5 h-7 w-32 rounded bg-[#292A30]" />
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
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="h-[54px] border-[#303139] bg-[#1C1D22] hover:bg-[#1C1D22]">
                {["w-24", "w-40", "w-16", "w-24", "w-16", "w-8"].map((width, cellIndex) => (
                  <TableCell key={cellIndex} className="text-center">
                    <div className={`mx-auto h-5 rounded-full bg-[#292A30] ${width}`} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="h-5 w-48 rounded bg-[#292A30]" />
        <div className="h-9 w-64 rounded bg-[#292A30]" />
      </div>
    </div>
  );
}
