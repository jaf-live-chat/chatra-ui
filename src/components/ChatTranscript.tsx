import {
  X,
  Download,
  MapPin,
} from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import type { ChatMessage } from "../models/ChatSessionManagementModel";

interface ChatTranscriptProps {
  chatId: string;
  status: "WAITING" | "OPEN" | "ENDED";
  visitorName: string;
  visitorLocation?: string;
  agentName: string;
  messages: ChatMessage[];
  startDate: string;
  companyName?: string;
  companyLogoUrl?: string;
  visitorAvatar?: string;
  agentAvatar?: string;
  showTypingIndicator?: boolean;
  onExport?: () => void;
  onClose?: () => void;
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const sanitizeFileName = (value: string) => {
  const safe = String(value || "").replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
  return safe || "chat-transcript";
};

const resolveInitials = (value: string) => {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "JC";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

const imageUrlToDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === "string" ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const exportTranscriptPDF = async (
  chatId: string,
  visitorName: string,
  visitorLocation: string,
  agentName: string,
  messages: ChatMessage[],
  startDate: string,
  companyName: string,
  companyLogoUrl?: string
) => {
  try {
    // Dynamic import for jsPDF
    const jsPDF = (await import("jspdf")).jsPDF;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set fonts
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;
    const logoWidth = 38;
    const logoHeight = 14;
    const logoX = pageWidth - margin - logoWidth;
    const headerRowY = yPosition + 8;

    const resolvedCompanyName = String(companyName || "JAF Chatra").trim() || "JAF Chatra";
    const logoDataUrl = companyLogoUrl ? await imageUrlToDataUrl(companyLogoUrl) : null;

    const brandColor: [number, number, number] = [11, 141, 181];

    // Minimal top accent
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(0.8);
    doc.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);

    // Title and logo aligned on the same row.
    doc.setTextColor(...brandColor);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Chat Transcript - ${chatId}`, margin, headerRowY);

    // Right-aligned logo only (no company text).
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", logoX, headerRowY - 7, logoWidth, logoHeight);
    } else {
      doc.setFillColor(44, 62, 80);
      doc.roundedRect(logoX + logoWidth - 14, headerRowY - 6, 13, 13, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(resolveInitials(resolvedCompanyName), logoX + logoWidth - 12, headerRowY + 1);
    }

    yPosition = headerRowY + 7;

    // Minimal divider beneath aligned header row.
    doc.setDrawColor(210, 214, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Meta info section - minimal style
    doc.setFontSize(9);
    doc.setTextColor(95, 99, 104);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Visitor: ${visitorName}`, margin, yPosition);
    yPosition += 4;
    
    doc.text(`Location: ${visitorLocation || "Unknown"}`, margin, yPosition);
    yPosition += 4;
    
    doc.text(`Agent: ${agentName}`, margin, yPosition);
    yPosition += 4;
    
    doc.text(`Date: ${formatDate(startDate)}`, margin, yPosition);
    yPosition += 7;

    // Minimal bottom divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 4;

    // Messages
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 31, 31);

    messages.forEach((message) => {
      const sender = message.sender === "visitor" ? visitorName : agentName;
      const label = `${sender} (${message.timestamp})`;

      // Check if we need a new page
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }

      // Sender name
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, yPosition);
      yPosition += 4;

      // Message text with wrapping
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(message.text, contentWidth - 5);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin - 5) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin + 5, yPosition);
        yPosition += 4;
      });

      yPosition += 3;
    });

    const fileName = `${sanitizeFileName(chatId)}-transcript.pdf`;
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Fallback to text export if jsPDF is not available
    let content = `CHAT TRANSCRIPT\n`;
    content += `${companyName || "JAF Chatra"}\n`;
    content += `Chat ID: ${chatId}\n`;
    content += `Visitor: ${visitorName}\n`;
    content += `Location: ${visitorLocation || "Unknown"}\n`;
    content += `Agent: ${agentName}\n`;
    content += `Date: ${formatDate(startDate)}\n`;
    content += `${"=".repeat(60)}\n\n`;

    messages.forEach((msg) => {
      const sender = msg.sender === "visitor" ? visitorName : agentName;
      content += `${sender} (${msg.timestamp})\n${msg.text}\n\n`;
    });

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
    );
    element.setAttribute("download", `${sanitizeFileName(chatId)}-transcript.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
};

const ChatTranscript = ({
  chatId,
  status,
  visitorName,
  visitorLocation = "Unknown",
  agentName,
  messages,
  startDate,
  companyName = "JAF Chatra",
  companyLogoUrl,
  visitorAvatar = "V",
  agentAvatar = "A",
  showTypingIndicator = false,
  onExport,
  onClose,
}: ChatTranscriptProps) => {
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      exportTranscriptPDF(
        chatId,
        visitorName,
        visitorLocation,
        agentName,
        messages,
        startDate,
        companyName,
        companyLogoUrl
      );
    }
  };

  const getStatusColor = (
    status: "WAITING" | "OPEN" | "ENDED"
  ): "warning" | "success" | "error" => {
    switch (status) {
      case "WAITING":
        return "warning";
      case "OPEN":
        return "success";
      case "ENDED":
        return "error";
      default:
        return "warning";
    }
  };

  const getStatusLabel = (status: "WAITING" | "OPEN" | "ENDED") => {
    switch (status) {
      case "WAITING":
        return "Waiting";
      case "OPEN":
        return "Open";
      case "ENDED":
        return "Ended";
      default:
        return status;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#F8F9FA",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: "12px 16px",
          borderBottom: "1px solid",
          borderColor: "#E8EAED",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#FFFFFF",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Stack spacing={0.3} sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 700, 
                  color: "#1F1F1F", 
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: { xs: "130px", sm: "190px" },
                }}
              >
                {chatId}
              </Typography>
              <Chip
                label={getStatusLabel(status)}
                size="small"
                color={getStatusColor(status)}
                variant="filled"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  height: "22px",
                  minWidth: "fit-content",
                }}
              />
            </Box>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
              <MapPin size={12} color="#6B7280" />
              <Typography
                variant="caption"
                sx={{
                  color: "#6B7280",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: "170px", sm: "260px" },
                }}
              >
                {visitorLocation || "Unknown"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography 
            variant="caption" 
            sx={{ 
              color: "#5F6368", 
              fontWeight: 500,
              fontSize: "0.8rem",
              whiteSpace: "nowrap"
            }}
          >
            {formatDate(startDate)}
          </Typography>
          <IconButton
            size="small"
            onClick={handleExport}
            title="Export transcript as PDF"
            sx={{ 
              color: "#5F6368",
              "&:hover": { bgcolor: "#F0F0F0" },
              p: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Download size={18} />
          </IconButton>
          {onClose ? (
            <IconButton
              size="small"
              onClick={onClose}
              title="Close transcript"
              sx={{
                color: "#5F6368",
                "&:hover": { bgcolor: "#F0F0F0" },
                p: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} />
            </IconButton>
          ) : null}
        </Stack>
      </Box>

      {/* Chat Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          bgcolor: "#F8F9FA",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Chat Started Indicator */}
        <Box sx={{ textAlign: "center", my: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: "#5F6368",
              fontWeight: 700,
              letterSpacing: "0.5px",
              fontSize: "0.7rem",
              textTransform: "uppercase"
            }}
          >
            CHAT STARTED
          </Typography>
        </Box>

        {/* Messages */}
        {messages.map((message, index) => (
          <Box
            key={message.id || index}
            sx={{
              display: "flex",
              justifyContent:
                message.sender === "agent" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            {message.sender === "visitor" && (
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#0B8DB5",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  color: "#FFFFFF",
                }}
              >
                {visitorAvatar}
              </Avatar>
            )}
            
            <Stack
              spacing={0.5}
              alignItems={message.sender === "agent" ? "flex-end" : "flex-start"}
              sx={{ maxWidth: "65%" }}
            >
              <Paper
                elevation={0}
                sx={{
                  px: 2.5,
                  py: 1.25,
                  bgcolor:
                    message.sender === "agent"
                      ? "#2C3E50"
                      : "#FFFFFF",
                  color: message.sender === "agent" ? "#FFFFFF" : "#1F1F1F",
                  border: "none",
                  borderRadius: 1,
                  boxShadow: message.sender === "agent" ? "0 1px 3px rgba(0,0,0,0.12)" : "0 1px 2px rgba(0,0,0,0.06)",
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.5, fontSize: "0.875rem" }}>
                  {message.text}
                </Typography>
              </Paper>
              <Typography
                variant="caption"
                sx={{ 
                  color: "#9AA0A6",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  px: 1
                }}
              >
                {message.timestamp}
              </Typography>
            </Stack>

            {message.sender === "agent" && (
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#5B5F63",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  color: "#FFFFFF",
                }}
              >
                {agentAvatar}
              </Avatar>
            )}
          </Box>
        ))}

        {/* Typing Indicator */}
        {showTypingIndicator && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 1 }}>
            <Stack spacing={0.5} alignItems="flex-end" sx={{ maxWidth: "65%" }}>
              <Paper
                elevation={0}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "#2C3E50",
                  border: "none",
                  borderRadius: 1,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  minHeight: 44,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: 1,
                    bgcolor: "#9AA0A6",
                    animation: "pulse 1.4s infinite",
                  }}
                />
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: 1,
                    bgcolor: "#9AA0A6",
                    animation: "pulse 1.4s infinite",
                    animationDelay: "0.2s",
                  }}
                />
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: 1,
                    bgcolor: "#9AA0A6",
                    animation: "pulse 1.4s infinite",
                    animationDelay: "0.4s",
                  }}
                />
              </Paper>
              <Typography variant="caption" sx={{ color: "#9AA0A6", fontSize: "0.75rem", px: 1 }}>
                {agentName} is typing...
              </Typography>
            </Stack>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#5B5F63",
                fontSize: "0.875rem",
                fontWeight: 700,
                flexShrink: 0,
                color: "#FFFFFF",
              }}
            >
              {agentAvatar}
            </Avatar>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatTranscript;
