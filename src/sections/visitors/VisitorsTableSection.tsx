import { useState } from "react";
import { Eye, MapPin, Users, X } from "lucide-react";
import { useNavigate } from "react-router";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ReusableTable, { type ReusableTableColumn } from "../../components/ReusableTable";
import TitleTag from "../../components/TitleTag";
import { useGetVisitors } from "../../hooks/useVisitors";
import type { PortalVisitor } from "../../models/VisitorModel";
import idLabel from "../../utils/idUtils";

const ROWS_PER_PAGE = 10;

const getVisitorMapEmbedUrl = (city?: string | null, country?: string | null) => {
  const query = [city, country]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");

  if (!query) {
    return null;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=10&output=embed`;
};

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

  if (visitor.locationConsent === true) {
    return "Location not resolved yet";
  }

  return "Not granted";
};

const VisitorsTableSection = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [mapPreview, setMapPreview] = useState<{ name: string; locationLabel: string; mapUrl: string } | null>(null);

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
      renderCell: (visitor) => {
        const locationLabel = resolveLocation(visitor);
        const mapUrl = getVisitorMapEmbedUrl(visitor.locationCity, visitor.locationCountry);

        return (
          <Stack spacing={0.5} alignItems="flex-start">
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
              {locationLabel}
            </Typography>
            {mapUrl ? (
              <Button
                size="small"
                variant="text"
                startIcon={<MapPin size={13} />}
                onClick={() => {
                  setMapPreview({
                    name: resolveDisplayName(visitor),
                    locationLabel,
                    mapUrl,
                  });
                }}
                sx={{
                  textTransform: "none",
                  px: 0,
                  minWidth: 0,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                }}
              >
                View Map
              </Button>
            ) : null}
          </Stack>
        );
      },
    },
    {
      id: "action",
      label: "",
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

      <Dialog
        open={Boolean(mapPreview)}
        onClose={() => setMapPreview(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1.5 } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {mapPreview?.name || "Visitor"} - Location Map
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {mapPreview?.locationLabel || "Not granted"}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setMapPreview(null)}>
              <X size={16} />
            </IconButton>
          </Box>

          {mapPreview?.mapUrl ? (
            <iframe
              title="visitor map preview"
              src={mapPreview.mapUrl}
              loading="lazy"
              style={{ width: "100%", height: 320, border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Location permission not granted.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default VisitorsTableSection;
