import { Box, Typography, Button, Container, Grid, Dialog, TextField, Stack, IconButton } from "@mui/material";
import { Check, X, Info, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

const fallbackPlans = [
  {
    name: "Free Trial",
    description: "Try JAF Chatra free for 14 days, no credit card required.",
    price: "$0",
    period: "/14 days",
    features: [
      "1 Agent Seat",
      "14-day chat history",
      "Basic widget customization",
      "Community support"
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "light",
    popular: false,
    link: "/checkout/free-trial",
  },
  {
    name: "Starter",
    description: "Perfect for small projects and personal sites.",
    price: "$12",
    period: "/mo",
    features: [
      "1 Agent Seat",
      "14-day chat history",
      "Basic widget customization",
      "Community support"
    ],
    buttonText: "Get Started",
    buttonVariant: "light",
    popular: false,
    link: "/checkout/starter",
  },
  {
    name: "Pro",
    description: "For growing businesses that need AI power.",
    price: "$29",
    period: "/mo",
    features: [
      "Up to 5 Agent Seats",
      "Unlimited chat history",
      "AI-Powered Drafts",
      "Advanced routing rules",
      "Remove \"Powered by\" branding"
    ],
    buttonText: "Get Started",
    buttonVariant: "primary",
    popular: true,
    link: "/checkout/pro",
  },
];

function loadPlansFromStorage() {
  try {
    const stored = localStorage.getItem("jaf_subscription_plans");
    if (stored) {
      const adminPlans = JSON.parse(stored) as Array<{
        id: string;
        name: string;
        description: string;
        price: string;
        period: string;
        features: Array<{ id: string; text: string }>;
        popular: boolean;
        active: boolean;
      }>;
      const activePlans = adminPlans.filter((p) => p.active);
      if (activePlans.length > 0) {
        // Always prepend the Free Trial card
        const freeTrial = fallbackPlans[0];
        const mapped = activePlans.map((p) => ({
          name: p.name,
          description: p.description,
          price: `$${p.price}`,
          period: p.period,
          features: p.features.map((f) => f.text),
          buttonText: "Get Started",
          buttonVariant: p.popular ? "primary" : "light",
          popular: p.popular,
          link: `/checkout/${p.id}`,
        }));
        return [freeTrial, ...mapped];
      }
    }
  } catch { /* fall through */ }
  return fallbackPlans;
}

const teamAvatars = [
  "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczNzU1MzAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzY4NjY2MHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1672675611932-9d722165f0ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3Mzc2NTU4M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1617386124435-9eb3935b1e11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzM4MDA0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczNzY0OTU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
];

export function PricingSection() {
  const navyColor = "#0A192FFF";
  const cyanBtnColor = "#0EA5E9FF";
  const cyanBtnHover = "#0284C7FF";
  const greenCheck = "#10B981FF";
  const lightGrayBtn = "#F1F5F9FF";
  const lightGrayBtnHover = "#E2E8F0FF";

  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ fullName: "", email: "", company: "", phone: "", message: "" });
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeout2Ref = useRef<NodeJS.Timeout | null>(null);

  const [plans, setPlans] = useState(loadPlansFromStorage);

  // Re-read plans from localStorage when the component mounts or storage changes
  useEffect(() => {
    const handleStorage = () => setPlans(loadPlansFromStorage());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timeout2Ref.current) clearTimeout(timeout2Ref.current);
    };
  }, []);

  const handleContactSubmit = () => {
    setContactSending(true);
    timeoutRef.current = setTimeout(() => {
      setContactSending(false);
      setContactSent(true);
      timeout2Ref.current = setTimeout(() => {
        setContactOpen(false);
        setContactSent(false);
        setContactForm({ fullName: "", email: "", company: "", phone: "", message: "" });
      }, 2500);
    }, 1500);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(180deg, #F0F9FFFF 0%, #FFFFFFFF 100%)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 8, md: 10 }, maxWidth: "800px", mx: "auto" }}>
          <Typography
            variant="h2"
            sx={{
              color: navyColor,
              fontWeight: 800,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              letterSpacing: "-0.02em",
              mb: 2,
              fontFamily: "inherit",
            }}
          >
            Simple, transparent pricing
          </Typography>
          <Typography
            sx={{
              color: "#6B7280FF",
              fontSize: { xs: "1rem", md: "1.25rem" },
              fontFamily: "inherit",
            }}
          >
            Start for free, upgrade when you need more power. No hidden fees.
          </Typography>
        </Box>

        {/* Pricing Cards */}
        <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
          {plans.map((plan) => {
            const isPro = plan.popular;
            const cardBg = isPro ? navyColor : "#FFFFFFFF";
            const textColor = isPro ? "#FFFFFFFF" : navyColor;
            const descColor = isPro ? "#94A3B8FF" : "#64748BFF";
            const checkColor = isPro ? cyanBtnColor : greenCheck;

            return (
              <Grid size={{ xs: 12, md: 4 }} key={plan.name}>
                <Box
                  sx={{
                    position: "relative",
                    bgcolor: cardBg,
                    borderRadius: "24px",
                    p: { xs: 4, md: 5 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: isPro ? "0 20px 40px #0A192F4D" : "0 10px 30px #0000000A",
                    border: isPro ? "1px solid transparent" : "1px solid #E2E8F0FF",
                  }}
                >
                  {isPro && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "-14px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        bgcolor: cyanBtnColor,
                        color: "#FFFFFFFF",
                        px: 3,
                        py: 0.75,
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        boxShadow: "0 4px 6px #0000001A",
                      }}
                    >
                      Most Popular
                    </Box>
                  )}

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        color: textColor,
                        fontWeight: 700,
                        fontSize: "1.5rem",
                        mb: 1,
                        fontFamily: "inherit",
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Typography sx={{ color: descColor, fontSize: "0.875rem", fontFamily: "inherit", minHeight: "42px" }}>
                      {plan.description}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                      <Typography
                        sx={{
                          color: textColor,
                          fontWeight: 800,
                          fontSize: "3.5rem",
                          letterSpacing: "-0.02em",
                          fontFamily: "inherit",
                          lineHeight: 1,
                        }}
                      >
                        {plan.price}
                      </Typography>
                      <Typography sx={{ color: descColor, fontSize: "1rem", fontFamily: "inherit" }}>
                        {plan.period}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ flexGrow: 1, mb: 4 }}>
                    <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
                      {plan.features.map((feat) => (
                        <Box component="li" key={feat} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Check color={checkColor} size={20} strokeWidth={3} style={{ flexShrink: 0 }} />
                          <Typography sx={{ color: isPro ? "#E2E8F0FF" : "#334155FF", fontSize: "0.9rem", fontFamily: "inherit" }}>
                            {feat}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Button
                      component={Link}
                      to={plan.link}
                      fullWidth
                      variant={plan.buttonVariant === "primary" ? "contained" : "outlined"}
                      disableElevation
                      sx={{
                        py: 1.5,
                        borderRadius: "9999px",
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        fontFamily: "inherit",
                        ...(plan.buttonVariant === "primary"
                          ? {
                              bgcolor: cyanBtnColor,
                              color: "#FFFFFFFF",
                              "&:hover": { bgcolor: cyanBtnHover },
                            }
                          : {
                              bgcolor: "#F8FAFCFF",
                              color: navyColor,
                              border: "1px solid #E2E8F0FF",
                              "&:hover": { bgcolor: "#F1F5F9FF", border: "1px solid #E2E8F0FF" },
                            }),
                      }}
                    >
                      {plan.buttonText}
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Contact Sales Dialog */}
        <Dialog
          open={contactOpen}
          onClose={() => !contactSending && setContactOpen(false)}
          maxWidth="md"
          fullWidth
          slotProps={{
            backdrop: {
              sx: {
                pointerEvents: 'none'
              }
            }
          }}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              overflow: "hidden",
              p: 0,
              pointerEvents: 'auto'
            },
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={() => !contactSending && setContactOpen(false)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 10,
              bgcolor: "#F1F5F9FF",
              "&:hover": { bgcolor: "#E2E8F0FF" },
            }}
          >
            <X size={20} />
          </IconButton>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: 520 }}>
            {/* Left side - Form */}
            <Box sx={{ flex: 1, p: { xs: 3, md: 5 }, display: "flex", flexDirection: "column" }}>
              <AnimatePresence mode="wait">
                {contactSent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "auto" }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "#10B98120", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
                        <CheckCircle2 size={48} color="#10B981FF" />
                      </Box>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: "1.75rem", color: navyColor, fontFamily: "inherit", textAlign: "center", mb: 1 }}>
                        Message Sent!
                      </Typography>
                      <Typography sx={{ color: "#64748BFF", fontFamily: "inherit", textAlign: "center" }}>
                        We'll get back to you shortly.
                      </Typography>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", pointerEvents: "auto" }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.25rem" }, color: navyColor, fontFamily: "inherit", mb: 1 }}>
                      Let's talk
                    </Typography>
                    <Typography sx={{ color: "#64748BFF", fontFamily: "inherit", mb: 3, fontSize: "0.95rem" }}>
                      Tell us about yourself and we'll get back to you shortly.
                    </Typography>

                    <Stack spacing={2.5} sx={{ flex: 1, pointerEvents: 'auto', position: 'relative', zIndex: 1 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: navyColor, mb: 0.75, fontFamily: "inherit" }}>Full name</Typography>
                        <TextField
                          placeholder="John Smith"
                          name="fullName"
                          value={contactForm.fullName}
                          onChange={handleContactChange}
                          fullWidth
                          variant="outlined"
                          autoComplete="name"
                          inputProps={{
                            style: { pointerEvents: 'auto', cursor: 'text' }
                          }}
                          slotProps={{
                            input: {
                              readOnly: false,
                              style: { pointerEvents: 'auto', cursor: 'text' }
                            },
                          }}
                          sx={{
                            pointerEvents: 'auto',
                            "& .MuiOutlinedInput-root": {
                              pointerEvents: 'auto',
                              cursor: 'text',
                              borderRadius: "10px",
                              "& fieldset": { borderColor: "#E2E8F0FF", borderTopColor: "#E2E8F0FF", borderRightColor: "#E2E8F0FF", borderBottomColor: "#E2E8F0FF", borderLeftColor: "#E2E8F0FF" },
                              "&:hover fieldset": { borderColor: "#CBD5E1FF", borderTopColor: "#CBD5E1FF", borderRightColor: "#CBD5E1FF", borderBottomColor: "#CBD5E1FF", borderLeftColor: "#CBD5E1FF" },
                              "&.Mui-focused fieldset": { borderColor: cyanBtnColor, borderTopColor: cyanBtnColor, borderRightColor: cyanBtnColor, borderBottomColor: cyanBtnColor, borderLeftColor: cyanBtnColor },
                            },
                            "& .MuiInputBase-input": {
                              pointerEvents: 'auto',
                              cursor: 'text',
                            },
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: navyColor, mb: 0.75, fontFamily: "inherit" }}>Business email</Typography>
                        <TextField
                          placeholder="john@company.com"
                          name="email"
                          value={contactForm.email}
                          onChange={handleContactChange}
                          fullWidth
                          variant="outlined"
                          type="email"
                          autoComplete="email"
                          inputProps={{
                            style: { pointerEvents: 'auto', cursor: 'text' }
                          }}
                          slotProps={{
                            input: {
                              readOnly: false,
                              style: { pointerEvents: 'auto', cursor: 'text' }
                            },
                          }}
                          sx={{
                            pointerEvents: 'auto',
                            "& .MuiOutlinedInput-root": {
                              pointerEvents: 'auto',
                              cursor: 'text',
                              borderRadius: "10px",
                              "& fieldset": { borderColor: "#E2E8F0FF", borderTopColor: "#E2E8F0FF", borderRightColor: "#E2E8F0FF", borderBottomColor: "#E2E8F0FF", borderLeftColor: "#E2E8F0FF" },
                              "&:hover fieldset": { borderColor: "#CBD5E1FF", borderTopColor: "#CBD5E1FF", borderRightColor: "#CBD5E1FF", borderBottomColor: "#CBD5E1FF", borderLeftColor: "#CBD5E1FF" },
                              "&.Mui-focused fieldset": { borderColor: cyanBtnColor, borderTopColor: cyanBtnColor, borderRightColor: cyanBtnColor, borderBottomColor: cyanBtnColor, borderLeftColor: cyanBtnColor },
                            },
                            "& .MuiInputBase-input": {
                              pointerEvents: 'auto',
                              cursor: 'text',
                            },
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: navyColor, mb: 0.75, fontFamily: "inherit" }}>Phone number (Optional)</Typography>
                        <TextField
                          placeholder="+1-XXX XXX XXXX"
                          name="phone"
                          value={contactForm.phone}
                          onChange={handleContactChange}
                          fullWidth
                          variant="outlined"
                          type="tel"
                          autoComplete="tel"
                          inputProps={{
                            style: { pointerEvents: 'auto', cursor: 'text' }
                          }}
                          slotProps={{
                            input: {
                              readOnly: false,
                              style: { pointerEvents: 'auto', cursor: 'text' }
                            },
                          }}
                          sx={{
                            pointerEvents: 'auto',
                            "& .MuiOutlinedInput-root": {
                              pointerEvents: 'auto',
                              cursor: 'text',
                              borderRadius: "10px",
                              "& fieldset": { borderColor: "#E2E8F0FF", borderTopColor: "#E2E8F0FF", borderRightColor: "#E2E8F0FF", borderBottomColor: "#E2E8F0FF", borderLeftColor: "#E2E8F0FF" },
                              "&:hover fieldset": { borderColor: "#CBD5E1FF", borderTopColor: "#CBD5E1FF", borderRightColor: "#CBD5E1FF", borderBottomColor: "#CBD5E1FF", borderLeftColor: "#CBD5E1FF" },
                              "&.Mui-focused fieldset": { borderColor: cyanBtnColor, borderTopColor: cyanBtnColor, borderRightColor: cyanBtnColor, borderBottomColor: cyanBtnColor, borderLeftColor: cyanBtnColor },
                            },
                            "& .MuiInputBase-input": {
                              pointerEvents: 'auto',
                              cursor: 'text',
                            },
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: navyColor, mb: 0.75, fontFamily: "inherit" }}>
                          Additional information{" "}
                          <Info size={14} style={{ verticalAlign: "middle", opacity: 0.5 }} />
                        </Typography>
                        <TextField
                          placeholder="Tell us about your industry, challenges, needs"
                          name="message"
                          value={contactForm.message}
                          onChange={handleContactChange}
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          inputProps={{
                            style: { pointerEvents: 'auto', cursor: 'text' }
                          }}
                          slotProps={{
                            input: {
                              readOnly: false,
                              style: { pointerEvents: 'auto', cursor: 'text' }
                            },
                          }}
                          sx={{
                            pointerEvents: 'auto',
                            "& .MuiOutlinedInput-root": {
                              pointerEvents: 'auto',
                              cursor: 'text',
                              borderRadius: "10px",
                              "& fieldset": { borderColor: "#E2E8F0FF", borderTopColor: "#E2E8F0FF", borderRightColor: "#E2E8F0FF", borderBottomColor: "#E2E8F0FF", borderLeftColor: "#E2E8F0FF" },
                              "&:hover fieldset": { borderColor: "#CBD5E1FF", borderTopColor: "#CBD5E1FF", borderRightColor: "#CBD5E1FF", borderBottomColor: "#CBD5E1FF", borderLeftColor: "#CBD5E1FF" },
                              "&.Mui-focused fieldset": { borderColor: cyanBtnColor, borderTopColor: cyanBtnColor, borderRightColor: cyanBtnColor, borderBottomColor: cyanBtnColor, borderLeftColor: cyanBtnColor },
                            },
                            "& .MuiInputBase-input": {
                              pointerEvents: 'auto',
                              cursor: 'text',
                            },
                          }}
                        />
                      </Box>
                    </Stack>

                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleContactSubmit}
                        fullWidth
                        variant="contained"
                        disableElevation
                        disabled={contactSending || !contactForm.fullName || !contactForm.email}
                        sx={{
                          mt: 3,
                          py: 1.75,
                          borderRadius: "10px",
                          textTransform: "none",
                          fontSize: "1rem",
                          fontWeight: 700,
                          fontFamily: "inherit",
                          bgcolor: navyColor,
                          color: "#FFFFFFFF",
                          "&:hover": { bgcolor: "#1E293BFF" },
                          "&.Mui-disabled": { bgcolor: "#94A3B8FF", color: "#FFFFFFFF" },
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {contactSending ? (
                            <motion.div
                              key="sending"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              style={{ display: "flex", alignItems: "center", gap: 8 }}
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              >
                                <Loader2 size={20} />
                              </motion.div>
                              Sending...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="request"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              Request a call
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>

                    <Typography sx={{ mt: 2, fontSize: "0.75rem", color: "#94A3B8FF", textAlign: "center", fontFamily: "inherit" }}>
                      By signing up, you say "yes" to receive our marketing materials in the future and agree to our <span style={{ textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>.
                    </Typography>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>

            {/* Right side - Info panel */}
            <Box
              sx={{
                flex: 1,
                bgcolor: "#F8FAFCFF",
                p: { xs: 3, md: 5 },
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative dots */}
              {[
                { top: "10%", right: "8%", size: 8 },
                { top: "25%", right: "3%", size: 6 },
                { top: "45%", right: "5%", size: 10 },
                { bottom: "30%", right: "10%", size: 5 },
                { bottom: "15%", right: "6%", size: 7 },
                { bottom: "8%", right: "15%", size: 9 },
              ].map((dot, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "absolute",
                    ...dot,
                    width: dot.size,
                    height: dot.size,
                    borderRadius: "50%",
                    bgcolor: "#CBD5E1FF",
                  }}
                />
              ))}

              <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: navyColor, fontFamily: "inherit", mb: 4 }}>
                What can you expect?
              </Typography>

              <Stack spacing={3}>
                {[
                  "Discuss your use case and individual needs with our Sales Team",
                  "Discover how our products can strengthen your customer relationships and increase revenue",
                  "Find out how others in your industry are leveraging JAF Chatra",
                ].map((text, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flexShrink: 0, mt: 0.25 }}>
                      <Check size={22} color="#10B981FF" strokeWidth={3} />
                    </Box>
                    <Typography sx={{ color: "#334155FF", fontSize: "0.95rem", fontFamily: "inherit", lineHeight: 1.6 }}>
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ mt: 5 }}>
                <Typography sx={{ color: "#64748BFF", fontSize: "0.9rem", fontFamily: "inherit", mb: 2 }}>
                  Our Sales Team is ready to help you
                </Typography>
                <Box sx={{ display: "flex" }}>
                  {teamAvatars.map((src, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={src}
                      alt={`Team member ${i + 1}`}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid #FFFFFFFF",
                        borderTopColor: "#FFFFFFFF",
                        borderRightColor: "#FFFFFFFF",
                        borderBottomColor: "#FFFFFFFF",
                        borderLeftColor: "#FFFFFFFF",
                        ml: i > 0 ? -1.5 : 0,
                        boxShadow: "0 2px 8px #0000001A",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
}