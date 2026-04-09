import { Box, Container, Typography, Card, CardContent, Grid, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { BookOpen, MessageCircle, Settings, Shield, ChevronRight, Mail, Phone, Headphones, ChevronDown, HelpCircle } from "lucide-react";
import { Link } from "react-router";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import React from "react";
import PageTitle from "../../../components/common/PageTitle";

const HelpCenterPage = () => {
  const categories = [
    { icon: <BookOpen size={24} />, title: "Getting Started", desc: "Basic setup and installation guides", path: "/documentation" },
    { icon: <Settings size={24} />, title: "Account & Settings", desc: "Manage your workspace and billing", path: "/documentation" },
    { icon: <MessageCircle size={24} />, title: "Chat Widget", desc: "Customize your customer experience", path: "/documentation" },
    { icon: <Shield size={24} />, title: "Security", desc: "Privacy, compliance, and data", path: "/documentation" },
  ];

  const popularArticles = [
    "How to install JAF Chatra on WordPress",
    "Setting up operating hours",
    "Inviting team members",
    "Customizing the chat widget colors",
    "Understanding the billing cycle",
  ];

  return (
    <React.Fragment>
      <PageTitle
        title="Help Center"
        description="Find answers to common questions, access guides, and get support for JAF Chatra."
        canonical="/portal/help-center"

      />
      <Navbar />
      <Box sx={{ pt: { xs: 12, md: 16 }, pb: 12, bgcolor: "#F8FAFCFF", minHeight: "100vh" }}>
        {/* Hero Section */}
        <Box sx={{ bgcolor: "#0A192FFF", color: "#FFFFFFFF", py: 10, px: 2, textAlign: "center", mb: -8, borderRadius: 0 }}>
          <Container maxWidth="md">
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontFamily: "Inter, sans-serif" }}>
              How can we help?
            </Typography>
            <Typography sx={{ color: "#94A3B8FF", maxWidth: "560px", mx: "auto", lineHeight: 1.7 }}>
              Browse our guides, FAQs, and resources to find answers — or reach out to our support team anytime.
            </Typography>

          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 16 }}>
          {/* Categories */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {categories.map((cat, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Card
                  component={Link}
                  to={cat.path}
                  sx={{
                    height: "100%",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0FF",
                    boxShadow: "0 4px 6px -1px #0000000A",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 15px -3px #0000001A",
                      borderColor: "#00838FFF",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "#E0F2F1FF", color: "#00838FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {cat.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172AFF" }}>
                      {cat.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748BFF" }}>
                      {cat.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Popular Articles */}
          <Box sx={{ bgcolor: "#FFFFFFFF", p: { xs: 4, md: 6 }, borderRadius: "24px", border: "1px solid #E2E8F0FF" }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0A192FFF", mb: 4 }}>
              Popular Articles
            </Typography>
            <Grid container spacing={3}>
              {popularArticles.map((article, idx) => (
                <Grid size={{ xs: 12, md: 6 }} key={idx}>
                  <Box
                    component={Link}
                    to="/documentation"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 3,
                      borderRadius: "12px",
                      border: "1px solid #F1F5F9FF",
                      textDecoration: "none",
                      color: "#0F172AFF",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#F8FAFCFF",
                        borderColor: "#E2E8F0FF",
                        color: "#00838FFF",
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>{article}</Typography>
                    <ChevronRight size={20} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* FAQs Section */}
          <Box sx={{ mt: 8, bgcolor: "#FFFFFFFF", p: { xs: 4, md: 6 }, borderRadius: "24px", border: "1px solid #E2E8F0FF" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "#E0F2F1FF", color: "#00838FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HelpCircle size={24} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0A192FFF" }}>
                  Frequently Asked Questions
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748BFF", mt: 0.5 }}>
                  Quick answers to common questions about JAF Chatra.
                </Typography>
              </Box>
            </Box>

            {[
              {
                q: "What is JAF Chatra and how does it work?",
                a: "JAF Chatra is a real-time live chat platform that lets you connect with your website visitors instantly. Simply add our lightweight widget to your site, and your support agents can start chatting with customers from the admin dashboard."
              },
              {
                q: "How do I install the chat widget on my website?",
                a: "You can install JAF Chatra by copying a small JavaScript snippet into your website's HTML, or by using one of our integrations for WordPress, Shopify, Wix, and other popular platforms. Detailed instructions are available in our Getting Started guide."
              },
              {
                q: "Can I customize the appearance of the chat widget?",
                a: "Yes! You can fully customize the widget's colors, position, welcome messages, and branding from the Widget Settings page in your dashboard. You can match it to your brand identity with just a few clicks."
              },
              {
                q: "What's the difference between the Free, Pro, and Enterprise plans?",
                a: "The Free plan includes 1 agent and basic chat features. Pro adds unlimited agents, analytics, chat history, and priority support. Enterprise includes everything in Pro plus SSO, custom integrations, a dedicated account manager, and SLA guarantees."
              },
              {
                q: "How does agent assignment work?",
                a: "JAF Chatra supports both automatic and manual chat assignment. In automatic mode, incoming chats are distributed evenly among available agents. In manual mode, admins can assign specific chats to specific agents from the queue."
              },
              {
                q: "Is my data secure with JAF Chatra?",
                a: "Absolutely. We use end-to-end encryption for all chat communications, and our infrastructure is SOC 2 Type II compliant. We also support GDPR compliance features and offer data residency options for Enterprise customers."
              },
              {
                q: "Can I access chat transcripts and history?",
                a: "Yes. All chat conversations are automatically saved and accessible from the Chat History section in your dashboard. You can search, filter, and export transcripts at any time."
              },
              {
                q: "Do you offer a free trial?",
                a: "Yes! We offer a 14-day free trial of the Pro plan with no credit card required. You can explore all premium features before deciding on a plan."
              },
            ].map((faq, idx) => (
              <Accordion
                key={idx}
                disableGutters
                elevation={0}
                sx={{
                  border: "1px solid #F1F5F9FF",
                  borderRadius: "12px !important",
                  mb: 2,
                  "&:before": { display: "none" },
                  "&.Mui-expanded": {
                    borderColor: "#00838F33",
                    boxShadow: "0 4px 12px #00838F0A",
                  },
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDown size={20} color="#64748BFF" />}
                  sx={{
                    px: 3,
                    py: 1,
                    "& .MuiAccordionSummary-content": { my: 1.5 },
                    "&:hover": { bgcolor: "#F8FAFCFF" },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: "#0F172AFF" }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Typography sx={{ color: "#64748BFF", lineHeight: 1.7 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>

        {/* Contact / Still Need Help Section */}
        <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
          <Box sx={{ bgcolor: "#0A192FFF", borderRadius: "24px", p: { xs: 4, md: 8 }, textAlign: "center", color: "#FFFFFFFF" }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
              Still need help?
            </Typography>
            <Typography sx={{ color: "#94A3B8FF", mb: 5, maxWidth: "500px", mx: "auto", lineHeight: 1.7 }}>
              Our support team is available 24/7 to assist you. Choose the channel that works best for you.
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ bgcolor: "#1E293BFF", borderRadius: "16px", p: 4, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.2s", "&:hover": { bgcolor: "#334155FF", transform: "translateY(-2px)" } }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "#00838F1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail size={24} color="#00BCD4" />
                  </Box>
                  <Typography sx={{ fontWeight: 700 }}>Email Us</Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8FF" }}>
                    support@jafchatra.com
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  onClick={() => window.dispatchEvent(new CustomEvent("open-live-chat"))}
                  sx={{ bgcolor: "#1E293BFF", borderRadius: "16px", p: 4, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: "#334155FF", transform: "translateY(-2px)" } }}
                >
                  <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "#00838F1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Headphones size={24} color="#00BCD4" />
                  </Box>
                  <Typography sx={{ fontWeight: 700 }}>Start Chat</Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8FF" }}>
                    Chat with us live now
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ bgcolor: "#1E293BFF", borderRadius: "16px", p: 4, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.2s", "&:hover": { bgcolor: "#334155FF", transform: "translateY(-2px)" } }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "#00838F1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Phone size={24} color="#00BCD4" />
                  </Box>
                  <Typography sx={{ fontWeight: 700 }}>Call Us</Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8FF" }}>
                    +1 (800) 555-0199
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
      <Footer />
    </React.Fragment>
  );
}

export default HelpCenterPage;




