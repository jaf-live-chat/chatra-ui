import { Box, Container, Typography, Card, CardContent, Grid } from "@mui/material";
import { Code, Key, CheckCircle2, Copy, Check, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router";
import React, { useState } from "react";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import LiveChatWidget from "../../../components/widgets/LiveChatWidget";
import PageTitle from "../../../components/common/PageTitle";

function CodeBlock({ lines, filename, onCopy, copied }: { lines: string[]; filename: string; onCopy: () => void; copied: boolean }) {
  return (
    <Card sx={{ bgcolor: "#0F172AFF", color: "#F8FAFCFF", borderRadius: "16px", border: "1px solid #1E293BFF", overflow: "hidden" }}>
      <CardContent sx={{ p: 0 }}>
        {/* macOS Window Chrome */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.5, borderBottom: "1px solid #1E293BFF" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#EF4444FF" }} />
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#EAB308FF" }} />
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#22C55EFF" }} />
          </Box>
          <Typography sx={{ fontFamily: "monospace", color: "#94A3B8FF", fontSize: "0.8rem" }}>
            {filename}
          </Typography>
          <Box
            onClick={onCopy}
            sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", color: "#94A3B8FF", "&:hover": { color: "#CBD5E1FF" }, transition: "color 0.2s" }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <Typography sx={{ fontSize: "0.8rem" }}>
              {copied ? "Copied!" : "Copy"}
            </Typography>
          </Box>
        </Box>

        {/* Code Block with Line Numbers */}
        <Box sx={{ display: "flex", overflowX: "auto", p: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", pr: 2.5, borderRight: "1px solid #1E293BFF", mr: 2.5, userSelect: "none" }}>
            {lines.map((_, i) => (
              <Typography key={i} sx={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#475569FF", lineHeight: "1.7", textAlign: "right", minWidth: "1.5em" }}>
                {i + 1}
              </Typography>
            ))}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {lines.map((line, i) => (
              <Typography key={i} component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem", lineHeight: "1.7", whiteSpace: "pre", m: 0, color: "#E2E8F0FF" }}>
                {line || "\u00A0"}
              </Typography>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function InfoBanner({ icon, text, bgColor, borderColor, textColor, iconColor }: { icon: React.ReactNode; text: string; bgColor: string; borderColor: string; textColor: string; iconColor: string }) {
  return (
    <Box sx={{ mt: 4, p: 3, bgcolor: bgColor, borderRadius: "12px", border: `1px solid ${borderColor}`, display: "flex", gap: 2, alignItems: "flex-start" }}>
      <Box sx={{ color: iconColor, flexShrink: 0, mt: 0.25 }}>{icon}</Box>
      <Typography sx={{ color: textColor, fontWeight: 500 }}>{text}</Typography>
    </Box>
  );
}

function ParamTable({ params }: { params: { name: string; type: string; desc: string; required?: boolean }[] }) {
  return (
    <Box sx={{ border: "1px solid #E2E8F0FF", borderRadius: "12px", overflow: "hidden", mb: 4 }}>
      <Box sx={{ display: "flex", bgcolor: "#F8FAFCFF", px: 3, py: 1.5, borderBottom: "1px solid #E2E8F0FF" }}>
        <Typography sx={{ flex: 1, fontWeight: 700, color: "#475569FF", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Parameter</Typography>
        <Typography sx={{ flex: 1, fontWeight: 700, color: "#475569FF", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</Typography>
        <Typography sx={{ flex: 2, fontWeight: 700, color: "#475569FF", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</Typography>
      </Box>
      {params.map((p, i) => (
        <Box key={i} sx={{ display: "flex", px: 3, py: 2, borderBottom: i < params.length - 1 ? "1px solid #E2E8F0FF" : "none", alignItems: "center" }}>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.9rem", color: "#0A192FFF", fontWeight: 600 }}>{p.name}</Typography>
            {p.required && (
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#DC2626FF", bgcolor: "#FEF2F2FF", px: 0.75, py: 0.25, borderRadius: "4px" }}>REQ</Typography>
            )}
          </Box>
          <Typography sx={{ flex: 1, fontFamily: "monospace", fontSize: "0.85rem", color: "#0891B2FF" }}>{p.type}</Typography>
          <Typography sx={{ flex: 2, fontSize: "0.9rem", color: "#475569FF" }}>{p.desc}</Typography>
        </Box>
      ))}
    </Box>
  );
}

const ApiDocsPage = () => {
  const codeLines = [
    `<!-- Live Chat Widget -->`,
    `<script>`,
    `  window.LiveChatConfig = {`,
    `    apiUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev/api/v1',`,
    `    socketUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev'`,
    `  };`,
    `</script>`,
    ``,
    `<script src="https://timora-live-chat.vercel.app/widget/live-chat-widget.js"></script>`,
  ];

  const developersCodeLines = [
    `// Install the JAF Chatra SDK`,
    `npm install @jafchatra/sdk`,
    ``,
    `// Initialize the SDK`,
    `import { JafChatra } from '@jafchatra/sdk';`,
    ``,
    `const client = new JafChatra({`,
    `  apiKey: process.env.JAF_CHATRA_API_KEY,`,
    `  environment: 'production'`,
    `});`,
    ``,
    `// Listen for events`,
    `client.on('message', (msg) => {`,
    `  console.log('New message:', msg);`,
    `});`,
  ];

  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("Authentication");

  const handleCopyLines = (lines: string[]) => {
    const text = lines.join("\n");
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gettingStartedItems = [
    { icon: <Key size={18} />, label: "Authentication" },
  ];

  const resourceItems = [
    { icon: <Code size={18} />, label: "Developers" },
  ];

  return (
    <React.Fragment>
         <PageTitle
        title="API & Developers"
        description="Build custom integrations, automate workflows, and extend JAF Chatra with our powerful REST API and Webhooks."
        canonical="/portal/api-docs"

      />
      <Navbar />
      <Box sx={{ pt: { xs: 12, md: 16 }, pb: 12, bgcolor: "#F8FAFCFF", minHeight: "100vh" }}>
        <Box sx={{ bgcolor: "#0A192FFF", color: "#FFFFFFFF", py: { xs: 8, md: 12 }, textAlign: "center", borderBottom: "1px solid #1E293BFF" }}>
          <Container maxWidth="md">
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontFamily: "Inter, sans-serif" }}>
              API & Developers
            </Typography>
            <Typography variant="h6" sx={{ color: "#94A3B8FF", fontWeight: 400, mb: 4, maxWidth: "600px", mx: "auto" }}>
              Build custom integrations, automate workflows, and extend JAF Chatra with our powerful REST API and Webhooks.
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              {/* Nav Menu */}
              <Box sx={{ position: "static", display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: "#64748BFF", mb: 2 }}>
                  Getting Started
                </Typography>
                {gettingStartedItems.map((item) => (
                  <Box
                    key={item.label}
                    onClick={() => setActiveSection(item.label)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: "8px", cursor: "pointer",
                      "&:hover": { bgcolor: activeSection === item.label ? "#E0F2F1FF" : "#E2E8F0FF" },
                      color: activeSection === item.label ? "#00838FFF" : "#475569FF",
                      bgcolor: activeSection === item.label ? "#E0F2F1FF" : "transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.icon}
                    <Typography sx={{ fontWeight: activeSection === item.label ? 600 : 500 }}>{item.label}</Typography>
                  </Box>
                ))}

                <Typography variant="overline" sx={{ fontWeight: 700, color: "#64748BFF", mb: 2, mt: 4 }}>
                  Resources
                </Typography>
                {resourceItems.map((item) => (
                  <Box
                    key={item.label}
                    onClick={() => setActiveSection(item.label)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: "8px", cursor: "pointer",
                      "&:hover": { bgcolor: activeSection === item.label ? "#E0F2F1FF" : "#E2E8F0FF" },
                      color: activeSection === item.label ? "#00838FFF" : "#475569FF",
                      bgcolor: activeSection === item.label ? "#E0F2F1FF" : "transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.icon}
                    <Typography sx={{ fontWeight: activeSection === item.label ? 600 : 500 }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              {/* ═══ Authentication ═══ */}
              {activeSection === "Authentication" && (
                <Box sx={{ bgcolor: "#FFFFFFFF", p: { xs: 4, md: 6 }, borderRadius: "24px", border: "1px solid #E2E8F0FF", mb: 8 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: "#0A192FFF", mb: 4 }}>
                    Authentication
                  </Typography>
                  <Typography sx={{ color: "#475569FF", mb: 4, fontSize: "1.1rem", lineHeight: 1.6 }}>
                    The JAF Chatra API uses API keys to authenticate requests. You can view and manage your API keys in the Dashboard under Workspace Settings.
                  </Typography>
                  <CodeBlock lines={codeLines} filename="index.html" onCopy={() => handleCopyLines(codeLines)} copied={copied} />

                  {/* Footer Message */}
                  <Box sx={{ bgcolor: "#0B1120FF", display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 2, borderRadius: "0 0 16px 16px", mt: "-1px", border: "1px solid #1E293BFF", borderTop: "none" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22C55EFF", flexShrink: 0 }} />
                    <Typography sx={{ color: "#94A3B8FF", fontSize: "0.85rem" }}>
                      Paste this snippet before the {"</body>"} tag on your website.
                    </Typography>
                  </Box>

                  <InfoBanner
                    icon={<CheckCircle2 size={20} />}
                    text="Keep your API keys secure. Do not share them in publicly accessible areas such as GitHub, client-side code, etc."
                    bgColor="#ECFDF5FF"
                    borderColor="#A7F3D0FF"
                    textColor="#065F46FF"
                    iconColor="#10B981FF"
                  />
                </Box>
              )}

              {/* ═══ Developers ═══ */}
              {activeSection === "Developers" && (
                <Box sx={{ bgcolor: "#FFFFFFFF", p: { xs: 4, md: 6 }, borderRadius: "24px", border: "1px solid #E2E8F0FF", mb: 8 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: "#0A192FFF", mb: 2 }}>
                    Developers
                  </Typography>
                  <Typography sx={{ color: "#475569FF", mb: 4, fontSize: "1.1rem", lineHeight: 1.6 }}>
                    Everything you need to build, test, and deploy integrations with JAF Chatra. Access our SDK, CLI tools, sandbox environment, and community resources.
                  </Typography>

                  {/* SDK & Tools */}
                  <Typography sx={{ fontWeight: 700, color: "#0A192FFF", mb: 2, fontSize: "1.05rem" }}>
                    SDK & Tools
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mb: 4 }}>
                    {[
                      { name: "Node.js SDK", version: "v2.4.1", status: "Stable", color: "#059669FF", bg: "#ECFDF5FF" },
                      { name: "Python SDK", version: "v1.8.0", status: "Stable", color: "#059669FF", bg: "#ECFDF5FF" },
                      { name: "React Components", version: "v3.1.2", status: "Stable", color: "#059669FF", bg: "#ECFDF5FF" },
                      { name: "CLI Tool", version: "v1.2.0", status: "Beta", color: "#D97706FF", bg: "#FFFBEBFF" },
                    ].map((sdk) => (
                      <Box key={sdk.name} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #E2E8F0FF", bgcolor: "#FAFAFAFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: "#0A192FFF", fontSize: "0.95rem" }}>{sdk.name}</Typography>
                          <Typography sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748BFF" }}>{sdk.version}</Typography>
                        </Box>
                        <Box sx={{ px: 1.5, py: 0.5, borderRadius: "6px", bgcolor: sdk.bg }}>
                          <Typography sx={{ fontFamily: "monospace", fontWeight: 700, color: sdk.color, fontSize: "0.75rem" }}>{sdk.status}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <CodeBlock lines={developersCodeLines} filename="setup.js" onCopy={() => handleCopyLines(developersCodeLines)} copied={copied} />

                  {/* Developer Resources */}
                  <Typography sx={{ fontWeight: 700, color: "#0A192FFF", mt: 5, mb: 2, fontSize: "1.05rem" }}>
                    Developer Resources
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 4 }}>
                    {[
                      { title: "Sandbox Environment", desc: "Test your integration in a safe environment with mock data and no rate limits." },
                      { title: "API Changelog", desc: "Stay up-to-date with the latest API changes, deprecations, and new features." },
                      { title: "Community Forum", desc: "Connect with other developers, share tips, and get help from the JAF Chatra team." },
                      { title: "GitHub Examples", desc: "Browse open-source example projects and starter templates on GitHub." },
                    ].map((r) => (
                      <Box key={r.title} sx={{ display: "flex", alignItems: "flex-start", gap: 2, p: 2.5, borderRadius: "10px", border: "1px solid #E2E8F0FF", bgcolor: "#FAFAFAFF" }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#0891B2FF", flexShrink: 0, mt: 1 }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: "#0A192FFF", fontSize: "0.95rem" }}>{r.title}</Typography>
                          <Typography sx={{ color: "#64748BFF", fontSize: "0.85rem", mt: 0.5 }}>{r.desc}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <InfoBanner
                    icon={<Info size={20} />}
                    text="Need help getting started? Join our Developer Slack community or reach out to devrel@jafchatra.com for partnership and integration support."
                    bgColor="#EFF6FFFF"
                    borderColor="#BFDBFEFF"
                    textColor="#1E40AFFF"
                    iconColor="#2563EBFF"
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
      <LiveChatWidget />
    </React.Fragment>
  );
}

export default ApiDocsPage;




