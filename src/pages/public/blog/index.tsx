import { Box, Container, Typography, Card, CardMedia, CardContent, Chip, Grid } from "@mui/material";
import { Clock, ArrowRight, LayoutDashboard, BarChart3, Users, ListOrdered, MessageSquare, Settings, Building2, Crown, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import LiveChatWidget from "../../../components/widgets/LiveChatWidget";
import React from "react";
import PageTitle from "../../../components/common/PageTitle";

const imgDashboard = "https://images.unsplash.com/photo-1693045181288-87092e30f862?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZG1pbiUyMGRhc2hib2FyZCUyMG92ZXJ2aWV3JTIwYW5hbHl0aWNzJTIwY2FyZHN8ZW58MXx8fHwxNzczNzI2NDgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgAnalytics = "https://images.unsplash.com/photo-1723987251277-18fc0a1effd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzJTIwY2hhcnRzJTIwbWV0cmljc3xlbnwxfHx8fDE3NzM3MjY0ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgAgents = "https://images.unsplash.com/photo-1586076100131-32505c71d0d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWFuYWdlbWVudCUyMGFnZW50cyUyMGxpc3R8ZW58MXx8fHwxNzczNzI2NDgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgQueue = "https://images.unsplash.com/photo-1665118439231-94386140c62a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHF1ZXVlJTIwd2FpdGluZyUyMGxpc3QlMjBzdXBwb3J0fGVufDF8fHx8MTc3MzcyNjQ4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgChatSessions = "https://images.unsplash.com/photo-1725798451557-fc60db3eb6a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY2hhdCUyMG1lc3NhZ2luZyUyMGludGVyZmFjZXxlbnwxfHx8fDE3NzM3MjY0ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgWidgetSettings = "https://images.unsplash.com/photo-1652715564391-38cc4475b7f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXR0aW5ncyUyMGNvbmZpZ3VyYXRpb24lMjBwYW5lbCUyMHNvZnR3YXJlfGVufDF8fHx8MTc3MzcyNjQ4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgCompanyInfo = "https://images.unsplash.com/photo-1763479169474-728a7de108c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwcHJvZmlsZSUyMGJ1c2luZXNzJTIwaW5mb3JtYXRpb258ZW58MXx8fHwxNzczNzI2NDgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const imgSubscriptionPlans = "https://images.unsplash.com/photo-1726443221540-5dca672c4d2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWJzY3JpcHRpb24lMjBwcmljaW5nJTIwcGxhbnMlMjBTYWFTfGVufDF8fHx8MTc3MzcyNjQ4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const BlogPage = () => {
  const posts = [
    {
      title: "How to Build a World-Class Support Team",
      excerpt: "Learn the essential skills and hiring practices needed to build a customer support team that scales with your SaaS business.",
      category: "Guides",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1653212883731-4d5bc66e0181?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHN1cHBvcnQlMjB0ZWFtfGVufDF8fHx8MTc3MzcwNzczNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      date: "Oct 15, 2025"
    },
    {
      title: "Optimizing Your Workspace for Remote Work",
      excerpt: "Discover the best tools and setups for maintaining productivity and communication across distributed teams.",
      category: "Tips",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1763191213523-1489179a1088?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwbW9kZXJuJTIwb2ZmaWNlJTIwZGVza3xlbnwxfHx8fDE3NzM3MTc0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      date: "Oct 08, 2025"
    },
    {
      title: "Using Analytics to Decrease Resolution Time",
      excerpt: "A deep dive into measuring support metrics and using data to resolve customer queries faster than ever.",
      category: "Analytics",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1664223308156-3d374ea8d7eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzJTIwbGFwdG9wfGVufDF8fHx8MTc3MzcxNzQ2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      date: "Sep 29, 2025"
    }
  ];

  const tutorialSteps = [
    {
      step: 1,
      icon: <LayoutDashboard size={24} />,
      title: "Dashboard",
      subtitle: "Your command center",
      description: "The Dashboard is your home base. At a glance, see active chats, online visitors, and queue count. Quick-action cards let you jump straight to the live queue, chat assignments, analytics, or chat history — no hunting through menus.",
      image: imgDashboard,
      tip: "Check in here every morning to see overnight activity and prioritize your day."
    },
    {
      step: 2,
      icon: <BarChart3 size={24} />,
      title: "Analytics",
      subtitle: "Performance at a glance",
      description: "Track total conversations, resolution rate, average response time, and satisfaction score over the last 7 days. The Conversation Volume chart shows daily trends, while the Channel breakdown reveals whether traffic is coming from live chat, email, or widget. Use Peak Chat Hours to staff your busiest periods.",
      image: imgAnalytics,
      tip: "Export weekly reports to share with stakeholders and identify improvement areas."
    },
    {
      step: 3,
      icon: <Users size={24} />,
      title: "Agents",
      subtitle: "Manage your team",
      description: "View all support agents in one table — their email, online/offline status, and total chats handled. Add new agents, edit profiles, or remove team members. The summary cards at the top give you a quick count of total agents, who's currently online, and today's handled chats.",
      image: imgAgents,
      tip: "Keep agent profiles up to date so routing rules and reports stay accurate."
    },
    {
      step: 4,
      icon: <ListOrdered size={24} />,
      title: "Queue",
      subtitle: "Real-time visitor management",
      description: "The Customer Queue shows every visitor waiting for an agent. Toggle between Automatic (round robin, least busy, first available) and Manual assignment modes. Each queue entry displays the visitor's message, wait time, and status. Pick up visitors directly or assign them to specific agents.",
      image: imgQueue,
      tip: "Switch to Manual mode during high-traffic periods so senior agents can handle complex queries first."
    },
    {
      step: 5,
      icon: <MessageSquare size={24} />,
      title: "Chat Sessions",
      subtitle: "Active conversations & history",
      description: "Chat Session Management is split into two tabs: Active Chats shows all ongoing conversations with a searchable sidebar, while Chat History lets you review past transcripts. When the active list is empty, a prompt guides you to the Queue to pick up new visitors.",
      image: imgChatSessions,
      tip: "Use the search bar to quickly find conversations by visitor name or keyword."
    },
    {
      step: 6,
      icon: <Settings size={24} />,
      title: "Widget Settings",
      subtitle: "Customize your chat widget",
      description: "Control every aspect of your live chat widget — from theme color and text size to position, dark mode, and agent photo visibility. Configure welcome messages, offline messages, and widget title under Messages. Toggle behavior options like auto-open, sounds, push notifications, quick messages, typing indicator, and file uploads.",
      image: imgWidgetSettings,
      tip: "Match your widget's theme color to your brand for a seamless visitor experience."
    },
    {
      step: 7,
      icon: <Building2 size={24} />,
      title: "Company Info",
      subtitle: "Your organization profile",
      description: "Keep your company details accurate and up to date. Edit your company name, website, contact email, phone number, and full address. This information appears in automated emails, invoices, and your public-facing support pages.",
      image: imgCompanyInfo,
      tip: "Update this immediately after rebranding or changing office locations."
    },
    {
      step: 8,
      icon: <Crown size={24} />,
      title: "Subscription Plans",
      subtitle: "Manage pricing tiers",
      description: "Create and edit the subscription plans displayed on your pricing page. Each plan card shows the name, description, price, and feature list. Mark plans as popular, add or remove features, and save all changes at once. Changes sync to your public pricing section in real time.",
      image: imgSubscriptionPlans,
      tip: "Use the 'Popular' badge on your mid-tier plan to guide most customers toward it."
    }
  ];

  return (
    <React.Fragment>
       <PageTitle
        title="Blog & Guides"
        description="Insights, tutorials, and best practices for delivering exceptional customer experiences."
        canonical="/portal/blog"

      />
      <Navbar />
      <Box sx={{ pt: { xs: 12, md: 16 }, pb: 12, bgcolor: "#F8FAFCFF", minHeight: "100vh" }}>
        <Box sx={{ bgcolor: "#0A192FFF", color: "#FFFFFFFF", py: { xs: 8, md: 12 }, textAlign: "center", borderBottom: "1px solid #1E293B" }}>
          <Container maxWidth="md">
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontFamily: "Inter, sans-serif" }}>
              Blog & Guides
            </Typography>
            <Typography variant="h6" sx={{ color: "#94A3B8FF", fontWeight: 400, maxWidth: "600px", mx: "auto" }}>
              Insights, tutorials, and best practices for delivering exceptional customer experiences.
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Grid container spacing={4}>
            {posts.map((post, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "24px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "none",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                      borderColor: "#00838FFF",
                    }
                  }}
                >
                  <Box sx={{ position: "relative", height: 240, overflow: "hidden" }}>
                    <img
                      src={post.image}
                      alt={post.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <Chip
                      label={post.category}
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        bgcolor: "#FFFFFFFF",
                        color: "#00838FFF",
                        fontWeight: 700,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "#64748BFF", mb: 2, fontSize: "0.85rem", fontWeight: 500 }}>
                      <Typography component="span">{post.date}</Typography>
                      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#CBD5E1FF" }} />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Clock size={14} />
                        <Typography component="span">{post.readTime}</Typography>
                      </Box>
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172AFF", mb: 2, lineHeight: 1.3 }}>
                      {post.title}
                    </Typography>

                    <Typography sx={{ color: "#475569FF", mb: 4, flexGrow: 1 }}>
                      {post.excerpt}
                    </Typography>

                    <Box
                      component={Link}
                      to="/documentation"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#00838FFF",
                        fontWeight: 700,
                        textDecoration: "none",
                        "&:hover": { color: "#006064FF", gap: 1.5, transition: "all 0.2s" }
                      }}
                    >
                      Read Article <ArrowRight size={18} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Admin Tour Guide Section */}
        <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Chip
              label="Step-by-Step Tutorial"
              sx={{
                bgcolor: "#0891B21A",
                color: "#0891B2",
                fontWeight: 700,
                mb: 3,
                fontSize: "0.85rem",
                px: 1
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#0A192FFF", mb: 2 }}>
              Admin Dashboard Tour
            </Typography>
            <Typography sx={{ color: "#64748BFF", maxWidth: "650px", mx: "auto", fontSize: "1.1rem" }}>
              Get to know every module in your admin sidebar. Follow this guided walkthrough to master JAF Chatra's dashboard in minutes.
            </Typography>
          </Box>

          {/* Timeline */}
          <Box sx={{ position: "relative" }}>
            {/* Vertical line */}
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "2px",
                bgcolor: "#E2E8F0FF",
                transform: "translateX(-50%)"
              }}
            />

            {tutorialSteps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <Box
                  key={step.step}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: isEven ? "row" : "row-reverse" },
                    alignItems: { md: "center" },
                    mb: 8,
                    position: "relative"
                  }}
                >
                  {/* Step number badge on timeline */}
                  <Box
                    sx={{
                      display: { xs: "none", md: "flex" },
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "#0891B2",
                      color: "#FFFFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      zIndex: 2,
                      boxShadow: "0 4px 14px rgba(8,145,178,0.25)",
                      border: "4px solid #F8FAFC"
                    }}
                  >
                    {step.step}
                  </Box>

                  {/* Content side */}
                  <Box
                    sx={{
                      width: { xs: "100%", md: "45%" },
                      pr: { md: isEven ? 6 : 0 },
                      pl: { md: isEven ? 0 : 6 },
                      textAlign: { md: isEven ? "right" : "left" }
                    }}
                  >
                    <Box
                      sx={{
                        display: { xs: "flex", md: "none" },
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "#0891B2",
                        color: "#FFFFFFFF",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        mb: 2
                      }}
                    >
                      {step.step}
                    </Box>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#0891B2",
                        mb: 1
                      }}
                    >
                      {step.icon}
                      <Typography sx={{ fontWeight: 700, color: "#0891B2", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Step {step.step}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#0A192FFF", mb: 0.5 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ color: "#64748BFF", mb: 2, fontWeight: 500, fontStyle: "italic" }}>
                      {step.subtitle}
                    </Typography>
                    <Typography sx={{ color: "#475569FF", mb: 3, lineHeight: 1.7 }}>
                      {step.description}
                    </Typography>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: "#F0FDFA",
                        color: "#0E7490",
                        px: 2,
                        py: 1,
                        borderRadius: "12px",
                        border: "1px solid #99F6E4",
                        fontSize: "0.875rem"
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0E7490" }}>
                        Pro tip:
                      </Typography>
                      <Typography sx={{ fontSize: "0.875rem", color: "#0E7490" }}>
                        {step.tip}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Spacer for timeline */}
                  <Box sx={{ width: { md: "10%" }, display: { xs: "none", md: "block" } }} />

                  {/* Image side */}
                  <Box
                    sx={{
                      width: { xs: "100%", md: "45%" },
                      mt: { xs: 3, md: 0 }
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 10px 30px -5px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                          transform: "translateY(-4px)"
                        }
                      }}
                    >
                      <img
                        src={step.image}
                        alt={`${step.title} module screenshot`}
                        style={{ width: "100%", height: "auto", display: "block" }}
                      />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* CTA at the bottom */}

        </Container>
      </Box>
      <Footer />
      <LiveChatWidget />
    </React.Fragment>
  );
}

export default BlogPage;




