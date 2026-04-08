import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import {
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Lock,
  Building2,
  FileText,
  Clock3,
  BookOpen,
  Zap,
  CheckCircle2,
  Sparkles,
  CalendarClock,
  Gauge,
} from "lucide-react";

import { useGetSinglePlan, useGetSubscriptionPlans } from "../../../services/subscriptionPlanServices";
import Payments from "../../../services/paymentServices";
import { Button as AppButton } from "../../../components/Button";
import { Alert, AlertDescription, AlertTitle } from "../../../components/Alert";
import type { CreatePaymentCheckoutResponse } from "../../../models/PaymentModel";
import PageTitle from "../../../components/common/PageTitle";

type CheckoutPlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  features: string[];
  limits?: {
    maxAgents?: number;
    hasAdvancedAnalytics?: boolean;
  };
};

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const steps = ["Account Information", "Summary"];

const slugifyPlanName = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatBillingPeriod = (billingCycle: CheckoutPlan["billingCycle"], interval: number) => {
  const unitByCycle = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  } as const;

  const unit = unitByCycle[billingCycle] || "day";
  if (interval > 1) {
    return `/${interval} ${unit}s`;
  }

  return `/${unit}`;
};

const getPlanIcon = (slug: string) => {
  if (slug.includes("free") || slug.includes("trial")) {
    return <Clock3 size={26} />;
  }
  if (slug.includes("starter")) {
    return <BookOpen size={26} />;
  }
  return <Zap size={26} />;
};

const normalizeCheckoutResponse = (response: CreatePaymentCheckoutResponse) => {
  const responseRecord = response as unknown as Record<string, unknown>;

  const tenantId =
    response.tenant ||
    response.tenantId ||
    (typeof responseRecord.tenant_id === "string" ? responseRecord.tenant_id : "") ||
    "";

  const subscriptionId =
    response.subscription ||
    response.subscriptionId ||
    (typeof responseRecord.subscription_id === "string" ? responseRecord.subscription_id : "") ||
    "";

  const paymentReference =
    response.paymentReference ||
    response.reference ||
    response.referenceNumber ||
    (typeof responseRecord.reference_number === "string" ? responseRecord.reference_number : "") ||
    "";

  const paymentRequestId =
    (typeof responseRecord.paymentRequestId === "string" ? responseRecord.paymentRequestId : "") ||
    (typeof responseRecord.payment_request_id === "string" ? responseRecord.payment_request_id : "") ||
    "";

  return {
    ...response,
    tenantId,
    subscriptionId,
    paymentReference,
    paymentRequestId,
  };
};

const Checkout = () => {
  const theme = useTheme();
  const { planId } = useParams();
  const navigate = useNavigate();
  const { plans: fetchedPlans, isLoading: isPlansLoading } = useGetSubscriptionPlans();

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [accountInfo, setAccountInfo] = useState({
    companyName: "",
    fullName: "",
    companyCode: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [accountErrors, setAccountErrors] = useState({
    companyName: "",
    fullName: "",
    companyCode: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const plans = useMemo<CheckoutPlan[]>(() => {
    return fetchedPlans.map((plan) => ({
      id: plan?._id,
      slug: slugifyPlanName(plan?.name) || plan?._id,
      name: plan?.name,
      description: plan?.description || "Subscription plan",
      price: Number(plan?.price || 0),
      billingCycle: plan?.billingCycle,
      interval: plan?.interval || 1,
      features: plan?.features?.length ? plan?.features : ["Standard support"],
      limits: plan?.limits,
    }));
  }, [fetchedPlans]);

  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === planId || p.slug === planId) || plans[0];
  }, [plans, planId]);

  const selectedPlanIdForDetails = useMemo(() => {
    const hasDirectId = /^[a-f0-9]{24}$/i.test(planId || "");
    if (hasDirectId) {
      return planId;
    }
    return selectedPlan?.id;
  }, [planId, selectedPlan?.id]);

  const { plan: singlePlan, isLoading: isSinglePlanLoading } = useGetSinglePlan(selectedPlanIdForDetails);

  const displayedPlan = useMemo<CheckoutPlan | undefined>(() => {
    if (singlePlan?._id) {
      return {
        id: singlePlan._id,
        slug: slugifyPlanName(singlePlan.name) || singlePlan._id,
        name: singlePlan.name,
        description: singlePlan.description || "Subscription plan",
        price: Number(singlePlan.price || 0),
        billingCycle: singlePlan.billingCycle,
        interval: singlePlan.interval || 1,
        features: singlePlan.features?.length ? singlePlan.features : ["Standard support"],
        limits: singlePlan.limits,
      };
    }

    return selectedPlan;
  }, [selectedPlan, singlePlan]);

  const isFreePlanSelected =
    Number(displayedPlan?.price || 0) === 0 ||
    displayedPlan?.slug?.includes("free") ||
    displayedPlan?.slug?.includes("trial");

  const selectedPlanPrice = pesoFormatter.format(Number(displayedPlan?.price || 0));
  const selectedPlanPeriod = formatBillingPeriod(
    displayedPlan?.billingCycle || "monthly",
    displayedPlan?.interval || 1
  );

  const checkoutPayload = useMemo(
    () => ({
      subscriptionData: {
        companyName: accountInfo.companyName,
        companyCode: accountInfo.companyCode,
        subscriptionPlanId: displayedPlan?.id || "",
        subscriptionStart: new Date().toISOString(),
      },
      agentData: {
        fullName: accountInfo.fullName,
        emailAddress: accountInfo.email,
        password: accountInfo.password,
      },
    }),
    [
      accountInfo.companyCode,
      accountInfo.companyName,
      accountInfo.email,
      accountInfo.fullName,
      accountInfo.password,
      displayedPlan?.id,
    ]
  );

  const handleAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { companyName: "", fullName: "", companyCode: "", email: "", password: "", confirmPassword: "" };
    let hasError = false;

    if (accountInfo.companyName.trim().length < 2) {
      errors.companyName = "Please enter your company name";
      hasError = true;
    }
    if (accountInfo.fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name";
      hasError = true;
    }
    if (accountInfo.companyCode.trim().length < 2) {
      errors.companyCode = "Please enter a valid company code";
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountInfo.email)) {
      errors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (accountInfo.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      hasError = true;
    }

    if (accountInfo.password !== accountInfo.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    setAccountErrors(errors);
    if (hasError) {
      return;
    }

    setActiveStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    setIsProcessing(true);

    try {
      const rawResponse = await Payments.createCheckout(checkoutPayload);
      const response = normalizeCheckoutResponse(rawResponse);

      if (response.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }

      const shouldBypassHitpay =
        Boolean(response.isHitpayBypassed) ||
        (Boolean(response.success) && isFreePlanSelected && Boolean(response.tenantId || response.subscriptionId || response.paymentReference));

      const shouldProceedToSetup =
        Boolean(response.success) &&
        !response.checkoutUrl &&
        (isFreePlanSelected || shouldBypassHitpay);

      if (shouldProceedToSetup) {
        const setupContext = {
          tenantId: response.tenantId || "",
          subscriptionId: response.subscriptionId || "",
          tenantEmail: response.tenantEmail || "",
          companyName: accountInfo.companyName || "",
          welcomeName: accountInfo.fullName || "",
          planName: response.planName || displayedPlan?.name || "",
          planPrice: selectedPlanPrice || "",
          billingPeriod: selectedPlanPeriod || "",
          integrationName: "Web Chat Widget + REST API",
          reference: response.paymentReference || "",
          paymentRequestId: response.paymentRequestId || "",
        };
        sessionStorage.setItem("checkoutSetupContext", JSON.stringify(setupContext));

        const query = new URLSearchParams();
        if (setupContext.tenantId) {
          query.set("tenantId", setupContext.tenantId);
        }
        if (setupContext.subscriptionId) {
          query.set("subscriptionId", setupContext.subscriptionId);
        }
        if (setupContext.tenantEmail) {
          query.set("tenantEmail", setupContext.tenantEmail);
        }
        if (setupContext.companyName) {
          query.set("companyName", setupContext.companyName);
        }
        if (setupContext.welcomeName) {
          query.set("welcomeName", setupContext.welcomeName);
        }
        if (setupContext.planName) {
          query.set("planName", setupContext.planName);
        }
        if (setupContext.planPrice) {
          query.set("planPrice", setupContext.planPrice);
        }
        if (setupContext.billingPeriod) {
          query.set("billingPeriod", setupContext.billingPeriod);
        }
        if (setupContext.integrationName) {
          query.set("integrationName", setupContext.integrationName);
        }
        if (setupContext.reference) {
          query.set("reference", setupContext.reference);
        }
        if (setupContext.paymentRequestId) {
          query.set("paymentRequestId", setupContext.paymentRequestId);
        }

        const queryString = query.toString();
        const setupUrl = queryString ? `/setup?${queryString}` : "/setup";

        // Use hard navigation to avoid route blocking while mutation state is settling.
        window.location.assign(setupUrl);
        return;
      }

      setCheckoutError(response.message || "Unable to start checkout. Please try again.");
    } catch (error: any) {
      setCheckoutError(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to start checkout. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <React.Fragment>
      <PageTitle
        title="Checkout"
        description="Complete your purchase and get started with JAF Chatra."
        canonical="/portal/checkout"

      />
      <div style={{ display: "contents" }}>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "grey.50",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <Box
            component="main"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Box
              sx={{
                flex: { xs: "none", md: 1 },
                bgcolor: "#0B1426",
                color: "white",
                p: { xs: 4, md: 6, lg: 8 },
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "radial-gradient(circle at 0% 0%, #1E3A8A40 0%, transparent 50%)",
                  pointerEvents: "none",
                }}
              />

              <Box sx={{ position: "relative", zIndex: 1, maxWidth: 480, mx: "auto", width: "100%" }}>
                <Box
                  onClick={() => navigate("/pricing")}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#FFFFFFB3",
                    cursor: "pointer",
                    mb: { xs: 4, md: 6 },
                    transition: "color 0.2s",
                    "&:hover": { color: "#FFFFFFFF" },
                  }}
                >
                  <ArrowLeft size={20} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Back
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: { xs: 6, md: 8 } }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      bgcolor: "#0EA5E9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
                    JAF Chatra
                  </Typography>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2, fontSize: { xs: "2.5rem", md: "3.5rem" } }}>
                  Your subscription,<br />clearly defined.
                </Typography>
                <Typography variant="body1" sx={{ color: "#94A3B8", mb: 6, fontSize: "1.1rem", lineHeight: 1.6 }}>
                  Review everything included in your selected plan before completing checkout.
                </Typography>

                <Box sx={{ bgcolor: "#1E293B", p: 4, borderRadius: 4, border: "1px solid #334155" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box sx={{ color: "#22D3EE", display: "inline-flex" }}>
                        {getPlanIcon(displayedPlan?.slug || "")}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: "#94A3B8", lineHeight: 1.2 }}>
                          Selected Subscription
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                          {displayedPlan?.name || "Plan"}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      size="small"
                      label={isSinglePlanLoading ? "Syncing..." : "Live plan data"}
                      sx={{
                        bgcolor: "#0C4A6E",
                        color: "#BAE6FD",
                        borderColor: "#38BDF8",
                        borderWidth: 1,
                        borderStyle: "solid",
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.4px" }}>
                      {selectedPlanPrice}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                      {selectedPlanPeriod}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" sx={{ color: "#CBD5E1", mb: 2.5, lineHeight: 1.6 }}>
                    {displayedPlan?.description || "Everything you need to launch and scale your support workflow."}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 1,
                      mb: 2.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarClock size={15} color="#38BDF8" />
                      <Typography variant="caption" sx={{ color: "#E2E8F0" }}>
                        Billing cadence: {displayedPlan?.interval || 1} {displayedPlan?.billingCycle || "monthly"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Gauge size={15} color="#38BDF8" />
                      <Typography variant="caption" sx={{ color: "#E2E8F0" }}>
                        Max agents: {displayedPlan?.limits?.maxAgents || "Unlimited"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Sparkles size={15} color="#38BDF8" />
                      <Typography variant="caption" sx={{ color: "#E2E8F0" }}>
                        Advanced analytics: {displayedPlan?.limits?.hasAdvancedAnalytics ? "Included" : "Standard"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ShieldCheck size={15} color="#38BDF8" />
                      <Typography variant="caption" sx={{ color: "#E2E8F0" }}>
                        Secure 256-bit encrypted checkout
                      </Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ borderTop: "1px solid #334155", pt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: "#94A3B8", mb: 1, fontWeight: 700 }}>
                      Included Features
                    </Typography>
                    <Stack spacing={0.75}>
                      {(displayedPlan?.features?.length ? displayedPlan.features : ["Standard support"])
                        .slice(0, 5)
                        .map((feature) => (
                          <Stack key={`left-feature-${feature}`} direction="row" spacing={1} alignItems="center">
                            <CheckCircle2 size={14} color="#4ADE80" />
                            <Typography variant="body2" sx={{ color: "#E2E8F0", lineHeight: 1.4 }}>
                              {feature}
                            </Typography>
                          </Stack>
                        ))}
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                flex: { xs: "none", md: 1 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 2, sm: 3, md: 6 },
                bgcolor: "white",
                minHeight: { xs: "auto", md: "100vh" },
              }}
            >
              <Box sx={{ maxWidth: 840, width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
                <Paper
                  elevation={0}
                  className="shadow-sm"
                  sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    borderRadius: "18px",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: `0 10px 30px ${alpha(theme.palette.primary.dark, 0.08)}`,
                  }}
                >
                  <Box
                    sx={{
                      mb: 3,
                      p: 2.5,
                      pb: 2,
                      mx: { xs: -2.5, sm: -3.5 },
                      mt: { xs: -2.5, sm: -3.5 },
                      px: { xs: 2.5, sm: 3.5 },
                      pt: { xs: 2.5, sm: 3.5 },
                      borderRadius: "14px 14px 0 0",
                      bgcolor: "grey.900",
                      color: "white",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: -20, right: -20, opacity: 0.06 }}>
                      <ShieldCheck size={120} />
                    </Box>

                    <Box sx={{ position: "relative", zIndex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: "grey.400", mb: 0.25 }}>
                            Selected Plan
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {selectedPlan?.name} Plan
                          </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          {selectedPlanPrice}
                          <Typography component="span" variant="caption" sx={{ color: "grey.400", ml: 0.25 }}>
                            {selectedPlanPeriod}
                          </Typography>
                        </Typography>
                      </Stack>

                      <Typography variant="body2" sx={{ color: "grey.400", mb: 1 }}>
                        {selectedPlan?.description}
                      </Typography>

                      <Box
                        sx={{
                          mt: 2,
                          mb: 2,
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                          gap: 1.5,
                        }}
                      >
                        {plans.map((planOption) => {
                          const isActive = planOption.id === selectedPlan?.id;
                          return (
                            <Box
                              key={planOption.id}
                              onClick={() => navigate(`/checkout/${planOption.slug}`, { replace: true })}
                              sx={{
                                p: 2,
                                borderRadius: "14px",
                                border: "1px solid",
                                borderColor: isActive ? "#06B6D4" : "#FFFFFF2B",
                                bgcolor: isActive ? "#0B3B4A99" : "transparent",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  borderColor: isActive ? "#22D3EE" : "#FFFFFF50",
                                  bgcolor: isActive ? "#0B3B4ACC" : "#FFFFFF08",
                                },
                              }}
                            >
                              <Stack alignItems="center" spacing={0.75}>
                                <Box sx={{ color: isActive ? "#22D3EE" : "#9CA3AF" }}>
                                  {getPlanIcon(planOption.slug)}
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isActive ? "#22D3EE" : "white" }}>
                                  {planOption.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: isActive ? "#D1FAFF" : "#9CA3AF" }}>
                                  {pesoFormatter.format(planOption?.price)}{formatBillingPeriod(planOption.billingCycle, planOption.interval)}
                                </Typography>
                              </Stack>
                            </Box>
                          );
                        })}
                      </Box>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ShieldCheck size={14} color="#4ade80" />
                        <Typography variant="caption" sx={{ color: "grey.400" }}>
                          Secure 256-bit encrypted checkout
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>

                  {checkoutError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Unable to continue checkout</AlertTitle>
                      <AlertDescription>{checkoutError}</AlertDescription>
                    </Alert>
                  )}

                  {isPlansLoading && (
                    <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mb: 2 }}>
                      Loading latest plans...
                    </Typography>
                  )}

                  <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel
                          sx={{
                            "& .MuiStepIcon-root": {
                              color: alpha(theme.palette.primary.main, 0.25),
                            },
                            "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": {
                              color: theme.palette.primary.main,
                            },
                            "& .MuiStepLabel-label": {
                              whiteSpace: "pre-line",
                              lineHeight: 1.2,
                              fontWeight: 700,
                            },
                          }}
                        >
                          {label.replace(" ", "\n")}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  {activeStep === 0 && (
                    <form onSubmit={handleAccountNext}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 3 }}>
                        Account Information
                      </Typography>
                      <Stack spacing={2.5}>
                        <Box
                          className="rounded-xl transition-shadow hover:shadow-sm"
                          sx={{
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                            borderRadius: "14px",
                            p: { xs: 2, sm: 2.5 },
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Building2 size={16} color={theme.palette.primary.dark} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: 0.2 }}>
                                Company Information
                              </Typography>
                            </Stack>
                            <Chip size="small" label="Required" color="info" variant="outlined" />
                          </Stack>

                          <Stack spacing={2}>
                            <TextField
                              fullWidth
                              label="Company Name"
                              required
                              placeholder="Acme Inc."
                              value={accountInfo.companyName}
                              onChange={(e) => setAccountInfo({ ...accountInfo, companyName: e.target.value })}
                              slotProps={{
                                input: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Building2 size={18} color="#9ca3af" />
                                    </InputAdornment>
                                  ),
                                },
                              }}
                              error={!!accountErrors.companyName}
                              helperText={accountErrors.companyName}
                            />

                            <TextField
                              fullWidth
                              label="Company Code"
                              required
                              placeholder="ABC123"
                              value={accountInfo.companyCode}
                              onChange={(e) => setAccountInfo({ ...accountInfo, companyCode: e.target.value })}
                              slotProps={{
                                input: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Building2 size={18} color="#9ca3af" />
                                    </InputAdornment>
                                  ),
                                },
                              }}
                              error={!!accountErrors.companyCode}
                              helperText={accountErrors.companyCode}
                            />
                          </Stack>
                        </Box>

                        <Box
                          className="rounded-xl transition-shadow hover:shadow-sm"
                          sx={{
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.15),
                            bgcolor: "background.paper",
                            borderRadius: "14px",
                            p: { xs: 2, sm: 2.5 },
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <User size={16} color={theme.palette.primary.dark} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: 0.2 }}>
                                User Information
                              </Typography>
                            </Stack>
                            <Chip size="small" label="Owner Account" color="primary" variant="outlined" />
                          </Stack>

                          <Stack spacing={2}>
                            <TextField
                              fullWidth
                              label="Full Name"
                              required
                              placeholder="John Doe"
                              value={accountInfo.fullName}
                              onChange={(e) => setAccountInfo({ ...accountInfo, fullName: e.target.value })}
                              slotProps={{
                                input: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <User size={18} color="#9ca3af" />
                                    </InputAdornment>
                                  ),
                                },
                              }}
                              error={!!accountErrors.fullName}
                              helperText={accountErrors.fullName}
                            />

                            <TextField
                              fullWidth
                              label="Email Address"
                              type="email"
                              required
                              placeholder="you@company.com"
                              value={accountInfo.email}
                              onChange={(e) => setAccountInfo({ ...accountInfo, email: e.target.value })}
                              slotProps={{
                                input: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Mail size={18} color="#9ca3af" />
                                    </InputAdornment>
                                  ),
                                },
                              }}
                              error={!!accountErrors.email}
                              helperText={accountErrors.email}
                            />

                            <TextField
                              fullWidth
                              label="Password"
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="Create a password"
                              value={accountInfo.password}
                              onChange={(e) => setAccountInfo({ ...accountInfo, password: e.target.value })}
                              slotProps={{
                                input: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Lock size={18} color="#9ca3af" />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        size="small"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                      >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                },
                              }}
                              error={!!accountErrors.password}
                              helperText={accountErrors.password}
                            />

                            <TextField
                              fullWidth
                              label="Confirm Password"
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              placeholder="Confirm your password"
                              value={accountInfo.confirmPassword}
                              onChange={(e) => setAccountInfo({ ...accountInfo, confirmPassword: e.target.value })}
                              error={
                                !!accountErrors.confirmPassword ||
                                (accountInfo.confirmPassword.length > 0 && accountInfo.password !== accountInfo.confirmPassword)
                              }
                              helperText={
                                accountErrors.confirmPassword ||
                                (accountInfo.confirmPassword.length > 0 && accountInfo.password !== accountInfo.confirmPassword
                                  ? "Passwords do not match"
                                  : "")
                              }
                              slotProps={{
                                input: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Lock size={18} color="#9ca3af" />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        size="small"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                      >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                },
                              }}
                            />
                          </Stack>
                        </Box>

                        <AppButton
                          type="submit"
                          disabled={isProcessing}
                          className="h-12 w-full rounded-xl bg-cyan-700 text-white shadow-[0_8px_24px_rgba(8,145,178,0.25)] hover:bg-cyan-800"
                        >
                          {isProcessing ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Loader2 size={20} className="animate-spin" />
                              <span>Preparing summary...</span>
                            </Stack>
                          ) : (
                            "Continue to Summary"
                          )}
                        </AppButton>
                      </Stack>
                    </form>
                  )}

                  {activeStep === 1 && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                        <FileText size={18} /> Order Summary
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 2.5 }}>
                        <Grid size={{ xs: 12, md: 12 }}>
                          <Box
                            className="rounded-xl border border-slate-200 shadow-sm"
                            sx={{
                              borderRadius: "14px",
                              border: "1px solid",
                              borderColor: alpha(theme.palette.primary.main, 0.2),
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              p: { xs: 2, sm: 2.5 },
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                              <Building2 size={15} color={theme.palette.primary.dark} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                                Company Information
                              </Typography>
                            </Stack>
                            <Stack spacing={0.75}>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Company Name: <strong>{accountInfo.companyName || "-"}</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Company Code: <strong>{accountInfo.companyCode || "-"}</strong>
                              </Typography>
                            </Stack>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 12 }}>
                          <Box
                            className="rounded-xl border border-slate-200 shadow-sm"
                            sx={{
                              borderRadius: "14px",
                              border: "1px solid",
                              borderColor: alpha(theme.palette.primary.main, 0.2),
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              p: { xs: 2, sm: 2.5 },
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                              <User size={15} color={theme.palette.primary.dark} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                                User Information
                              </Typography>
                            </Stack>
                            <Stack spacing={0.75}>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Full Name: <strong>{accountInfo.fullName || "-"}</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Email Address: <strong>{accountInfo.email || "-"}</strong>
                              </Typography>
                            </Stack>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box
                        sx={{
                          mb: 2.5,
                          borderRadius: "16px",
                          border: "1px solid",
                          borderColor: "#D4DCE5",
                          background: "linear-gradient(180deg, #F8FBFD 0%, #F2F6FA 100%)",
                          p: { xs: 2, sm: 2.5 },
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          spacing={1.5}
                          sx={{ mb: 1.5 }}
                        >
                          <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block", mb: 0.5 }}>
                              Selected Plan
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                              {selectedPlan?.name}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mb: 1.25 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0E7490", letterSpacing: "-0.3px" }}>
                            {selectedPlanPrice}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {selectedPlanPeriod}
                          </Typography>
                        </Stack>

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 0.75 }}>
                          {selectedPlan?.features.slice(0, 4).map((feature) => (
                            <Stack key={`summary-feature-${feature}`} direction="row" spacing={1} alignItems="center">
                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0891B2", flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.4 }}>
                                {feature}
                              </Typography>
                            </Stack>
                          ))}
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid size={{ md: 6 }}>
                          <AppButton
                            type="button"
                            variant="outline"
                            className="h-12 w-full rounded-xl"
                            onClick={() => setActiveStep(0)}
                          >
                            Back
                          </AppButton>
                        </Grid>

                        <Grid size={{ md: 6 }}>
                          <AppButton
                            type="button"
                            disabled={isProcessing}
                            onClick={handleSubmit as any}
                            className="h-12 w-full rounded-xl bg-cyan-700 text-white shadow-[0_8px_24px_rgba(8,145,178,0.25)] hover:bg-cyan-800"
                          >
                            {isProcessing ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Loader2 size={20} className="animate-spin" />
                                <span>{isFreePlanSelected ? "Setting up your workspace..." : "Redirecting to HitPay..."}</span>
                              </Stack>
                            ) : (
                              isFreePlanSelected ? "Activate Free Plan" : `Subscribe ${selectedPlanPrice}`
                            )}
                          </AppButton>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
    </React.Fragment>
  );
};

export default Checkout;
