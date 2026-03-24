import { useState, useEffect } from "react";
import { Menu, X, User, Building2, Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Container,
  Dialog,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { APP_LOGO } from "../../constants/constants";

const NAV_LINKS = [
  { label: "Features", to: "/features" },
  { label: "Integrations", to: "/integrations" },
  { label: "Pricing", to: "/pricing" },
  { label: "Resources", to: "#" },
];

const STARTER_FEATURES = [
  "1 Agent Seat",
  "14-day chat history",
  "Basic widget customization",
  "Community support",
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Signup modal state
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupProcessing, setSignupProcessing] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

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

  const resetSignupModal = () => {
    setSignupOpen(false);
    setSignupProcessing(false);
    setSignupSuccess(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAccountInfo({ fullName: "", companyCode: "", email: "", password: "", confirmPassword: "" });
    setAccountErrors({ fullName: "", companyCode: "", email: "", password: "", confirmPassword: "" });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { fullName: "", companyCode: "", email: "", password: "", confirmPassword: "" };
    let hasError = false;
    if (accountInfo.fullName.trim().length < 2) { errors.fullName = "Please enter your full name"; hasError = true; }
    if (accountInfo.companyCode.trim().length < 2) { errors.companyCode = "Please enter a valid company code"; hasError = true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountInfo.email)) { errors.email = "Please enter a valid email address"; hasError = true; }
    if (accountInfo.password.length < 8) { errors.password = "Password must be at least 8 characters"; hasError = true; }
    if (accountInfo.password !== accountInfo.confirmPassword) { errors.confirmPassword = "Passwords do not match"; hasError = true; }
    setAccountErrors(errors);
    if (hasError) return;

    setSignupProcessing(true);
    setTimeout(() => {
      setSignupProcessing(false);
      setSignupSuccess(true);
      setTimeout(() => {
        resetSignupModal();
        navigate("/setup");
      }, 2000);
    }, 2000);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navColor = "#0A192FFF"; // Navy
  const btnColor = "#00838FFF"; // Teal
  const btnHover = "#006064FF";

  // Shared text field fix for MUI + Tailwind
  const textFieldFix = {
    '& .MuiTextField-root, & .MuiFormControl-root': { position: 'relative' },
    '& .MuiInputBase-root': { position: 'relative', zIndex: 1, cursor: 'text' },
    '& .MuiInputBase-input': {
      position: 'relative', zIndex: 2, cursor: 'text', pointerEvents: 'auto',
      '&::placeholder': { opacity: 0.5 },
    },
    '& .MuiOutlinedInput-notchedOutline': { pointerEvents: 'none' },
    '& .MuiInputLabel-root': { pointerEvents: 'none' },
    '& .MuiInputAdornment-root': {
      pointerEvents: 'none',
      '& .MuiIconButton-root': { pointerEvents: 'auto' },
    },
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={isScrolled ? 1 : 0}
        sx={{
          bgcolor: isScrolled ? "#FFFFFFFF" : "#FFFFFFF2",
          backdropFilter: isScrolled ? "none" : "blur(8px)",
          borderBottom: isScrolled ? "1px solid #E5E7EBFF" : "1px solid transparent",
          transition: "all 0.3s ease",
          color: navColor
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: "80px !important", justifyContent: "space-between" }}>
            {/* Logo */}
            <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <img
                src={APP_LOGO.logoDark}
                alt="JAF Chatra Logo"
                style={{ height: "120px", width: "auto" }}
              />
            </Box>

            {/* Desktop Nav */}
            <Stack
              direction="row"
              spacing={4}
              sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
            >
              {NAV_LINKS.map((link) => (
                link.label === "Resources" ? (
                  <Box
                    key={link.label}
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                      "&:hover .resources-dropdown": {
                        opacity: 1,
                        visibility: "visible",
                        transform: "translateX(-50%) translateY(0)",
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        textDecoration: "none",
                        color: navColor,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "color 0.2s",
                        "&:hover": { color: btnColor },
                      }}
                    >
                      {link.label}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </Box>

                    <Box
                      className="resources-dropdown"
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%) translateY(8px)",
                        opacity: 0,
                        visibility: "hidden",
                        transition: "all 0.2s ease-in-out",
                        width: "340px",
                        bgcolor: "#FFFFFF",
                        borderRadius: "16px",
                        boxShadow: "0 10px 40px -10px #0000001A",
                        border: "1px solid #F1F5F9",
                        p: 1.5,
                        pt: 1.5,
                        mt: 1,
                        zIndex: 50,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: "-12px",
                          left: 0,
                          right: 0,
                          height: "12px",
                        }
                      }}
                    >
                      <Box component={Link} to="/resources/help-center" sx={{ display: "flex", alignItems: "flex-start", height: "76px", gap: 2, p: 1.5, borderRadius: "12px", textDecoration: "none", transition: "background-color 0.2s", "&:hover": { bgcolor: "#F8FAFCFF" } }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#EFF6FFFF", color: "#3B82F6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172AFF", fontFamily: "Inter, sans-serif", mb: 0.25 }}>Help Center</Typography>
                          <Typography sx={{ fontSize: "0.85rem", color: "#64748BFF", fontFamily: "Inter, sans-serif", lineHeight: 1.3 }}>Guides, setup, and FAQs.</Typography>
                        </Box>
                      </Box>

                      <Box component={Link} to="/resources/api-developers" sx={{ display: "flex", alignItems: "flex-start", height: "76px", gap: 2, p: 1.5, borderRadius: "12px", textDecoration: "none", transition: "background-color 0.2s", "&:hover": { bgcolor: "#F8FAFCFF" } }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#ECFDF5FF", color: "#10B981FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></svg>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172AFF", fontFamily: "Inter, sans-serif", mb: 0.25 }}>API & Developers</Typography>
                          <Typography sx={{ fontSize: "0.85rem", color: "#64748BFF", fontFamily: "Inter, sans-serif", lineHeight: 1.3 }}>Endpoints and webhooks.</Typography>
                        </Box>
                      </Box>

                      <Box component={Link} to="/resources/changelog" sx={{ display: "flex", alignItems: "flex-start", height: "76px", gap: 2, p: 1.5, borderRadius: "12px", textDecoration: "none", transition: "background-color 0.2s", "&:hover": { bgcolor: "#F8FAFCFF" } }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#FAF5FFFF", color: "#A855F7FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172AFF", fontFamily: "Inter, sans-serif", mb: 0.25 }}>Changelog</Typography>
                          <Typography sx={{ fontSize: "0.85rem", color: "#64748BFF", fontFamily: "Inter, sans-serif", lineHeight: 1.3 }}>See what's new in JAF Chatra.</Typography>
                        </Box>
                      </Box>

                      <Box component={Link} to="/resources/blog-guides" sx={{ display: "flex", alignItems: "flex-start", height: "76px", gap: 2, p: 1.5, borderRadius: "12px", textDecoration: "none", transition: "background-color 0.2s", "&:hover": { bgcolor: "#F8FAFCFF" } }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#FFF7EDFF", color: "#F97316FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172AFF", fontFamily: "Inter, sans-serif", mb: 0.25 }}>Blog & Guides</Typography>
                          <Typography sx={{ fontSize: "0.85rem", color: "#64748BFF", fontFamily: "Inter, sans-serif", lineHeight: 1.3 }}>Tips for better customer support.</Typography>
                        </Box>
                      </Box>

                      <Box component={Link} to="/resources/system-status" sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderRadius: "12px", bgcolor: "#F8FAFCFF", textDecoration: "none", border: "1px solid #F1F5F9FF", transition: "border-color 0.2s", "&:hover": { borderColor: "#E2E8F0FF" } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ color: "#64748BFF", display: "flex" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                          </Box>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172AFF", fontFamily: "Inter, sans-serif", lineHeight: 1.2 }}>System<br />Status</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#10B981FF", fontFamily: "Inter, sans-serif", textAlign: "right", lineHeight: 1.2 }}>All systems<br />operational</Typography>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10B981FF", boxShadow: "0 0 0 3px #ECFDF5FF" }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    key={link.label}
                    component="button"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      textDecoration: "none",
                      color: navColor,
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "color 0.2s",
                      background: "none",
                      border: "none",
                      padding: 0,
                      "&:hover": {
                        color: btnColor
                      }
                    }}
                    onClick={() => navigate(link.to)}
                  >
                    {link.label}
                  </Box>
                )
              ))}
            </Stack>

            {/* Actions */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
            >
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: navColor,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  "&:hover": {
                    bgcolor: "transparent",
                    color: btnColor
                  }
                }}
              >
                Log in
              </Button>
              <Button
                component={Link}
                to="/checkout/free-trial"
                variant="contained"
                sx={{
                  bgcolor: btnColor,
                  color: "#FFFFFFFF",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  boxShadow: "none",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  "&:hover": {
                    bgcolor: btnHover,
                    boxShadow: "none",
                  }
                }}
              >
                Sign up free
              </Button>
            </Stack>

            {/* Mobile Toggle */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: "none" }, color: navColor }}
            >
              {mobileOpen ? <X /> : <Menu />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            top: "80px",
            bgcolor: "#FFFFFFFF",
            boxShadow: "0 4px 6px -1px #0000001A",
          }
        }}
      >
        <Box sx={{ p: 2, display: { xs: "block", md: "none" } }}>
          <List>
            {NAV_LINKS.map((link) => (
              <ListItem key={link.label} disablePadding>
                {link.label === "Resources" ? (
                  <ListItemButton
                    onClick={handleDrawerToggle}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: navColor,
                      fontWeight: 500,
                      borderRadius: "8px",
                      mb: 1
                    }}
                  >
                    <ListItemText primary={link.label} disableTypography />
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    component={Link}
                    to={link.to}
                    onClick={handleDrawerToggle}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: navColor,
                      fontWeight: 500,
                      borderRadius: "8px",
                      mb: 1
                    }}
                  >
                    <ListItemText primary={link.label} disableTypography />
                  </ListItemButton>
                )}
              </ListItem>
            ))}
          </List>
          <Stack spacing={2} sx={{ mt: 2, px: 2 }}>
            <Button
              component={Link}
              to="/login"
              fullWidth
              variant="outlined"
              onClick={handleDrawerToggle}
              sx={{
                borderColor: "#E5E7EBFF",
                color: navColor,
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                py: 1
              }}
            >
              Log in
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => { handleDrawerToggle(); setSignupOpen(true); }}
              sx={{
                bgcolor: btnColor,
                color: "#FFFFFFFF",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                py: 1,
                boxShadow: "none",
                "&:hover": { bgcolor: btnHover, boxShadow: "none" }
              }}
            >
              Sign up free
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* ════════════════════ SIGNUP MODAL ════════════════════ */}
      <Dialog
        open={signupOpen}
        onClose={() => { if (!signupProcessing) resetSignupModal(); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            fontFamily: "Inter, sans-serif",
            ...textFieldFix,
          },
        }}
      >
        {signupSuccess ? (
          /* ── Success State ── */
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: "50%", mx: "auto", mb: 3,
              bgcolor: "#16a34a14", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle2 size={48} color="#16a34a" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
              Account Created!
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Your free Starter account is ready. Redirecting you to complete your workspace setup...
            </Typography>
            <CircularProgress size={24} sx={{ color: "grey.400" }} />
          </Box>
        ) : (
          <>
            {/* ── Plan Summary Banner ── */}
            <Box sx={{
              p: 2.5,
              bgcolor: "grey.900",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}>
              <Box sx={{ position: "absolute", top: -20, right: -20, opacity: 0.06 }}>
                <ShieldCheck size={120} />
              </Box>
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "grey.400", mb: 0.25 }}>
                      Selected Plan
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Starter Plan
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    $0
                    <Typography component="span" variant="caption" sx={{ color: "grey.400", ml: 0.25 }}>
                      /mo
                    </Typography>
                  </Typography>
                </Box>

                {/* Feature list */}
                <Stack direction="row" spacing={2} sx={{ mt: 1.5, flexWrap: "wrap", gap: 0.5 }}>
                  {STARTER_FEATURES.map((f) => (
                    <Stack key={f} direction="row" alignItems="center" spacing={0.5}>
                      <Sparkles size={11} color="#4ade80" />
                      <Typography variant="caption" sx={{ color: "grey.300", fontSize: "0.7rem" }}>
                        {f}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                  <ShieldCheck size={14} color="#4ade80" />
                  <Typography variant="caption" sx={{ color: "grey.400" }}>
                    No credit card required · Free forever
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ── Account Form ── */}
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                Create Your Free Account
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                Get started with JAF Chatra in seconds — no payment needed.
              </Typography>

              <form onSubmit={handleSignupSubmit}>
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
                    onChange={(e) => setAccountInfo({ ...accountInfo, confirmPassword: e.target.value })}
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
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ position: 'relative', zIndex: 3 }}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  {/* Total line */}
                  <Box sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    pt: 2, mt: 0.5, borderTop: 1, borderColor: "divider",
                  }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Total Due Today
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                      $0
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      onClick={resetSignupModal}
                      disabled={signupProcessing}
                      sx={{
                        py: 1.5, borderRadius: 3, borderColor: "grey.300",
                        color: "text.primary",
                        "&:hover": { borderColor: "grey.400", bgcolor: "grey.50" },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={signupProcessing}
                      sx={{
                        py: 1.5, borderRadius: 3,
                        background: "linear-gradient(135deg, #0891b2, #0e7490)",
                        boxShadow: "0 8px 24px #0891B240",
                        "&:hover": { background: "linear-gradient(135deg, #0e7490, #155e75)" },
                      }}
                    >
                      {signupProcessing ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Loader2 size={20} className="animate-spin" />
                          <span>Creating Account...</span>
                        </Stack>
                      ) : (
                        "Create Free Account"
                      )}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Box>
          </>
        )}
      </Dialog>
    </>
  );
}

export default Navbar;


