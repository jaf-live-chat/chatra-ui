import { Box, Container, Typography, Chip, Paper, Grid } from "@mui/material";
import { Clock, Star, Zap, Wrench } from "lucide-react";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import React from "react";
import PageTitle from "../../../components/common/PageTitle";

const ChangelogPage = () => {
  const updates = [
    {
      version: "v2.4.0",
      date: "October 12, 2025",
      title: "Advanced AI Routing & Analytics Dashboard",
      type: "feature",
      desc: "We're excited to introduce AI-based chat routing, which analyzes customer intent before connecting them to an agent.",
      bullets: ["AI Intent Detection", "Real-time Agent Analytics", "Export CSV for chat sessions"],
      icon: <Star color="#00838FFF" size={24} />,
      color: "success"
    },
    {
      version: "v2.3.5",
      date: "September 28, 2025",
      title: "Performance improvements and bug fixes",
      type: "improvement",
      desc: "A series of minor updates to improve widget loading speeds across mobile devices.",
      bullets: ["Reduced widget bundle size by 15%", "Fixed issue with unread badge alignment", "Improved typing indicators"],
      icon: <Zap color="#F59E0BFF" size={24} />,
      color: "warning"
    },
    {
      version: "v2.3.0",
      date: "September 10, 2025",
      title: "Custom Widget Themes",
      type: "feature",
      desc: "You can now completely customize the appearance of your chat widget using our new visual builder.",
      bullets: ["Custom CSS support", "New pre-built themes (Dark, Modern, Classic)", "Avatar customization"],
      icon: <Wrench color="#3B82F6FF" size={24} />,
      color: "info"
    }
  ];

  return (
    <React.Fragment>
      <PageTitle
        title="Changelog"
        description="Discover the latest updates, features, and improvements in JAF Chatra. See what's new and what's coming next."
        canonical="/portal/changelog"

      />
      <Navbar transparentBg="dark" />
      <Box sx={{ pb: 12, bgcolor: "#F8FAFCFF", minHeight: "100vh" }}>
        <Box sx={{ bgcolor: "#0A192FFF", color: "#FFFFFFFF", pt: { xs: 16, md: 20 }, pb: { xs: 8, md: 12 }, textAlign: "center", borderBottom: "1px solid #1E293BFF" }}>
          <Container maxWidth="md">
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontFamily: "Inter, sans-serif" }}>
              Changelog
            </Typography>
            <Typography variant="h6" sx={{ color: "#94A3B8FF", fontWeight: 400, maxWidth: "600px", mx: "auto" }}>
              New updates and improvements to JAF Chatra. See what we've been working on.
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Box sx={{ position: "relative" }}>
            {/* Vertical Timeline Line */}
            <Box sx={{ position: "absolute", top: 0, bottom: 0, left: { xs: 20, md: 40 }, width: "2px", bgcolor: "#E2E8F0FF", zIndex: 0 }} />

            {updates.map((update, idx) => (
              <Box key={idx} sx={{ position: "relative", mb: 8, pl: { xs: 8, md: 12 } }}>
                {/* Icon / Node */}
                <Box sx={{
                  position: "absolute",
                  top: 0,
                  left: { xs: 8, md: 28 },
                  width: 24,
                  height: 24,
                  bgcolor: "#FFFFFFFF",
                  borderRadius: "50%",
                  border: "4px solid #00838FFF",
                  zIndex: 1
                }} />

                {/* Date */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748BFF", mb: 2 }}>
                  <Clock size={16} />
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>
                    {update.date}
                  </Typography>
                </Box>

                {/* Content Card */}
                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: "24px", border: "1px solid #E2E8F0FF" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172AFF", flex: 1 }}>
                      {update.title}
                    </Typography>
                    <Chip
                      label={update.version}
                      size="small"
                      sx={{ bgcolor: "#E0F2F1FF", color: "#00838FFF", fontWeight: 700 }}
                    />
                    <Chip
                      label={update.type.toUpperCase()}
                      size="small"
                      color={update.color as any}
                      sx={{ fontWeight: 700, borderRadius: "6px" }}
                    />
                  </Box>

                  <Typography sx={{ color: "#475569FF", mb: 4, fontSize: "1.05rem", lineHeight: 1.6 }}>
                    {update.desc}
                  </Typography>

                  <Box component="ul" sx={{ pl: 3, color: "#475569FF", mb: 0 }}>
                    {update.bullets.map((b, i) => (
                      <Box component="li" key={i} sx={{ mb: 1 }}>
                        <Typography>{b}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
      <Footer />
    </React.Fragment>
  );
}

export default ChangelogPage;




