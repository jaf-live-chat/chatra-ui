import { useState } from "react";
import { Search, History, Calendar, Clock, FileText, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Search, History, Calendar, Clock, FileText, ChevronLeft, ChevronRight, X, Star } from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

const ChatHistoryView = ({ history }: { history: any[] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingTranscript, setViewingTranscript] = useState<typeof history[0] | null>(null);
  const itemsPerPage = 8;

  const filteredHistory = history.filter(item =>
    item.visitor.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderStars = (rating?: number | null) => {
    const resolvedRating = Number.isFinite(Number(rating)) ? Math.max(0, Math.min(5, Number(rating))) : 0;

    if (resolvedRating <= 0) {
      return <Typography variant="body2" color="text.secondary">No rating</Typography>;
    }

    return (
      <Stack direction="row" alignItems="center" spacing={0.4}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={14} fill={index < Math.round(resolvedRating) ? "currentColor" : "none"} color={index < Math.round(resolvedRating) ? "#f59e0b" : "#d1d5db"} />
        ))}
        <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>{resolvedRating.toFixed(1)}/5</Typography>
      </Stack>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "grey.900" }}>Chat History</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Review past conversations and transcripts.</Typography>
        </Box>

        <Box sx={{ position: "relative", width: { xs: "100%", md: 280 } }}>
          <Box sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "text.secondary", display: "flex" }}>
            <Search size={18} />
          </Box>
          <InputBase
            placeholder="Search by visitor name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            sx={{
              w: "100%", pl: 4.5, pr: 2, py: 1,
              bgcolor: "background.paper", border: "1px solid", borderColor: "grey.200",
              borderRadius: 2, fontSize: "0.875rem",
              "&.Mui-focused": { borderColor: "secondary.main", boxShadow: "0 0 0 2px #DC262633" }
            }}
            fullWidth
          />
        </Box>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, overflowX: "auto" }}>
        <Table sx={{ minWidth: { xs: 720, md: 860 } }}>
          <TableHead sx={{ bgcolor: "background.paper", borderBottom: "2px solid", borderColor: "grey.200" }}>
            <TableRow>
              <TableCell align="center" width="10%">VISITOR ID</TableCell>
              <TableCell width="25%">VISITOR NAME</TableCell>
              <TableCell align="center" width="20%">LENGTH</TableCell>
              <TableCell align="center" width="25%">DATE</TableCell>
              <TableCell align="center" width="15%">RATING</TableCell>
              <TableCell align="center" width="20%">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedHistory.length > 0 ? (
              <>
                {paginatedHistory.map((item, index) => {
                  const absoluteIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const avatarColors = ['#FF5A1F', '#1F75FE', '#A855F7', '#B48600', '#0891b2'];
                  const charCode = item.id.charCodeAt(item.id.length - 1) || 0;
                  const colorClass = avatarColors[charCode % avatarColors.length];

                  return (
                    <TableRow key={item.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>{"V-" + (parseInt(item.id.replace(/\D/g, "")) + 97212)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: colorClass, fontSize: "0.875rem", fontWeight: 600 }}>
                            {item.visitor.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>{item.visitor}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ color: "text.secondary" }}>
                          <Clock size={16} />
                          <Typography variant="body2">{item.length}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ color: "text.secondary" }}>
                          <Calendar size={16} />
                          <Typography variant="body2">{item.date}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">{renderStars(item.rating)}</TableCell>
                      <TableCell align="center">
                        <Button
                          onClick={() => setViewingTranscript(item)}
                          startIcon={<FileText size={16} />}
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "grey.700", borderColor: "grey.300", bgcolor: "grey.50",
                            "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" }
                          }}
                        >
                          View Transcript
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Stack alignItems="center" spacing={2} sx={{ color: "text.secondary" }}>
                    <History size={48} color="#d1d5db" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "grey.900" }}>No history found</Typography>
                      <Typography variant="body2">Try adjusting your search.</Typography>
                    </Box>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: "1px solid", borderColor: "grey.200", bgcolor: "background.paper", display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Showing <Typography component="span" variant="body2" fontWeight={600} color="grey.900">{(currentPage - 1) * itemsPerPage + 1}</Typography> to <Typography component="span" variant="body2" fontWeight={600} color="grey.900">{Math.min(currentPage * itemsPerPage, filteredHistory.length)}</Typography> of <Typography component="span" variant="body2" fontWeight={600} color="grey.900">{filteredHistory.length}</Typography> entries
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                size="small"
                sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 1.5 }}
              >
                <ChevronLeft size={16} />
              </IconButton>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  sx={{
                    minWidth: { xs: 28, sm: 32 }, p: 0, height: { xs: 28, sm: 32 }, borderRadius: 1.5,
                    bgcolor: currentPage === i + 1 ? "secondary.light" : "transparent",
                    color: currentPage === i + 1 ? "secondary.dark" : "text.secondary",
                    fontWeight: currentPage === i + 1 ? 700 : 500,
                    "&:hover": { bgcolor: currentPage === i + 1 ? "secondary.light" : "grey.50" }
                  }}
                >
                  {i + 1}
                </Button>
              ))}
              <IconButton
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                size="small"
                sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 1.5 }}
              >
                <ChevronRight size={16} />
              </IconButton>
            </Stack>
          </Box>
        )}
      </TableContainer>

      {/* Transcript Modal */}
      <Dialog
        open={!!viewingTranscript}
        onClose={() => setViewingTranscript(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: "80vh" } }}
      >
        {viewingTranscript && (
          <>
            <DialogTitle sx={{ p: 2, pb: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "grey.200", m: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.125rem" }}>Transcript: {viewingTranscript.visitor}</Typography>
                <Typography variant="body2" color="text.secondary">{viewingTranscript.date} • {viewingTranscript.length}</Typography>
              </Box>
              <IconButton onClick={() => setViewingTranscript(null)} size="small" sx={{ color: "text.secondary" }}>
                <X size={20} />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, overflowY: "auto", bgcolor: "background.paper", display: "flex", flexDirection: "column" }}>
              <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                {viewingTranscript.transcript.map((msg: any, index: number) => {
                  const isAgent = msg.sender === "Agent";
                  return (
                    <Box key={index} sx={{ display: "flex", flexDirection: "column", alignItems: isAgent ? "flex-end" : "flex-start", maxWidth: "80%", alignSelf: isAgent ? "flex-end" : "flex-start" }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>{isAgent ? "You" : msg.sender}</Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled" }}>{msg.time}</Typography>
                      </Stack>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5, px: 2,
                          bgcolor: isAgent ? "secondary.main" : "grey.100",
                          color: isAgent ? "white" : "grey.800",
                          borderRadius: 3,
                          borderTopRightRadius: isAgent ? 2 : 12,
                          borderTopLeftRadius: !isAgent ? 2 : 12,
                        }}
                      >
                        <Typography variant="body2">{msg.text}</Typography>
                      </Paper>
                    </Box>
                  );
                })}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: "grey.50", borderTop: "1px solid", borderColor: "grey.200" }}>
              <Button onClick={() => setViewingTranscript(null)} sx={{ color: "text.secondary", fontWeight: 600, bgcolor: "background.paper", border: "1px solid", borderColor: "grey.300", "&:hover": { bgcolor: "grey.100" } }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default ChatHistoryView;


