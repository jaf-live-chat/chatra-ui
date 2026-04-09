import { Box, Container, Typography, Paper, Grid } from "@mui/material";
import { CheckCircle2, Activity, Server, Database, Globe } from "lucide-react";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import React from "react";
import PageTitle from "../../../components/common/PageTitle";

const SystemStatusPage = () => {
  const services = [
    { name: "Chat Widget Delivery", icon: <Globe size={20} />, status: "Operational", uptime: "99.99%" },
    { name: "Agent Dashboard", icon: <Activity size={20} />, status: "Operational", uptime: "99.98%" },
    { name: "REST API", icon: <Server size={20} />, status: "Operational", uptime: "100%" },
    { name: "Database & Storage", icon: <Database size={20} />, status: "Operational", uptime: "99.99%" },
  ];

  return (
    <React.Fragment>
      <PageTitle
        title="System Status"
        description="Real-time information about JAF Chatra services and infrastructure."
        canonical="/portal/system-status"

      />
      <Navbar />
      <Box sx={{ pt: { xs: 12, md: 16 }, pb: 12, bgcolor: "#F8FAFCFF", minHeight: "100vh" }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, color: "#0A192FFF", mb: 3, fontFamily: "Inter, sans-serif" }}>
              System Status
            </Typography>
            <Typography variant="h6" sx={{ color: "#64748BFF", fontWeight: 400 }}>
              Real-time information about JAF Chatra services and infrastructure.
            </Typography>
          </Box>

          {/* Global Status Banner */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 6,
              borderRadius: "24px",
              bgcolor: "#ECFDF5FF",
              border: "1px solid #A7F3D0FF",
              display: "flex",
              alignItems: "center",
              gap: 3
            }}
          >
            <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#D1FAE5FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CheckCircle2 color="#10B981FF" size={32} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#065F46FF", mb: 0.5 }}>
                All Systems Operational
              </Typography>
              <Typography sx={{ color: "#047857FF", fontWeight: 500 }}>
                Last updated: just now.
              </Typography>
            </Box>
          </Paper>

          {/* Services List */}
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172AFF", mb: 3 }}>
            Services
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {services.map((service, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "#FFFFFFFF",
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "#CBD5E1FF" }
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Box sx={{ color: "#64748BFF" }}>{service.icon}</Box>
                  <Typography sx={{ fontWeight: 600, color: "#0F172AFF", fontSize: "1.1rem" }}>
                    {service.name}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "flex-end" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748BFF", fontWeight: 500 }}>Uptime (90 days)</Typography>
                    <Typography sx={{ fontWeight: 700, color: "#0F172AFF" }}>{service.uptime}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: "#10B981FF" }}>{service.status}</Typography>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#10B981FF", boxShadow: "0 0 0 3px #ECFDF5FF" }} />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* Uptime Bar Graph Mock */}
          <Box sx={{ mt: 8, p: 4, bgcolor: "#FFFFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0FF" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography sx={{ fontWeight: 600, color: "#0F172AFF" }}>Past 90 Days</Typography>
              <Typography sx={{ fontWeight: 600, color: "#10B981FF" }}>99.99% Uptime</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: "2px", height: 40 }}>
              {Array.from({ length: 90 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    bgcolor: "#10B981FF",
                    borderRadius: "2px",
                    opacity: Math.random() > 0.95 ? 0.6 : 1, // Random visual variation to make it look realistic
                  }}
                />
              ))}
            </Box>
          </Box>

        </Container>
      </Box>
      <Footer />
    </React.Fragment>
  );
}

export default SystemStatusPage;




