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
            height: { lg: "100vh" },
            overflow: { lg: "hidden" },
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
              height: { lg: "100vh" },
              overflow: { lg: "hidden" },
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", lg: 400 },
                flexShrink: 0,
                bgcolor: "#0B1120",
                color: "white",
                p: { xs: 3, sm: 4, lg: 3.25 },
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflowY: "auto",
                justifyContent: "space-between",
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

              <Box sx={{ position: "relative", zIndex: 1, width: "100%" }}>
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: { xs: 3, md: 3.5 } }}>
                  <Box
                    sx={{
                      p: 0.75,
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      bgcolor: "#0C2E54",
                      border: "1px solid #0EA5E955",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: "-0.25px" }}>
                    JAF Chatra
                  </Typography>
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, lineHeight: 1.15, letterSpacing: "-0.2px" }}>
                  {displayedPlan?.name || "Pro"} Plan
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.35, lineHeight: 1.05, fontSize: { xs: "1.8rem", md: "2.15rem" }, letterSpacing: "-0.7px" }}>
                  {selectedPlanPrice}
                </Typography>
                <Typography variant="body2" sx={{ color: "#7DD3FC", mb: 2.25, fontWeight: 700 }}>
                  {selectedPlanPeriod}
                </Typography>

                <Box sx={{ p: 1.75, borderRadius: 1, border: "1px solid #2D3748", bgcolor: "#1E293B", mb: 2 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ borderRadius: 1, p: 1.1, bgcolor: "#1E293B" }}>
                      <Typography variant="caption" sx={{ color: "#7DD3FC", fontWeight: 700, letterSpacing: 0.5, display: "block", mb: 0.5 }}>
                        BILLING CADENCE
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.79rem" }}>
                        {displayedPlan?.interval || 1} {displayedPlan?.billingCycle || "monthly"}
                      </Typography>
                    </Box>
                    <Box sx={{ borderRadius: 1, p: 1.1, bgcolor: "#1E293B" }}>
                      <Typography variant="caption" sx={{ color: "#7DD3FC", fontWeight: 700, letterSpacing: 0.5, display: "block", mb: 0.5 }}>
                        MAX AGENTS
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.79rem" }}>
                        {displayedPlan?.limits?.maxAgents || "Unlimited"}
                      </Typography>
                    </Box>
                    <Box sx={{ borderRadius: 1, p: 1.1, bgcolor: "#1E293B" }}>
                      <Typography variant="caption" sx={{ color: "#7DD3FC", fontWeight: 700, letterSpacing: 0.5, display: "block", mb: 0.5 }}>
                        ANALYTICS
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.79rem" }}>
                        {displayedPlan?.limits?.hasAdvancedAnalytics ? "Advanced" : "Standard"}
                      </Typography>
                    </Box>
                    <Box sx={{ borderRadius: 1, p: 1.1, bgcolor: "#1E293B" }}>
                      <Typography variant="caption" sx={{ color: "#7DD3FC", fontWeight: 700, letterSpacing: 0.5, display: "block", mb: 0.5 }}>
                        SECURITY
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.79rem" }}>
                        256-bit Encrypted
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="caption" sx={{ color: "#60A5FA", letterSpacing: 1.1, fontWeight: 700 }}>
                  INCLUDED FEATURES
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 0.85,
                  }}
                >
                  {(displayedPlan?.features?.length ? displayedPlan.features : ["Standard support"])
                    .slice(0, 6)
                    .map((feature) => (
                      <Stack key={`left-feature-${feature}`} direction="row" spacing={1} alignItems="center">
                        <CheckCircle2 size={14} color="#00E2B5" />
                        <Typography variant="caption" sx={{ color: "#DBEAFE", lineHeight: 1.35, fontSize: "0.79rem" }}>
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                </Box>
              </Box>
            </Box>



            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                p: 0,
                bgcolor: "#F8FAFC",
                minHeight: { xs: "auto", lg: "100vh" },
                overflowY: { lg: "auto" },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  borderBottomRightRadius: { xs: 0, md: 32 },
                  borderBottomLeftRadius: { xs: 0, md: 32 },
                  bgcolor: "#1F2937",
                  px: { xs: 2, sm: 4, lg: 8 },
                  pt: { xs: 3, md: 4 },
                  pb: { xs: 3, md: 4 },
                  color: "white",
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                      gap: 1.25,
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
                            borderRadius: 1,
                            bgcolor: isActive ? "#0F172A" : "transparent",
                            border: "1px solid",
                            borderColor: isActive ? "#22D3EE" : "#334155",
                            borderTop: isActive ? "4px solid #22D3EE" : "1px solid #334155",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: isActive ? "#38BDF8" : "#475569",
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          <Stack alignItems="center" spacing={0.75}>
                            <Box sx={{ color: isActive ? "#38BDF8" : "#94A3B8", display: "inline-flex" }}>
                              {getPlanIcon(planOption.slug)}
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "1rem", color: isActive ? "#F0F9FF" : "#E2E8F0" }}>
                              {planOption.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: isActive ? "#BAE6FD" : "#94A3B8", fontSize: "0.85rem" }}>
                              {pesoFormatter.format(planOption?.price)}
                              {formatBillingPeriod(planOption.billingCycle, planOption.interval)}
                            </Typography>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 3, pl: 0.5, justifyContent: "flex-start" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ShieldCheck size={16} color="#00E2B5" />
                      <Typography variant="caption" sx={{ color: "#E2E8F0", fontWeight: 500, fontSize: "0.85rem" }}>
                        Secure 256-bit encrypted checkout
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 3,
                  flex: 1,
                  p: 3
                }}
              >
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{
                    maxWidth: 400,
                    mx: "auto",
                    width: "100%",
                    "& .MuiStepConnector-line": {
                      borderColor: alpha(theme.palette.primary.main, 0.18),
                    },
                    "& .MuiStepLabel-labelContainer": {
                      textAlign: "center",
                    },
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          "& .MuiStepIcon-root": {
                            color: "#CBD5E0",
                            width: 20,
                            height: 20,
                          },
                          "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": {
                            color: "#149B9A",
                          },
                          "& .MuiStepLabel-label": {
                            whiteSpace: "pre-line",
                            lineHeight: 1.1,
                            fontWeight: 700,
                            fontSize: "0.85rem",
                          },
                        }}
                      >
                        {label.replace(" ", "\n")}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Paper
                    elevation={0}
                    className="shadow-sm"
                    sx={{
                      p: { xs: 2.5, sm: 3, lg: 3.5 },
                      width: "100%",
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "#F1F5F9",
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.025)",
                    }}
                  >
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



                  {activeStep === 0 && (
                    <form onSubmit={handleAccountNext}>
                      <Box sx={{ display: "flex", flexWrap: "wrap", margin: -1, mb: 4, width: "100%" }}>
                        {/* User Information Card */}
                        <Box sx={{ p: 1, width: { xs: "100%", md: "50%" } }}>
                          <Box
                            sx={{
                              p: 2.25,
                              height: "100%",
                              borderRadius: 3,
                              border: "1px solid #F1F5F9",
                              bgcolor: "#FFFFFF",
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                              <User size={18} color="#149B9A" />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1F2937" }}>
                                User Information
                              </Typography>
                            </Stack>

                            <Stack spacing={1.5}>
                              <Box>
                                <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#4A5568", fontSize: "0.75rem" }}>
                                  Full Name *
                                </Typography>
                                <TextField
                                  size="small"
                                  fullWidth
                                  placeholder="John Doe"
                                  required
                                  value={accountInfo.fullName}
                                  onChange={(e) => setAccountInfo({ ...accountInfo, fullName: e.target.value })}
                                  error={!!accountErrors.fullName}
                                  helperText={accountErrors.fullName}
                                  slotProps={{
                                    input: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <User size={18} color="#94A3B8" />
                                        </InputAdornment>
                                      ),
                                    },
                                  }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff", borderColor: "#E2E8F0" },
                                    "& .MuiInputBase-input": { fontSize: "0.9rem", py: 1 },
                                  }}
                                />
                              </Box>

                              <Box>
                                <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#4A5568", fontSize: "0.75rem" }}>
                                  Email Address *
                                </Typography>
                                <TextField
                                  size="small"
                                  fullWidth
                                  placeholder="you@company.com"
                                  type="email"
                                  required
                                  value={accountInfo.email}
                                  onChange={(e) => setAccountInfo({ ...accountInfo, email: e.target.value })}
                                  error={!!accountErrors.email}
                                  helperText={accountErrors.email}
                                  slotProps={{
                                    input: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Mail size={18} color="#94A3B8" />
                                        </InputAdornment>
                                      ),
                                    },
                                  }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff", borderColor: "#E2E8F0" },
                                    "& .MuiInputBase-input": { fontSize: "0.9rem", py: 1 },
                                  }}
                                />
                              </Box>

                              <Box>
                                <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#4A5568", fontSize: "0.75rem" }}>
                                  Password *
                                </Typography>
                                <TextField
                                  size="small"
                                  fullWidth
                                  type={showPassword ? "text" : "password"}
                                  required
                                  placeholder="Create a password"
                                  value={accountInfo.password}
                                  onChange={(e) => setAccountInfo({ ...accountInfo, password: e.target.value })}
                                  error={!!accountErrors.password}
                                  helperText={accountErrors.password}
                                  slotProps={{
                                    input: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Lock size={18} color="#94A3B8" />
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
                                  sx={{
                                    "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff", borderColor: "#E2E8F0" },
                                    "& .MuiInputBase-input": { fontSize: "0.9rem", py: 1 },
                                  }}
                                />
                              </Box>

                              <Box>
                                <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#4A5568", fontSize: "0.75rem" }}>
                                  Confirm Password *
                                </Typography>
                                <TextField
                                  size="small"
                                  fullWidth
                                  type={showConfirmPassword ? "text" : "password"}
                                  required
                                  placeholder="Confirm your password"
                                  value={accountInfo.confirmPassword}
                                  onChange={(e) => setAccountInfo({ ...accountInfo, confirmPassword: e.target.value })}
                                  error={!!accountErrors.confirmPassword || (accountInfo.confirmPassword.length > 0 && accountInfo.password !== accountInfo.confirmPassword)}
                                  helperText={accountErrors.confirmPassword || (accountInfo.confirmPassword.length > 0 && accountInfo.password !== accountInfo.confirmPassword ? "Passwords do not match" : "")}
                                  slotProps={{
                                    input: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Lock size={18} color="#94A3B8" />
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
                                  sx={{
                                    "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff", borderColor: "#E2E8F0" },
                                    "& .MuiInputBase-input": { fontSize: "0.9rem", py: 1 },
                                  }}
                                />
                              </Box>
                            </Stack>
                          </Box>
                        </Box>

                        {/* Company Information Card */}
                        <Box sx={{ p: 1, width: { xs: "100%", md: "50%" } }}>
                          <Box
                            sx={{
                              p: 2.25,
                              height: "100%",
                              borderRadius: 3,
                              border: "1px solid #F1F5F9",
                              bgcolor: "#FFFFFF",
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                              <Building2 size={18} color="#149B9A" />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1F2937" }}>
                                Company Information
                              </Typography>
                            </Stack>

                            <Stack spacing={1.5}>
                              <Box>
                                <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#4A5568", fontSize: "0.75rem" }}>
                                  Company Name *
                                </Typography>
                                <TextField
                                  size="small"
                                  fullWidth
                                  required
                                  placeholder="Acme Inc."
                                  value={accountInfo.companyName}
                                  onChange={(e) => setAccountInfo({ ...accountInfo, companyName: e.target.value })}
                                  error={!!accountErrors.companyName}
                                  helperText={accountErrors.companyName}
                                  slotProps={{
                                    input: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Building2 size={18} color="#94A3B8" />
                                        </InputAdornment>
                                      ),
                                    },
                                  }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff", borderColor: "#E2E8F0" },
                                    "& .MuiInputBase-input": { fontSize: "0.9rem", py: 1 },
                                  }}
                                />
                              </Box>

                              <Box>
                                <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.5, color: "#4A5568", fontSize: "0.75rem" }}>
                                  Company Code *
                                </Typography>
                                <TextField
                                  size="small"
                                  fullWidth
                                  required
                                  placeholder="ABC123"
                                  value={accountInfo.companyCode}
                                  onChange={(e) => setAccountInfo({ ...accountInfo, companyCode: e.target.value })}
                                  error={!!accountErrors.companyCode}
                                  helperText={accountErrors.companyCode}
                                  slotProps={{
                                    input: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Building2 size={18} color="#94A3B8" />
                                        </InputAdornment>
                                      ),
                                    },
                                  }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff", borderColor: "#E2E8F0" },
                                    "& .MuiInputBase-input": { fontSize: "0.9rem", py: 1 },
                                  }}
                                />
                              </Box>
                            </Stack>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ width: "100%" }}>
                        <AppButton
                          type="submit"
                          disabled={isProcessing}
                          className="h-10 w-full rounded-lg bg-[#007EA7] mt-1 text-white hover:bg-[#005F82] font-bold text-base"
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
                      </Box>
                    </form>
                  )}

                  {activeStep === 1 && (
                    <Box sx={{ width: "100%" }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "#1F2937", mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                        <FileText size={28} color="#149B9A" /> Order Summary
                      </Typography>

                      <Box sx={{ display: "flex", flexWrap: "wrap", margin: -1, mb: 2.5 }}>
                        <Box sx={{ p: 1, width: { xs: "100%", md: "50%" } }}>
                          <Box
                            className="rounded border border-slate-200 shadow-sm"
                            sx={{
                              borderRadius: 3,
                              border: "1px solid",
                              borderColor: "#F1F5F9",
                              bgcolor: "#FFFFFF",
                              p: { xs: 2.25, sm: 2.25 },
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                              <Building2 size={18} color="#149B9A" />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1F2937" }}>
                                Company Information
                              </Typography>
                            </Stack>
                            <Stack spacing={0.75}>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Company Name: <strong style={{ color: "#1F2937" }}>{accountInfo.companyName || "-"}</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Company Code: <strong style={{ color: "#1F2937" }}>{accountInfo.companyCode || "-"}</strong>
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>

                        <Box sx={{ p: 1, width: { xs: "100%", md: "50%" } }}>
                          <Box
                            className="rounded border border-slate-200 shadow-sm"
                            sx={{
                              borderRadius: 3,
                              border: "1px solid",
                              borderColor: "#F1F5F9",
                              bgcolor: "#FFFFFF",
                              p: { xs: 2.25, sm: 2.25 },
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                              <User size={18} color="#149B9A" />
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1F2937" }}>
                                User Information
                              </Typography>
                            </Stack>
                            <Stack spacing={0.75}>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Full Name: <strong style={{ color: "#1F2937" }}>{accountInfo.fullName || "-"}</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Email Address: <strong style={{ color: "#1F2937" }}>{accountInfo.email || "-"}</strong>
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          mb: 2.5,
                          borderRadius: 1,
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
                              <Box sx={{ width: 6, height: 6, borderRadius: 1, bgcolor: "#0891B2", flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.4 }}>
                                {feature}
                              </Typography>
                            </Stack>
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", flexWrap: "wrap", margin: -1, mt: 2 }}>
                        <Box sx={{ p: 1, width: "50%" }}>
                          <AppButton
                            type="button"
                            variant="outline"
                            className="h-12 w-full rounded"
                            onClick={() => setActiveStep(0)}
                          >
                            Back
                          </AppButton>
                        </Box>

                        <Box sx={{ p: 1, width: "50%" }}>
                          <AppButton
                            type="button"
                            disabled={isProcessing}
                            onClick={handleSubmit as any}
                            className="h-12 w-full rounded bg-[#149B9A] text-white hover:bg-[#118A89]"
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
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      </div>
    </React.Fragment>
  );
};

export default Checkout;
