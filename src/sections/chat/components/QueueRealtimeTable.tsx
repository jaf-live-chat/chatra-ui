import type { ReactNode } from "react";
import Chip from "@mui/material/Chip";
import ReusableTable, { type ReusableTableColumn } from "../../../components/ReusableTable";

interface QueueRealtimeTableProps<T> {
  title: string;
  subtitle: string;
  rows: T[];
  columns: ReusableTableColumn<T>[];
  page: number;
  onPageChange: (page: number) => void;
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  badgeTone: "warning" | "success";
  icon: ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
}

const QueueRealtimeTable = <T,>({
  title,
  subtitle,
  rows,
  columns,
  page,
  onPageChange,
  getRowKey,
  onRowClick,
  badgeTone,
  icon,
  emptyStateTitle,
  emptyStateDescription,
}: QueueRealtimeTableProps<T>) => {
  const warningTone = {
    backgroundColor: "#eab30826",
    color: "#7a5d00",
  };

  const successTone = {
    backgroundColor: "#16a34a1f",
    color: "#15803d",
  };

  return (
    <ReusableTable
      title={title}
      subtitle={subtitle}
      rows={rows}
      columns={columns}
      getRowKey={getRowKey}
      onRowClick={onRowClick}
      compact
      tableLayout="auto"
      tableMinWidth={520}
      search={{ show: false }}
      headerIcon={icon}
      headerBadges={(
        <Chip
          label={`${rows.length} ${badgeTone === "warning" ? "waiting" : "active"}`}
          size="small"
          sx={{
            fontWeight: 700,
            height: 26,
            ...(badgeTone === "warning" ? warningTone : successTone),
          }}
        />
      )}
      pagination={{
        page,
        rowsPerPage: 5,
        onPageChange,
        totalRows: rows.length,
        show: true,
      }}
      loading={false}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      showTotalBadge={false}
    />
  );
};

export default QueueRealtimeTable;
