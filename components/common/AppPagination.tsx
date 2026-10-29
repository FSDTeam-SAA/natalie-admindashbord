import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type AppPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  disabled?: boolean;
};

export function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: AppPaginationProps) {
  const firstPage = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const pages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => firstPage + index,
  );

  const goToPage = (page: number) => {
    if (!disabled && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  return (
    <Pagination className="mx-0 w-auto justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => goToPage(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            className="disabled:cursor-not-allowed disabled:opacity-40"
          />
        </PaginationItem>
        {pages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={() => goToPage(1)} disabled={disabled}>
                1
              </PaginationLink>
            </PaginationItem>
            {pages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={page === currentPage}
              onClick={() => goToPage(page)}
              disabled={disabled}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink onClick={() => goToPage(totalPages)} disabled={disabled}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => goToPage(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            className="disabled:cursor-not-allowed disabled:opacity-40"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
