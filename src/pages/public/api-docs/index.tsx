import React, { useState } from "react";
import { Box, Container, Typography, Grid, Paper, Stack, Chip } from "@mui/material";
import { Code, Key, Info, Sparkles, ShieldCheck, Copy, CheckCircle2 } from "lucide-react";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import PageTitle from "../../../components/common/PageTitle";
import IntegrationGuideSwitcher from "../../../components/IntegrationGuideSwitcher";

const gettingStartedItems = [{ icon: <Key size={18} />, label: "Authentication" }];
const resourceItems = [{ icon: <Code size={18} />, label: "Developers" }];

function InfoBanner({
  icon,
  text,
  bgColor,
  borderColor,
  textColor,
  iconColor,
}: {
  icon: React.ReactNode;
  text: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}) {
  return (
    <Box
      sx={{
        mt: 4,
        p: 3,
        bgcolor: bgColor,
        borderRadius: 3,
        border: `1px solid ${borderColor}`,
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
      }}
    >
      <Box sx={{ color: iconColor, flexShrink: 0, mt: 0.25 }}>{icon}</Box>
      <Typography sx={{ color: textColor, fontWeight: 500, lineHeight: 1.7 }}>{text}</Typography>
    </Box>
  );
}

const ApiDocsPage = () => {
  const [activeSection, setActiveSection] = useState("Authentication");

  return (
    <React.Fragment>
      <PageTitle
        title="API & Developers"
        description="Build custom integrations, automate workflows, and extend JAF Chatra with our powerful REST API and Webhooks."
        canonical="/portal/api-docs"
      />
      <Navbar isDarkBackground />

      <Box sx={{ pb: 12, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
        <Box sx={{ bgcolor: "#0A192F", color: "#FFF", pt: { xs: 16, md: 20 }, pb: { xs: 8, md: 12 }, borderBottom: "1px solid #1E293B" }}>
          <Container maxWidth="md">
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Chip
                icon={<Sparkles size={16} />}
                label="Public API"
                sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "#E2E8F0", fontWeight: 700 }}
              />
              <Typography variant="h2" sx={{ fontWeight: 800, fontFamily: "Inter, sans-serif" }}>
                API & Developers
              </Typography>
              <Typography variant="h6" sx={{ color: "#94A3B8", fontWeight: 400, maxWidth: 760 }}>
                Build custom integrations, automate workflows, and extend JAF Chatra with a clean, production-ready public integration experience.
              </Typography>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  position: { md: "sticky" },
                  top: { md: 112 },
                }}
              >
                <Typography variant="overline" sx={{ fontWeight: 800, color: "#64748B", mb: 1.5, display: "block" }}>
                  Getting Started
                </Typography>
                {gettingStartedItems.map((item) => (
                  <Box
                    key={item.label}
                    onClick={() => setActiveSection(item.label)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      cursor: "pointer",
                      color: activeSection === item.label ? "#0891B2" : "#475569",
                      bgcolor: activeSection === item.label ? "#E0F2FE" : "transparent",
                      transition: "all 160ms ease",
                      mb: 0.5,
                      "&:hover": { bgcolor: activeSection === item.label ? "#E0F2FE" : "#F1F5F9" },
                    }}
                  >
                    {item.icon}
                    <Typography sx={{ fontWeight: activeSection === item.label ? 700 : 500 }}>{item.label}</Typography>
                  </Box>
                ))}

                <Typography variant="overline" sx={{ fontWeight: 800, color: "#64748B", mb: 1.5, mt: 3, display: "block" }}>
                  Resources
                </Typography>
                {resourceItems.map((item) => (
                  <Box
                    key={item.label}
                    onClick={() => setActiveSection(item.label)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      cursor: "pointer",
                      color: activeSection === item.label ? "#0891B2" : "#475569",
                      bgcolor: activeSection === item.label ? "#E0F2FE" : "transparent",
                      transition: "all 160ms ease",
                      "&:hover": { bgcolor: activeSection === item.label ? "#E0F2FE" : "#F1F5F9" },
                    }}
                  >
                    {item.icon}
                    <Typography sx={{ fontWeight: activeSection === item.label ? 700 : 500 }}>{item.label}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              {activeSection === "Authentication" ? (
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "#FFF",
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <Stack spacing={1.5} sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#0A192F" }}>
                      Authentication
                    </Typography>
                    <Typography sx={{ color: "#475569", lineHeight: 1.7, maxWidth: 760 }}>
                      Use the JAF Chatra widget script with your API key to connect the public website widget to your workspace.
                    </Typography>
                  </Stack>

                  <IntegrationGuideSwitcher />

                  <InfoBanner
                    icon={<ShieldCheck size={20} />}
                    text="Keep your API keys secure. Never expose them in public repositories or client-side source files."
                    bgColor="#ECFDF5"
                    borderColor="#A7F3D0"
                    textColor="#065F46"
                    iconColor="#10B981"
                  />
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "#FFF",
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <Stack spacing={1.5} sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#0A192F" }}>
                      Developers
                    </Typography>
                    <Typography sx={{ color: "#475569", lineHeight: 1.7, maxWidth: 760 }}>
                      Use our SDKs and helper tools to build on top of JAF Chatra with clean, maintainable integrations.
                    </Typography>
                  </Stack>

                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                      { title: "Node.js SDK", meta: "Stable", accent: "#059669", bg: "#ECFDF5" },
                      { title: "React Widget", meta: "Stable", accent: "#0891B2", bg: "#ECFEFF" },
                      { title: "Webhooks", meta: "Stable", accent: "#7C3AED", bg: "#F5F3FF" },
                      { title: "CLI Tool", meta: "Beta", accent: "#D97706", bg: "#FFFBEB" },
                    ].map((item) => (
                      <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 2.25,
                            borderRadius: 3,
                            border: "1px solid #E2E8F0",
                            bgcolor: "#FAFAFA",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>{item.title}</Typography>
                            <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>{item.meta}</Typography>
                          </Box>
                          <Chip
                            label={item.meta}
                            size="small"
                            sx={{ bgcolor: item.bg, color: item.accent, fontWeight: 700 }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <InfoBanner
                    icon={<Info size={20} />}
                    text="Need help getting started? Reach out to devrel@jafchatra.com for integration support and implementation guidance."
                    bgColor="#EFF6FF"
                    borderColor="#BFDBFE"
                    textColor="#1E40AF"
                    iconColor="#2563EB"
                  />
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </React.Fragment>
  );
};

export default ApiDocsPage;
