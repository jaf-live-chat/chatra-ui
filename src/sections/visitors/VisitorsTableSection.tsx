import { useState } from "react";
import { Eye, Users } from "lucide-react";
import { useNavigate } from "react-router";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ReusableTable, { type ReusableTableColumn } from "../../components/ReusableTable";
import TitleTag from "../../components/TitleTag";
import { useGetVisitors } from "../../hooks/useVisitors";
import type { PortalVisitor } from "../../models/VisitorModel";
import idLabel from "../../utils/idUtils";

const ROWS_PER_PAGE = 10;

const getInitials = (name: string) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "VS";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

const resolveDisplayName = (visitor: PortalVisitor) => {
  if (visitor.displayName?.trim()) {
    return visitor.displayName.trim();
  }

  if (visitor.name?.trim()) {
    return visitor.name.trim();
  }

  if (visitor.emailAddress?.trim()) {
    return visitor.emailAddress.trim();
  }

  return "Website Visitor";
};

const resolveLocation = (visitor: PortalVisitor) => {
  const city = String(visitor.locationCity || "").trim();
  const country = String(visitor.locationCountry || "").trim();

  if (city && country) {
    return `${city}, ${country}`;
  }

  if (city) {
    return city;
  }

  if (country) {
    return country;
  }

  return "Unknown";
};

const VisitorsTableSection = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { visitors, pagination, isLoading } = useGetVisitors({
    page,
    limit: ROWS_PER_PAGE,
    search,
  });

  const columns: ReusableTableColumn<PortalVisitor>[] = [
    {
      id: "visitor",
      label: "Visitor",
      sortable: true,
      sortAccessor: (visitor) => resolveDisplayName(visitor),
      renderCell: (visitor) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={(theme) => ({
              width: 36,
              height: 36,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 700,
              fontSize: "0.85rem",
            })}
          >
            {getInitials(resolveDisplayName(visitor))}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
              {resolveDisplayName(visitor)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {idLabel(String(visitor._id || ""), "VISITOR")}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "location",
      label: "Location",
      sortable: true,
      sortAccessor: (visitor) => resolveLocation(visitor),
      renderCell: (visitor) => (
        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
          {resolveLocation(visitor)}
        </Typography>
      ),
    },
    {
      id: "action",
      label: "CTA",
      align: "right",
      headerAlign: "right",
      renderCell: (visitor) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Eye size={14} />}
          onClick={() => navigate(`/portal/visitors/${visitor._id}`)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 1,
          }}
        >
          View Visitor
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <TitleTag
        title="Visitors"
        subtitle="Track your visitors and jump into each profile to inspect conversation history."
        icon={<Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
      />

      <ReusableTable
        title="Visitors Directory"
        subtitle="Avatar, visitor identity, location, and quick access to details"
        rows={visitors}
        columns={columns}
        getRowKey={(row) => String(row._id)}
        loading={isLoading}
        loadingLabel="Loading visitors..."
        search={{
          placeholder: "Search by name, email, token, city, or country",
          value: search,
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
        }}
        pagination={{
          page,
          rowsPerPage: ROWS_PER_PAGE,
          totalRows: pagination?.totalCount ?? visitors.length,
          onPageChange: setPage,
        }}
        emptyStateTitle="No visitors found"
        emptyStateDescription="Try changing the search keyword or wait for new visitors."
        totalLabel="visitors"
      />
    </Stack>
  );
};

export default VisitorsTableSection;
