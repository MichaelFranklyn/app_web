import { Item } from "../Item";
import { Next, Prev } from "../Navigators";
import { Root } from "../Root";

interface PaginationSmartProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Smart = ({ currentPage, totalPages, onPageChange }: PaginationSmartProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    const start = Math.max(1, currentPage - 2);
    return start + i;
  }).filter((page) => page <= totalPages);

  return (
    <Root>
      <Prev disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} />
      {pages.map((page) => (
        <Item key={page} active={page === currentPage} onClick={() => onPageChange(page)}>
          {page}
        </Item>
      ))}
      <Next disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} />
    </Root>
  );
};

Smart.displayName = "Pagination.Smart";
