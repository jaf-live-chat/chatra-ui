import { useMemo, useState } from "react";
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
} from "lucide-react";

import { useGetSubscriptionPlans } from "../../../services/subscriptionPlanServices";
import Payments from "../../../services/paymentServices";
import { Button as AppButton } from "../../../components/Button";
import { Alert, AlertDescription, AlertTitle } from "../../../components/Alert";

type CheckoutPlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  features: string[];
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
  if (interval > 1) {
    return `/${interval} ${billingCycle}`;
  }
  if (billingCycle === "daily") return "/day";
  if (billingCycle === "weekly") return "/week";
  if (billingCycle === "monthly") return "/month";
  return "/year";
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

const Checkout = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { plans: fetchedPlans, isLoading: isPlansLoading } = useGetSubscriptionPlans();

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [accountInfo, setAccountInfo] = useState({
    fullName: "",
    companyCode: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [accountErrors, setAccountErrors] = useState({
    fullName: "",
    companyCode: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const plans = useMemo<CheckoutPlan[]>(() => {

    return fetchedPlans.map((plan) => ({
      id: plan._id,
      slug: slugifyPlanName(plan.name) || plan._id,
      name: plan.name,
      description: plan.description || "Subscription plan",
      price: Number(plan.price || 0),
      billingCycle: plan.billingCycle,
      interval: plan.interval || 1,
      features: plan.features?.length ? plan.features : ["Standard support"],
    }));
  }, [fetchedPlans]);

  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === planId || p.slug === planId) || plans[0];
  }, [plans, planId]);

  const selectedPlanPrice = pesoFormatter.format(selectedPlan.price);
  const selectedPlanPeriod = formatBillingPeriod(selectedPlan.billingCycle, selectedPlan.interval);

  const checkoutPayload = useMemo(
    () => ({
      subscriptionData: {
        companyName: accountInfo.companyCode,
        companyCode: accountInfo.companyCode,
        subscriptionPlanId: selectedPlan.id,
        subscriptionStart: new Date().toISOString(),
      },
      agentData: {
        fullName: accountInfo.fullName,
        emailAddress: accountInfo.email,
        password: accountInfo.password,
      },
    }),
    [accountInfo.companyCode, accountInfo.email, accountInfo.fullName, accountInfo.password, selectedPlan.id]
  );

  const handleAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { fullName: "", companyCode: "", email: "", password: "", confirmPassword: "" };
    let hasError = false;

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
      const response = await Payments.createCheckout(checkoutPayload);

      if (response.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }

      if (response.isHitpayBypassed) {
        const query = new URLSearchParams();
        if (response.paymentReference) {
          query.set("reference", response.paymentReference);
        }
        navigate(`/setup?${query.toString()}`);
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
                Customer support,<br />evolved.
              </Typography>
              <Typography variant="body1" sx={{ color: "#94A3B8", mb: 6, fontSize: "1.1rem", lineHeight: 1.6 }}>
                Join thousands of modern teams using JAF Chatra to close deals faster and support customers better.
              </Typography>

              <Box sx={{ bgcolor: "#1E293B", p: 4, borderRadius: 4, border: "1px solid #334155" }}>
                <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={`star-${i}`} width="16" height="16" viewBox="0 0 24 24" fill="#FACC15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ color: "#E2E8F0", fontStyle: "italic", mb: 3, lineHeight: 1.6, fontSize: "0.95rem" }}>
                  "We switched to JAF Chatra and our load times plummeted by 2 seconds. The AI drafts feature alone saves our team 15 hours a week."
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#2DD4BF", display: "flex", alignItems: "center", justifyContent: "center", color: "#0B1426", fontWeight: 800 }}>
                    S
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      Sarah Jenkins
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                      Head of Support, TechFlow
                    </Typography>
                  </Box>
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
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
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
                    borderRadius: "16px 16px 0 0",
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
                          {selectedPlan.name} Plan
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
                      {selectedPlan.description}
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
                        const isActive = planOption.id === selectedPlan.id;
                        return (
                          <Box
                            key={planOption.id}
                            onClick={() => navigate(`/checkout/${planOption.slug}`, { replace: true })}
                            sx={{
                              p: 2,
                              borderRadius: 2,
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
                                {pesoFormatter.format(planOption.price)}{formatBillingPeriod(planOption.billingCycle, planOption.interval)}
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
                          "& .MuiStepLabel-label": {
                            whiteSpace: "pre-line",
                            lineHeight: 1.2,
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

                    <Box
                      sx={{
                        mb: 2.5,
                        borderRadius: 3,
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
                            {selectedPlan.name}
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
                        {selectedPlan.features.slice(0, 4).map((feature) => (
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
                              <span>Redirecting to HitPay...</span>
                            </Stack>
                          ) : (
                            `Subscribe ${selectedPlanPrice}`
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
  );
};

export default Checkout;
