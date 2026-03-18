import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import {
  CreditCard,
  CheckCircle2,
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
} from "lucide-react";

const planDetails = {
  "free-trial": { name: "Free Trial", price: "$0", period: "/14 days", isFree: true },
  starter: { name: "Starter", price: "$12", period: "/month", isFree: false },
  pro: { name: "Pro", price: "$29", period: "/month", isFree: false },
};

export function Checkout() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const [billingInfo, setBillingInfo] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  // Validate planId
  const plan = planDetails[planId as keyof typeof planDetails] || planDetails.pro;

  const steps = plan.isFree ? ["Account Information", "Summary"] : ["Account Information", "Billing Information", "Summary"];

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
    if (hasError) return;

    // Free plans skip billing — go to summary
    if (plan.isFree) {
      setActiveStep(1);
      return;
    }

    setActiveStep(1);
  };

  // Billing field formatters
  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setBillingInfo({ ...billingInfo, cardNumber: formatted });
  };

  const handleExpiryChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    }
    setBillingInfo({ ...billingInfo, expiry: formatted });
  };

  const handleCvcChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setBillingInfo({ ...billingInfo, cvc: digits });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Redirect to setup after success animation
      setTimeout(() => {
        navigate("/setup");
      }, 2000);
    }, 2500);
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
        {/* LEFT SIDE */}
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
            {/* Back Button */}
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

            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 6, md: 8 } }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>JAF Chatra</Typography>
            </Box>

            {/* Hero Content */}
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Customer support,<br/>evolved.
            </Typography>
            <Typography variant="body1" sx={{ color: '#94A3B8', mb: 6, fontSize: '1.1rem', lineHeight: 1.6 }}>
              Join thousands of modern teams using JAF Chatra to close deals faster and support customers better.
            </Typography>

            {/* Testimonial Card */}
            <Box sx={{ bgcolor: '#1E293B', p: 4, borderRadius: 4, border: '1px solid #334155' }}>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FACC15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </Box>
              <Typography variant="body2" sx={{ color: '#E2E8F0', fontStyle: 'italic', mb: 3, lineHeight: 1.6, fontSize: '0.95rem' }}>
                "We switched to JAF Chatra and our load times plummeted by 2 seconds. The AI drafts feature alone saves our team 15 hours a week."
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#2DD4BF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B1426', fontWeight: 800 }}>
                  S
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Sarah Jenkins</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Head of Support, TechFlow</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* RIGHT SIDE */}
        <Box
          sx={{
            flex: { xs: "none", md: 1 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, sm: 4, md: 8 },
            bgcolor: "white",
            minHeight: { xs: "auto", md: "100vh" },
          }}
        >
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 5,
                maxWidth: 420,
                width: "100%",
                mx: "auto",
                textAlign: "center",
                borderRadius: 4,
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2
                  size={80}
                  color="#16a34a"
                  style={{ margin: "0 auto 24px" }}
                />
              </motion.div>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
                {plan.isFree ? "Account Created!" : "Payment Successful!"}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                Redirecting you to complete your workspace setup...
              </Typography>
              <CircularProgress size={24} sx={{ color: "grey.400" }} />
            </Paper>
          </motion.div>
        ) : (
          <Box
            sx={{
              maxWidth: 520,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                position: "relative",
                zIndex: 1,
                // Fix Tailwind global CSS conflicting with MUI TextField internals
                '& .MuiTextField-root, & .MuiFormControl-root': {
                  position: 'relative',
                },
                '& .MuiInputBase-root': {
                  position: 'relative',
                  zIndex: 1,
                  cursor: 'text',
                },
                '& .MuiInputBase-input': {
                  position: 'relative',
                  zIndex: 2,
                  cursor: 'text',
                  pointerEvents: 'auto',
                  '&::placeholder': {
                    opacity: 0.5,
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  pointerEvents: 'none',
                },
                '& .MuiInputLabel-root': {
                  pointerEvents: 'none',
                },
                '& .MuiInputAdornment-root': {
                  pointerEvents: 'none',
                  '& .MuiIconButton-root': {
                    pointerEvents: 'auto',
                  },
                },
              }}
            >
              {/* Order Summary Banner */}
              <Box
                sx={{
                  mb: 3,
                  p: 2.5,
                  pb: 2,
                  mx: { xs: -3, sm: -4 },
                  mt: { xs: -3, sm: -4 },
                  px: { xs: 3, sm: 4 },
                  pt: { xs: 3, sm: 4 },
                  borderRadius: "16px 16px 0 0",
                  bgcolor: "grey.900",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    opacity: 0.06,
                  }}
                >
                  <ShieldCheck size={120} />
                </Box>
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: "grey.400", mb: 0.25 }}>
                        Selected Plan
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {plan.name} Plan
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {plan.price}
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ color: "grey.400", ml: 0.25 }}
                      >
                        {plan.period}
                      </Typography>
                    </Typography>
                  </Box>

                  {/* Plan Switcher */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      mb: 2,
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                    }}
                  >
                    {(["free-trial", "starter", "pro"] as const).map((key) => {
                      const p = planDetails[key];
                      const isActive = planId === key;
                      
                      let icon;
                      if (key === "free-trial") {
                        icon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>;
                      } else if (key === "starter") {
                        icon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>;
                      } else if (key === "pro") {
                        icon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
                      }

                      return (
                        <Box
                          key={key}
                          onClick={() => {
                            if (!isActive) navigate(`/checkout/${key}`, { replace: true });
                          }}
                          sx={{
                            flex: 1,
                            minWidth: { xs: "100%", sm: "0" },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            p: 2,
                            borderRadius: 1,
                            cursor: isActive ? "default" : "pointer",
                            border: "1px solid",
                            borderColor: isActive ? "#0891B2FF" : "#FFFFFF26",
                            bgcolor: isActive ? "#0891B226" : "transparent",
                            transition: "all 0.2s",
                            "&:hover": isActive ? {} : {
                              borderColor: "#FFFFFF66",
                              bgcolor: "#FFFFFF0D",
                            },
                          }}
                        >
                          <Box sx={{ mb: 1, color: isActive ? "#22D3EEFF" : "grey.400", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {icon}
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: isActive ? "#22D3EEFF" : "grey.300", lineHeight: 1, mb: 0.5 }}>
                            {p.name}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", color: isActive ? "grey.400" : "grey.500", fontSize: "0.65rem", lineHeight: 1.2 }}>
                            {key === "enterprise" ? "Custom" : `${p.price}${p.period}`}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <ShieldCheck size={14} color="#4ade80" />
                    <Typography variant="caption" sx={{ color: "grey.400" }}>
                      Secure 256-bit encrypted checkout
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Stepper */}
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

              {/* Step 1: Account Information */}
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
                      onChange={(e) =>
                        setAccountInfo({ ...accountInfo, fullName: e.target.value })
                      }
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
                      onChange={(e) =>
                        setAccountInfo({ ...accountInfo, companyCode: e.target.value })
                      }
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
                      onChange={(e) =>
                        setAccountInfo({ ...accountInfo, email: e.target.value })
                      }
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
                      onChange={(e) =>
                        setAccountInfo({ ...accountInfo, password: e.target.value })
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
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ position: 'relative', zIndex: 3 }}
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
                      onChange={(e) =>
                        setAccountInfo({
                          ...accountInfo,
                          confirmPassword: e.target.value,
                        })
                      }
                      error={
                        !!accountErrors.confirmPassword ||
                        (accountInfo.confirmPassword.length > 0 &&
                        accountInfo.password !== accountInfo.confirmPassword)
                      }
                      helperText={
                        accountErrors.confirmPassword ||
                        (accountInfo.confirmPassword.length > 0 &&
                        accountInfo.password !== accountInfo.confirmPassword
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
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge="end"
                                sx={{ position: 'relative', zIndex: 3 }}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      fullWidth
                      size="large"
                      disabled={isProcessing}
                      sx={{
                        mt: 1,
                        py: 1.5,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #0891b2, #0e7490)",
                        boxShadow: "0 8px 24px #0891B240",
                        "&:hover": {
                          background: "linear-gradient(135deg, #0e7490, #155e75)",
                        },
                      }}
                    >
                      {isProcessing ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Loader2 size={20} className="animate-spin" />
                          <span>Creating account...</span>
                        </Stack>
                      ) : plan.isFree ? (
                        "Continue to Summary"
                      ) : (
                        "Continue to Billing"
                      )}
                    </Button>
                  </Stack>
                </form>
              )}

              {/* Step 2: Billing Information */}
              {activeStep === 1 && !plan.isFree && (
                <form onSubmit={(e) => { e.preventDefault(); setActiveStep(2); }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 3 }}>
                    Billing Information
                  </Typography>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Name on Card"
                      required
                      placeholder="John Doe"
                      value={billingInfo.nameOnCard}
                      onChange={(e) =>
                        setBillingInfo({ ...billingInfo, nameOnCard: e.target.value })
                      }
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <User size={18} color="#9ca3af" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Card Number"
                      required
                      placeholder="0000 0000 0000 0000"
                      value={billingInfo.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CreditCard size={18} color="#9ca3af" />
                            </InputAdornment>
                          ),
                          style: { fontFamily: "monospace" },
                        },
                      }}
                    />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Expiry"
                        required
                        placeholder="MM/YY"
                        value={billingInfo.expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        slotProps={{
                          input: {
                            style: { fontFamily: "monospace" },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="CVC"
                        required
                        placeholder="CVC"
                        value={billingInfo.cvc}
                        onChange={(e) => handleCvcChange(e.target.value)}
                        slotProps={{
                          input: {
                            style: { fontFamily: "monospace" },
                          },
                        }}
                      />
                    </Box>

                    {/* Inline total */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pt: 2,
                        mt: 1,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Total Due Today
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {plan.price}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        onClick={() => setActiveStep(0)}
                        sx={{
                          py: 1.5,
                          borderRadius: 3,
                          borderColor: "grey.300",
                          color: "text.primary",
                          "&:hover": {
                            borderColor: "grey.400",
                            bgcolor: "grey.50",
                          },
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        size="large"
                        disabled={isProcessing}
                        sx={{
                          py: 1.5,
                          borderRadius: 3,
                          background: "linear-gradient(135deg, #0891b2, #0e7490)",
                          boxShadow: "0 8px 24px #0891B240",
                          "&:hover": {
                            background: "linear-gradient(135deg, #0e7490, #155e75)",
                          },
                        }}
                      >
                        {isProcessing ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Loader2 size={20} className="animate-spin" />
                            <span>Processing...</span>
                          </Stack>
                        ) : (
                          "Continue to Summary"
                        )}
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              )}

              {/* Step 3: Summary (or Step 2 for free plans) */}
              {activeStep === (plan.isFree ? 1 : 2) && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <FileText size={18} /> Order Summary
                  </Typography>

                  {/* Account & Payment in compact rows */}
                  <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Stack spacing={0.75}>
                      {[
                        { label: "Name", value: accountInfo.fullName },
                        { label: "Email", value: accountInfo.email },
                        { label: "Company", value: accountInfo.companyCode },
                        ...(!plan.isFree ? [
                          { label: "Card", value: `•••• ${billingInfo.cardNumber.replace(/\s/g, "").slice(-4) || "••••"}` },
                          { label: "Expiry", value: billingInfo.expiry || "—" },
                        ] : []),
                      ].map((item) => (
                        <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>{item.label}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{item.value || "—"}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  {/* Plan & Total */}
                  <Box sx={{ mb: 2, p: 2, bgcolor: "#0891B20D", borderRadius: 2, border: "1px solid", borderColor: "#0891B233" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Plan</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>{plan.name} — {plan.isFree ? "14-day trial" : "Monthly"}</Typography>
                    </Box>
                    <Box sx={{ pt: 1, mt: 0.75, borderTop: 1, borderColor: "#0891B233", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>Total Due Today</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: "#0891B2" }}>{plan.price}</Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      onClick={() => setActiveStep(plan.isFree ? 0 : 1)}
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        borderColor: "grey.300",
                        color: "text.primary",
                        "&:hover": {
                          borderColor: "grey.400",
                          bgcolor: "grey.50",
                        },
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      size="large"
                      disabled={isProcessing}
                      onClick={handleSubmit as any}
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #0891b2, #0e7490)",
                        boxShadow: "0 8px 24px #0891B240",
                        "&:hover": {
                          background: "linear-gradient(135deg, #0e7490, #155e75)",
                        },
                      }}
                    >
                      {isProcessing ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Loader2 size={20} className="animate-spin" />
                          <span>{plan.isFree ? "Creating account..." : "Processing payment..."}</span>
                        </Stack>
                      ) : plan.isFree ? (
                        "Confirm & Create Account"
                      ) : (
                        `Confirm & Pay ${plan.price}`
                      )}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Paper>
          </Box>
        )}
        </Box>
      </Box>
    </Box>
    </div>
  );
}