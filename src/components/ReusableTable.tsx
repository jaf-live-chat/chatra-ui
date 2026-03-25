import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
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
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

export interface ReusableTableColumn<T> {
  id: string;
  label: ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
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
  rowsPerPage?: number;
  loading?: boolean;
  loadingLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  totalLabel?: string;
}

const DEFAULT_ROWS_PER_PAGE = 5;

const ReusableTable = <T,>({
  title,
  subtitle,
  rows,
  columns,
  getRowKey,
  searchPlaceholder = "Search...",
  searchBy,
  filterFn,
  rowsPerPage = DEFAULT_ROWS_PER_PAGE,
  loading = false,
  loadingLabel = "Loading records...",
  emptyStateTitle = "No records found",
  emptyStateDescription = "Try adjusting your search.",
  totalLabel = "records",
}: ReusableTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) {
      return rows;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    return rows.filter((row) => {
      if (filterFn) {
        return filterFn(row, normalizedSearchTerm);
      }

      if (searchBy) {
        return searchBy(row).toLowerCase().includes(normalizedSearchTerm);
      }

      return true;
    });
  }, [filterFn, rows, searchBy, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  useEffect(() => {
    setPage(1);
  }, [searchTerm, rows]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 3,
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
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                bgcolor: "#0891b220",
                color: "#0e7490",
                width: 34,
                height: 34,
              }}
            >
              <Search size={17} />
            </Avatar>
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
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: "100%", md: "auto" } }}>
            <Paper
              variant="outlined"
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                borderColor: "grey.300",
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: { xs: "100%", md: 300 },
              }}
            >
              <Search size={16} color="#6b7280" />
              <InputBase
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={searchPlaceholder}
                sx={{ width: "100%", fontSize: "0.875rem" }}
              />
            </Paper>

            <Chip
              label={`${filteredRows.length} ${totalLabel}`}
              size="small"
              sx={{ bgcolor: "#0891b21a", color: "#0e7490", fontWeight: 700, height: 28 }}
            />
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
                  sx={{ fontWeight: 700, color: "grey.800" }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 7 }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <CircularProgress size={18} />
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {loadingLabel}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
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
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || "left"} sx={column.sx}>
                      {column.renderCell(row, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "grey.200",
            bgcolor: "grey.50",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
            Showing {(page - 1) * rowsPerPage + 1}-
            {Math.min(page * rowsPerPage, filteredRows.length)} of {filteredRows.length}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              size="small"
              sx={{ border: "1px solid", borderColor: "grey.200", bgcolor: "background.paper", borderRadius: 1.5 }}
            >
              <ChevronLeft size={16} />
            </IconButton>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <Button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  sx={{
                    minWidth: 30,
                    p: 0,
                    height: 30,
                    borderRadius: 1.5,
                    bgcolor: page === pageNumber ? "primary.main" : "transparent",
                    color: page === pageNumber ? "#fff" : "text.secondary",
                    fontWeight: page === pageNumber ? 700 : 500,
                    fontSize: "0.8rem",
                    "&:hover": {
                      bgcolor: page === pageNumber ? "primary.dark" : "grey.100",
                    },
                  }}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <IconButton
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              size="small"
              sx={{ border: "1px solid", borderColor: "grey.200", bgcolor: "background.paper", borderRadius: 1.5 }}
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
