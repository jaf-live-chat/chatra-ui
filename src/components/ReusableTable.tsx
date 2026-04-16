import { useEffect, useMemo, useRef, useState, type ReactNode, type WheelEvent } from "react";
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
import Skeleton from "./skeleton";

type SortDirection = "asc" | "desc";

type SortableValue = string | number | boolean | Date | null | undefined;

export interface ReusableTableColumn<T> {
  id: string;
  label: ReactNode;
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
  tableMinWidth?: number;
  tableLayout?: "auto" | "fixed";
  compact?: boolean;
  noHorizontalScroll?: boolean;
  search?: {
    placeholder?: string;
    by?: (row: T) => string;
    filter?: (row: T, searchTerm: string) => boolean;
    value?: string;
    onChange?: (searchTerm: string) => void;
    show?: boolean;
  };
  pagination?: {
    rowsPerPage?: number;
    page?: number;
    onPageChange?: (page: number) => void;
    totalRows?: number;
    show?: boolean;
  };
  sorting?: {
    sortBy?: string | null;
    sortDirection?: SortDirection;
    onChange?: (sortBy: string | null, sortDirection: SortDirection) => void;
    defaultSortBy?: string | null;
    defaultSortDirection?: SortDirection;
  };
  headerIcon?: ReactNode;
  headerBadges?: ReactNode;
  headerActions?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  totalLabel?: string;
  showTotalBadge?: boolean;
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
  tableMinWidth = 650,
  tableLayout = "auto",
  compact = false,
  noHorizontalScroll = false,
  search,
  pagination,
  sorting,
  headerIcon,
  headerBadges,
  headerActions,
  loading = false,
  loadingLabel = "Loading records...",
  emptyStateTitle = "No records found",
  emptyStateDescription = "Try adjusting your search.",
  totalLabel = "records",
  showTotalBadge = true,
}: ReusableTableProps<T>) => {
  const {
    placeholder: searchPlaceholder = "Search...",
    by: searchBy,
    filter: filterFn,
    value: searchTerm,
    onChange: onSearchTermChange,
    show: showSearch = true,
  } = search ?? {};

  const {
    rowsPerPage = DEFAULT_ROWS_PER_PAGE,
    page,
    onPageChange,
    totalRows,
    show: showPagination = true,
  } = pagination ?? {};

  const {
    sortBy,
    sortDirection,
    onChange: onSortChange,
    defaultSortBy = null,
    defaultSortDirection = "asc",
  } = sorting ?? {};

  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalPage, setInternalPage] = useState(1);
  const [internalSortBy, setInternalSortBy] = useState<string | null>(defaultSortBy);
  const [internalSortDirection, setInternalSortDirection] =
    useState<SortDirection>(defaultSortDirection);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const isServerFiltering =
    searchTerm !== undefined &&
    typeof onSearchTermChange === "function" &&
    !searchBy &&
    !filterFn;

  const isServerPagination = totalRows !== undefined;

  const isServerSorting =
    sortBy !== undefined &&
    sortDirection !== undefined &&
    typeof onSortChange === "function";

  const resolvedSearchTerm = searchTerm ?? internalSearchTerm;
  const resolvedPage = page ?? internalPage;
  const resolvedSortBy = sortBy ?? internalSortBy;
  const resolvedSortDirection = sortDirection ?? internalSortDirection;

  const isControlledSearch = searchTerm !== undefined;
  const isControlledPage = page !== undefined;
  const isControlledSort = sortBy !== undefined && sortDirection !== undefined;

  const setPageValue = (nextPage: number) => {
    if (onPageChange) {
      onPageChange(nextPage);
    }

    if (!isControlledPage) {
      setInternalPage(nextPage);
    }
  };

  const setSearchTermValue = (nextSearchTerm: string) => {
    if (onSearchTermChange) {
      onSearchTermChange(nextSearchTerm);
    }

    if (!isControlledSearch) {
      setInternalSearchTerm(nextSearchTerm);
    }

    setPageValue(1);
  };

  const setSortValue = (nextSortBy: string | null, nextSortDirection: SortDirection) => {
    if (onSortChange) {
      onSortChange(nextSortBy, nextSortDirection);
    }

    if (!isControlledSort) {
      setInternalSortBy(nextSortBy);
      setInternalSortDirection(nextSortDirection);
    }
  };

  const filteredRows = useMemo(() => {
    if (isServerFiltering) {
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
  }, [filterFn, isServerFiltering, resolvedSearchTerm, rows, searchBy]);

  const sortedRows = useMemo(() => {
    if (isServerSorting || !resolvedSortBy) {
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
  }, [columns, filteredRows, isServerSorting, resolvedSortBy, resolvedSortDirection]);

  const totalRecords = isServerPagination ? totalRows ?? rows.length : sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

  useEffect(() => {
    // Only auto-clamp when pagination is fully internal.
    // In callback-driven pagination, parent logic should control page validity.
    if (!onPageChange && resolvedPage > totalPages) {
      setPageValue(totalPages);
    }
  }, [onPageChange, resolvedPage, totalPages]);

  const pagedRows = useMemo(() => {
    if (isServerPagination) {
      return sortedRows;
    }

    const start = (resolvedPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [isServerPagination, resolvedPage, rowsPerPage, sortedRows]);

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

  const handleHorizontalScroll = (event: WheelEvent<HTMLDivElement>) => {
    if (noHorizontalScroll) return;

    const container = tableContainerRef.current;
    if (!container) return;

    const canScrollHorizontally = container.scrollWidth > container.clientWidth;
    if (!canScrollHorizontally) return;

    // Use whichever axis has the larger delta so touchpads that emit deltaX still work.
    const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;

    if (!dominantDelta) return;

    event.preventDefault();
    container.scrollLeft += dominantDelta;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: compact ? 2 : 3,
          py: { xs: compact ? 1 : 1.5, sm: compact ? 1.25 : 2 },
          borderBottom: "1px solid",
          borderColor: "divider",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #0891b226 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #0891b210 0%, #0891b204 100%)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: compact ? 0.75 : 1.1, md: compact ? 1 : 2 }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={compact ? 1 : 1.5} gap={1} flexWrap="wrap" sx={{ width: { xs: "100%", md: "auto" } }}>
            <Box
              sx={{
                width: compact ? 30 : 34,
                height: compact ? 30 : 34,
                borderRadius: 1,
                bgcolor: "#0891b220",
                color: "#0891b2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& > svg": compact ? { width: 16, height: 16 } : undefined,
              }}
            >
              {headerIcon ?? <ArrowDownAZ size={compact ? 15 : 17} />}
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2, fontSize: compact ? "0.98rem" : "1rem" }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: compact ? "0.72rem" : "0.75rem" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {headerBadges}
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ width: { xs: "100%", md: "auto" }, flexWrap: "wrap", rowGap: 1 }}
          >
            {headerActions}
            {showTotalBadge && (
              <Chip
                label={`${totalRecords} ${totalLabel}`}
                size="small"
                sx={{
                  alignSelf: { xs: "flex-start", sm: "center" },
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "#164e63" : "#e0f2fe"),
                  color: (theme) => (theme.palette.mode === "dark" ? "#67e8f9" : "#0e7490"),
                  fontWeight: 700,
                  height: compact ? 26 : 30,
                  borderRadius: 1,
                }}
              />
            )}
            {showSearch && (
              <Paper
                variant="outlined"
                sx={{
                  px: 1.25,
                  py: compact ? 0.25 : 0.5,
                  borderRadius: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: { xs: "100%", md: 260 },
                }}
              >
                <Search size={14} color="currentColor" />
                <InputBase
                  value={resolvedSearchTerm}
                  onChange={(event) => setSearchTermValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  sx={{ width: "100%", fontSize: compact ? "0.8rem" : "0.85rem", color: "text.primary" }}
                />
              </Paper>
            )}
          </Stack>
        </Stack>
      </Box>

      <TableContainer
        ref={tableContainerRef}
        onWheel={handleHorizontalScroll}
        sx={{
          overflowX: noHorizontalScroll ? "hidden" : "auto",
          overflowY: "hidden",
          width: "100%",
          maxWidth: "100%",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table
          sx={{
            minWidth: tableMinWidth,
            tableLayout,
            // Fill available space but keep a floor for when horizontal scroll is needed.
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <TableHead sx={{ bgcolor: (theme) => (theme.palette.mode === "dark" ? "#1f2937" : "grey.50") }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.headerAlign || column.align || "left"}
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: compact ? "0.72rem" : "0.8rem",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    px: compact ? 1.5 : 2,
                    py: compact ? 1 : 1.5,
                    whiteSpace: "nowrap",
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
                      "& td": { py: compact ? 1.2 : 2.1, px: compact ? 1.5 : 2 },
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
                <TableCell colSpan={columns.length} align="center" sx={{ py: compact ? 4.5 : 7 }}>
                  <Stack alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
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
                    "&:nth-of-type(odd) td": {
                      bgcolor: (theme) => (theme.palette.mode === "dark" ? "#1f2937" : "grey.50"),
                    },
                    "& td": { py: compact ? 1.2 : 2.1, px: compact ? 1.5 : 2 },
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      sx={{
                        whiteSpace: "nowrap",
                        wordBreak: "keep-all",
                        ...column.sx,
                      }}
                    >
                      {column.renderCell(row, (resolvedPage - 1) * rowsPerPage + rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <Box
          sx={{
            px: { xs: 1.5, sm: compact ? 2 : 3 },
            py: compact ? 0.75 : 1.5,
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "#1f2937" : "grey.50"),
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1, sm: 0 },
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
            Showing
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.8rem", mx: 0.5 }}
            >
              {startRecord}
            </Typography>
            -
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.8rem", mx: 0.5 }}
            >
              {endRecord}
            </Typography>
            of
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.8rem", ml: 0.5 }}
            >
              {totalRecords}
            </Typography>
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
            <IconButton
              onClick={() => setPageValue(Math.max(1, resolvedPage - 1))}
              disabled={resolvedPage === 1}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "divider",
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
                borderColor: "divider",
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
