import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDownAZ, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import Skeleton from "./Skeleton";

type SortDirection = "asc" | "desc";
type TableMode = "client" | "server";

type SortableValue = string | number | boolean | Date | null | undefined;

export interface ReusableTableColumn<T> {
  id: string;
  label: ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  sortable?: boolean;
  sortAccessor?: (row: T) => SortableValue;
  sortComparator?: (left: T, right: T) => number;
  headerSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
  renderCell: (row: T, rowIndex: number) => ReactNode;
}

interface ReusableTableProps<T> {
  title: string;
  subtitle?: string;
  rows: T[];
  columns: ReusableTableColumn<T>[];
  getRowKey: (row: T) => string;
  searchPlaceholder?: string;
  searchBy?: (row: T) => string;
  filterFn?: (row: T, searchTerm: string) => boolean;
  filterMode?: TableMode;
  rowsPerPage?: number;
  paginationMode?: TableMode;
  page?: number;
  onPageChange?: (page: number) => void;
  totalRows?: number;
  sortingMode?: TableMode;
  sortBy?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string | null, sortDirection: SortDirection) => void;
  defaultSortBy?: string | null;
  defaultSortDirection?: SortDirection;
  searchTerm?: string;
  onSearchTermChange?: (searchTerm: string) => void;
  showSearch?: boolean;
  showPagination?: boolean;
  headerIcon?: ReactNode;
  headerBadges?: ReactNode;
  headerActions?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  totalLabel?: string;
}

const DEFAULT_ROWS_PER_PAGE = 5;

const getComparableValue = (value: SortableValue): string | number => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return String(value ?? "").toLowerCase();
};

const compareValues = (left: SortableValue, right: SortableValue): number => {
  const normalizedLeft = getComparableValue(left);
  const normalizedRight = getComparableValue(right);

  if (typeof normalizedLeft === "number" && typeof normalizedRight === "number") {
    return normalizedLeft - normalizedRight;
  }

  return String(normalizedLeft).localeCompare(String(normalizedRight));
};

const ReusableTable = <T,>({
  title,
  subtitle,
  rows,
  columns,
  getRowKey,
  searchPlaceholder = "Search...",
  searchBy,
  filterFn,
  filterMode = "client",
  rowsPerPage = DEFAULT_ROWS_PER_PAGE,
  paginationMode = "client",
  page,
  onPageChange,
  totalRows,
  sortingMode = "client",
  sortBy,
  sortDirection,
  onSortChange,
  defaultSortBy = null,
  defaultSortDirection = "asc",
  searchTerm,
  onSearchTermChange,
  showSearch = true,
  showPagination = true,
  headerIcon,
  headerBadges,
  headerActions,
  loading = false,
  loadingLabel = "Loading records...",
  emptyStateTitle = "No records found",
  emptyStateDescription = "Try adjusting your search.",
  totalLabel = "records",
}: ReusableTableProps<T>) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalPage, setInternalPage] = useState(1);
  const [internalSortBy, setInternalSortBy] = useState<string | null>(defaultSortBy);
  const [internalSortDirection, setInternalSortDirection] =
    useState<SortDirection>(defaultSortDirection);

  const resolvedSearchTerm = searchTerm ?? internalSearchTerm;
  const resolvedPage = page ?? internalPage;
  const resolvedSortBy = sortBy ?? internalSortBy;
  const resolvedSortDirection = sortDirection ?? internalSortDirection;

  const setPageValue = (nextPage: number) => {
    if (onPageChange) {
      onPageChange(nextPage);
      return;
    }

    setInternalPage(nextPage);
  };

  const setSearchTermValue = (nextSearchTerm: string) => {
    if (onSearchTermChange) {
      onSearchTermChange(nextSearchTerm);
    } else {
      setInternalSearchTerm(nextSearchTerm);
    }

    setPageValue(1);
  };

  const setSortValue = (nextSortBy: string | null, nextSortDirection: SortDirection) => {
    if (onSortChange) {
      onSortChange(nextSortBy, nextSortDirection);
      return;
    }

    setInternalSortBy(nextSortBy);
    setInternalSortDirection(nextSortDirection);
  };

  const filteredRows = useMemo(() => {
    if (filterMode === "server") {
      return rows;
    }

    if (!resolvedSearchTerm.trim()) {
      return rows;
    }

    const normalizedSearchTerm = resolvedSearchTerm.toLowerCase().trim();

    return rows.filter((row) => {
      if (filterFn) {
        return filterFn(row, normalizedSearchTerm);
      }

      if (searchBy) {
        return searchBy(row).toLowerCase().includes(normalizedSearchTerm);
      }

      return true;
    });
  }, [filterFn, filterMode, resolvedSearchTerm, rows, searchBy]);

  const sortedRows = useMemo(() => {
    if (sortingMode === "server" || !resolvedSortBy) {
      return filteredRows;
    }

    const sortingColumn = columns.find((column) => column.id === resolvedSortBy);
    if (!sortingColumn || !sortingColumn.sortable) {
      return filteredRows;
    }

    const directionFactor = resolvedSortDirection === "asc" ? 1 : -1;

    return [...filteredRows].sort((leftRow, rightRow) => {
      if (sortingColumn.sortComparator) {
        return sortingColumn.sortComparator(leftRow, rightRow) * directionFactor;
      }

      const leftValue = sortingColumn.sortAccessor
        ? sortingColumn.sortAccessor(leftRow)
        : null;
      const rightValue = sortingColumn.sortAccessor
        ? sortingColumn.sortAccessor(rightRow)
        : null;

      return compareValues(leftValue, rightValue) * directionFactor;
    });
  }, [columns, filteredRows, resolvedSortBy, resolvedSortDirection, sortingMode]);

  const totalRecords = paginationMode === "server" ? totalRows ?? rows.length : sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

  useEffect(() => {
    if (resolvedPage > totalPages) {
      setPageValue(totalPages);
    }
  }, [resolvedPage, totalPages]);

  const pagedRows = useMemo(() => {
    if (paginationMode === "server") {
      return sortedRows;
    }

    const start = (resolvedPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [paginationMode, resolvedPage, rowsPerPage, sortedRows]);

  const startRecord = totalRecords === 0 ? 0 : (resolvedPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(resolvedPage * rowsPerPage, totalRecords);
  const skeletonRowCount = Math.max(1, rowsPerPage);

  const handleSort = (column: ReusableTableColumn<T>) => {
    if (!column.sortable) {
      return;
    }

    const isActive = resolvedSortBy === column.id;
    if (!isActive) {
      setSortValue(column.id, "asc");
      return;
    }

    if (resolvedSortDirection === "asc") {
      setSortValue(column.id, "desc");
      return;
    }

    setSortValue(null, "asc");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          background: "linear-gradient(135deg, #0891b210 0%, #0891b204 100%)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1,
                bgcolor: "#0891b220",
                color: "#0891b2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {headerIcon ?? <ArrowDownAZ size={17} />}
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "grey.900", lineHeight: 1.2 }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {headerBadges}
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: { xs: "100%", md: "auto" }, flexWrap: "wrap", rowGap: 1 }}
          >
            {headerActions}
            <Chip
              label={`${totalRecords} ${totalLabel}`}
              size="small"
              sx={{
                bgcolor: "#e0f2fe",
                color: "#0e7490",
                fontWeight: 700,
                height: 30,
                borderRadius: 1,
              }}
            />
            {showSearch && (
              <Paper
                variant="outlined"
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1,
                  borderColor: "grey.200",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: { xs: "100%", md: 260 },
                }}
              >
                <Search size={14} color="#94a3b8" />
                <InputBase
                  value={resolvedSearchTerm}
                  onChange={(event) => setSearchTermValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  sx={{ width: "100%", fontSize: "0.85rem", color: "#475569" }}
                />
              </Paper>
            )}
          </Stack>
        </Stack>
      </Box>

      <TableContainer sx={{ overflow: "visible" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  width={column.width}
                  align={column.headerAlign || column.align || "left"}
                  sx={{
                    fontWeight: 700,
                    color: "grey.800",
                    borderBottom: "1px solid",
                    borderColor: "grey.200",
                    ...column.headerSx,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={resolvedSortBy === column.id}
                      direction={resolvedSortBy === column.id ? resolvedSortDirection : "asc"}
                      onClick={() => handleSort(column)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <>
                {Array.from({ length: skeletonRowCount }).map((_, loadingRowIndex) => (
                  <TableRow
                    key={`loading-row-${loadingRowIndex}`}
                    sx={{
                      "& td": { py: 2.1 },
                    }}
                  >
                    {columns.map((column, columnIndex) => (
                      <TableCell key={`${column.id}-${loadingRowIndex}`} align={column.align || "left"}>
                        <Skeleton
                          className="rounded-md"
                          style={{
                            height: 14,
                            width: columnIndex === 0 ? 28 : columnIndex === columns.length - 1 ? 92 : "70%",
                            opacity: 0.8,
                          }}
                          aria-label={loadingLabel}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}

            {!loading && pagedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 7 }}>
                  <Stack alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "grey.900" }}>
                      {emptyStateTitle}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                      {emptyStateDescription}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              pagedRows.map((row, rowIndex) => (
                <TableRow
                  key={getRowKey(row)}
                  hover
                  sx={{
                    transition: "background 0.15s",
                    "& td": { py: 2.1 },
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || "left"} sx={column.sx}>
                      {column.renderCell(row, (resolvedPage - 1) * rowsPerPage + rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && totalPages > 1 && (
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: "grey.50",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
            Showing
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: "grey.900", fontSize: "0.8rem", mx: 0.5 }}
            >
              {startRecord}
            </Typography>
            -
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: "grey.900", fontSize: "0.8rem", mx: 0.5 }}
            >
              {endRecord}
            </Typography>
            of
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: "grey.900", fontSize: "0.8rem", ml: 0.5 }}
            >
              {totalRecords}
            </Typography>
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={() => setPageValue(Math.max(1, resolvedPage - 1))}
              disabled={resolvedPage === 1}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "grey.200",
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <Button
                  key={pageNumber}
                  onClick={() => setPageValue(pageNumber)}
                  sx={{
                    minWidth: 30,
                    p: 0,
                    height: 30,
                    borderRadius: 1,
                    bgcolor: resolvedPage === pageNumber ? "primary.main" : "transparent",
                    color: resolvedPage === pageNumber ? "#fff" : "text.secondary",
                    fontWeight: resolvedPage === pageNumber ? 700 : 500,
                    fontSize: "0.8rem",
                    "&:hover": {
                      bgcolor: resolvedPage === pageNumber ? "primary.dark" : "grey.100",
                    },
                  }}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <IconButton
              onClick={() => setPageValue(Math.min(totalPages, resolvedPage + 1))}
              disabled={resolvedPage === totalPages}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "grey.200",
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export type { ReusableTableProps };
export default ReusableTable;
