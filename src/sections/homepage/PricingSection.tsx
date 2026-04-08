import { Box, Typography, Button, Container, Grid, Dialog, TextField, Stack, IconButton } from "@mui/material";
import { Check, X, Info, CheckCircle2, Loader2, Users, BarChart3, CalendarDays, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGetSubscriptionPlans } from "../../services/subscriptionPlanServices";

const formatPhp = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const getPeriodLabel = (billingCycle: string, interval: number) => {
  if (billingCycle === "monthly" && interval === 1) return "/mo";
  if (billingCycle === "yearly" && interval === 1) return "/yr";

  const unitByCycle: Record<string, string> = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  };

  const unit = unitByCycle[billingCycle] || "day";
  return `/${interval} ${interval === 1 ? unit : `${unit}s`}`;
};

const getBillingCadenceText = (billingCycle: string, interval: number) => {
  const unitByCycle: Record<string, string> = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  };

  const unit = unitByCycle[billingCycle] || "month";
  if (interval <= 1) {
    return `Billed every ${unit}`;
  }

  return `Billed every ${interval} ${unit}s`;
};

const centerMostPopularPlan = <T extends { popular: boolean }>(items: T[]) => {
  const plans = [...items];
  const popularIndex = plans.findIndex((plan) => plan.popular);

  if (popularIndex === -1 || plans.length <= 1) {
    return plans;
  }

  const middleIndex = Math.floor(plans.length / 2);
  const [popularPlan] = plans.splice(popularIndex, 1);
  plans.splice(middleIndex, 0, popularPlan);
  return plans;
};

const teamAvatars = [
  "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczNzU1MzAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzY4NjY2MHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1672675611932-9d722165f0ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3Mzc2NTU4M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1617386124435-9eb3935b1e11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzM4MDA0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczNzY0OTU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
];

const PricingSection = () => {
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { plans: fetchedPlans, isLoading } = useGetSubscriptionPlans();

  const plans = useMemo(() => {
    const postedPlans = fetchedPlans.filter((plan) => plan.isPosted);

    const mappedPlans = postedPlans.map((plan) => ({
      name: plan.name,
      description: plan.description,
      priceValue: Number(plan.price || 0),
      price: formatPhp(plan.price),
      period: getPeriodLabel(plan.billingCycle, plan.interval),
      billingCadence: getBillingCadenceText(plan.billingCycle, plan.interval || 1),
      maxAgents: plan.limits?.maxAgents,
      hasAdvancedAnalytics: Boolean(plan.limits?.hasAdvancedAnalytics),
      features: plan.features,
      buttonText: plan.price === 0 ? "Start Free Trial" : "Get Started",
      buttonVariant: plan.isMostPopular ? "primary" : "light",
      popular: plan.isMostPopular,
      link: `/checkout/${plan._id}`,
    }));

    return centerMostPopularPlan(mappedPlans);
  }, [fetchedPlans]);

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
        {isLoading && (
          <Typography sx={{ color: "#64748BFF", textAlign: "center", mb: 3 }}>
            Loading plans...
          </Typography>
        )}

        <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
          {plans.map((plan) => {
            const isPro = plan.popular;
            const cardBg = isPro ? navyColor : "#FFFFFFFF";
            const textColor = isPro ? "#FFFFFFFF" : navyColor;
            const descColor = isPro ? "#94A3B8FF" : "#64748BFF";
            const checkColor = isPro ? cyanBtnColor : greenCheck;
            const chipBg = isPro ? "#08213D" : "#F1F5F9";
            const chipBorder = isPro ? "#1E3A5F" : "#DBE7F3";
            const chipTitleColor = isPro ? "#93C5FD" : "#64748B";
            const chipValueColor = isPro ? "#FFFFFF" : "#0F172A";
            const visibleFeatures = plan.features;
            const hiddenFeatureCount = Math.max(plan.features.length - visibleFeatures.length, 0);

            return (
              <Grid size={{ xs: 12, md: 4 }} key={plan.name}>
                <Box
                  sx={{
                    position: "relative",
                    bgcolor: cardBg,
                    borderRadius: "24px",
                    p: { xs: 4, md: 5 },
                    pt: isPro ? { xs: 6.5, md: 7 } : { xs: 4, md: 5 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: isPro ? "0 28px 55px #0A192F59" : "0 14px 36px #0F172A14",
                    border: isPro ? "1px solid transparent" : "1px solid #E2E8F0FF",
                    overflow: "hidden",
                    transition: "transform .25s ease, box-shadow .25s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: isPro ? "0 34px 64px #0A192F75" : "0 20px 48px #0F172A1F",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -80,
                      right: -50,
                      width: 220,
                      height: 220,
                      borderRadius: "50%",
                      background: isPro
                        ? "radial-gradient(circle, #22D3EE38 0%, #22D3EE00 70%)"
                        : "radial-gradient(circle, #0EA5E91F 0%, #0EA5E900 70%)",
                      pointerEvents: "none",
                    }}
                  />

                  {isPro && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "14px",
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
                        zIndex: 2,
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

                  <Box sx={{ mb: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                      <Typography
                        sx={{
                          color: textColor,
                          fontWeight: 800,
                          fontSize: { xs: "3rem", md: "3.3rem" },
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

                    <Typography sx={{ color: descColor, fontSize: "0.84rem", fontWeight: 700, fontFamily: "inherit", mt: 0.75 }}>
                      {plan.billingCadence}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mb: 3,
                      p: 1.5,
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: chipBorder,
                      background: isPro ? "linear-gradient(180deg, #0D2747 0%, #0B213D 100%)" : "#F8FAFC",
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 1,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarDays size={15} color={isPro ? "#7DD3FC" : "#0284C7"} />
                      <Typography sx={{ color: chipTitleColor, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                        BILLING
                      </Typography>
                      <Typography sx={{ color: chipValueColor, fontSize: "0.84rem", fontWeight: 800 }}>
                        {plan.priceValue === 0 ? "No upfront payment" : "Cancel anytime"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Users size={15} color={isPro ? "#7DD3FC" : "#0284C7"} />
                      <Typography sx={{ color: chipTitleColor, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                        AGENT LIMIT
                      </Typography>
                      <Typography sx={{ color: chipValueColor, fontSize: "0.84rem", fontWeight: 800 }}>
                        {plan.maxAgents ?? "Unlimited"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BarChart3 size={15} color={isPro ? "#7DD3FC" : "#0284C7"} />
                      <Typography sx={{ color: chipTitleColor, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                        ANALYTICS
                      </Typography>
                      <Typography sx={{ color: chipValueColor, fontSize: "0.84rem", fontWeight: 800 }}>
                        {plan.hasAdvancedAnalytics ? "Advanced included" : "Standard"}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ flexGrow: 1, mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.25 }}>
                      <Sparkles size={15} color={isPro ? "#7DD3FC" : "#0284C7"} />
                      <Typography sx={{ color: isPro ? "#BAE6FD" : "#0369A1", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.04em" }}>
                        INCLUDED FEATURES
                      </Typography>
                    </Stack>

                    <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "flex", flexDirection: "column", gap: 1.1 }}>
                      {visibleFeatures.map((feat) => (
                        <Box
                          component="li"
                          key={feat}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.1,
                            p: 1,
                            borderRadius: "10px",
                            background: isPro ? "#FFFFFF0F" : "#F8FAFC",
                            border: "1px solid",
                            borderColor: isPro ? "#334155" : "#E2E8F0",
                          }}
                        >
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: "9999px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: isPro ? "#0EA5E933" : "#10B98122",
                              flexShrink: 0,
                            }}
                          >
                            <Check color={checkColor} size={14} strokeWidth={3} />
                          </Box>
                          <Typography sx={{ color: isPro ? "#E2E8F0FF" : "#334155FF", fontSize: "0.9rem", fontFamily: "inherit", fontWeight: 600 }}>
                            {feat}
                          </Typography>
                        </Box>
                      ))}

                      {hiddenFeatureCount > 0 && (
                        <Typography sx={{ color: descColor, fontSize: "0.84rem", fontWeight: 700, pt: 0.35, pl: 0.5 }}>
                          +{hiddenFeatureCount} more included
                        </Typography>
                      )}
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

export default PricingSection;


