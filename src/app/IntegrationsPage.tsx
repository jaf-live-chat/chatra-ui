import { Box, Container, Typography, Grid, Chip, Avatar, Card, CardContent, Divider, Stack } from "@mui/material";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LiveChatWidget } from "./components/LiveChatWidget";
import { 
  Building2, 
  Hexagon, 
  Mountain, 
  Rocket, 
  Shield, 
  Target, 
  Zap,
  Globe,
  Briefcase,
  Star,
  Quote
} from "lucide-react";

export function IntegrationsPage() {
  const partners = [
    { name: "TechNova", icon: Hexagon, color: "#0891b2", category: "E-Commerce", revenue: "$10M+", users: "50k+" },
    { name: "CloudBase", icon: Globe, color: "#164e63", category: "SaaS", revenue: "$5M+", users: "10k+" },
    { name: "Streamly", icon: Zap, color: "#f59e0b", category: "Media", revenue: "$2M+", users: "100k+" },
    { name: "Growthify", icon: Target, color: "#10b981", category: "Marketing", revenue: "$1M+", users: "5k+" },
    { name: "Nextera", icon: Shield, color: "#6366f1", category: "Fintech", revenue: "$50M+", users: "200k+" },
    { name: "LaunchPad", icon: Rocket, color: "#ec4899", category: "Startup", revenue: "$500k+", users: "1k+" },
    { name: "PeakWorks", icon: Mountain, color: "#8b5cf6", category: "Enterprise", revenue: "$100M+", users: "1M+" },
    { name: "BuildCorp", icon: Building2, color: "#64748b", category: "Construction", revenue: "$20M+", users: "500+" },
    { name: "ProServe", icon: Briefcase, color: "#f43f5e", category: "Consulting", revenue: "$5M+", users: "10k+" },
  ];

  const testimonials = [
    {
      quote: "JAF Chatra has completely transformed how we interact with our customers. The response time dropped by 80%, and our sales have skyrocketed.",
      author: "Sarah Jenkins",
      title: "Head of Support, TechNova",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    },
    {
      quote: "The seamless integration with our existing tools meant we were up and running in minutes. It's the most reliable chat solution we've ever used.",
      author: "Michael Chang",
      title: "CTO, CloudBase",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    },
    {
      quote: "We love the modern interface and the powerful features. Our agents are happier, and our customers are getting the help they need faster.",
      author: "Emily Rodriguez",
      title: "VP of Customer Success, Growthify",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    }
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default", pt: 10 }}>
      <Navbar />
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            bgcolor: "#0A192FFF", 
            color: "#FFFFFFFF",
            py: { xs: 8, md: 12 },
            textAlign: "center",
            borderColor: "#1E293BFF #1E293BFF #1E293BFF #1E293BFF",
            borderStyle: "solid",
            borderWidth: "0 0 1px 0",
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontFamily: "Inter, sans-serif" }}>
              Trusted by innovative companies worldwide
            </Typography>
            <Typography variant="h6" sx={{ color: "#94A3B8FF", fontWeight: 400, maxWidth: "600px", mx: "auto", lineHeight: 1.6 }}>
              Join thousands of businesses that use JAF Chatra to connect with their customers, drive sales, and build lasting relationships.
            </Typography>
          </Container>
        </Box>

        {/* Logo Grid Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              Meet our partners
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "600px", mx: "auto", fontSize: "1.1rem" }}>
              From fast-growing startups to established enterprises, see who's powering their customer experience with us.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {partners.map((partner, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 40px -10px #0000001a"
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                      <Box 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: 2, 
                          bgcolor: `${partner.color}15`, 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          color: partner.color
                        }}
                      >
                        <partner.icon size={24} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {partner.name}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">Industry</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{partner.category}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">Revenue Impact</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>{partner.revenue}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">Active Users</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{partner.users}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Testimonials Section */}
        <Box sx={{ bgcolor: "grey.50", py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
                What our customers say
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "600px", mx: "auto", fontSize: "1.1rem" }}>
                Don't just take our word for it. Hear directly from the teams who use JAF Chatra every day.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                  <Card elevation={0} sx={{ height: "100%", p: 4, position: "relative" }}>
                    <Quote 
                      size={48} 
                      color="#0891b2" 
                      style={{ position: "absolute", top: 24, right: 24, opacity: 0.1 }} 
                    />
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={0.5}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={16} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </Stack>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 4, 
                        fontSize: "1.1rem", 
                        lineHeight: 1.6, 
                        fontStyle: "italic",
                        color: "text.primary",
                        flexGrow: 1
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={testimonial.avatar} alt={testimonial.author} sx={{ width: 48, height: 48 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {testimonial.author}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.title}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>

      <Footer />
      <LiveChatWidget />
    </Box>
  );
}