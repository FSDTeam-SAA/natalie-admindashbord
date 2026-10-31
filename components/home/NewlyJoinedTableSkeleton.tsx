import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function NewlyJoinedTableSkeleton() {
  return (
    <section className="animate-pulse rounded-md border border-[#2A2B31] bg-[#1A1B20] p-5" aria-label="Loading newly joined users">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="h-6 w-32 rounded bg-[#292A30]" />
        <div className="h-8 w-24 rounded bg-[#292A30]" />
      </div>
      <div className="overflow-hidden rounded-md border border-[#303139]">
        <Table>
          <TableHeader className="bg-[#111216]"><TableRow className="border-[#303139] hover:bg-transparent">
            {["Customer", "Email", "Plan", "Joined"].map((head) => <TableHead key={head} className="text-xs font-semibold uppercase text-white">{head}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="h-[58px] border-[#303139] bg-[#1C1D22] hover:bg-[#1C1D22]">
                {["w-32", "w-44", "w-16", "w-24"].map((width, cellIndex) => <TableCell key={cellIndex}><div className={`h-5 rounded bg-[#292A30] ${width}`} /></TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
