import { createTheme } from "@mui/material/styles";

const sharedTypography = {
  fontFamily: "Inter, sans-serif",
  h1: { fontWeight: 800, letterSpacing: "-0.02em" },
  h2: { fontWeight: 800, letterSpacing: "-0.02em" },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { textTransform: "none" as const, fontWeight: 600 },
};

const sharedShape = { borderRadius: 12 };

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        padding: "10px 24px",
        fontSize: "0.9rem",
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
      },
      containedPrimary: {
        background: "linear-gradient(135deg, #0891b2, #0e7490)",
        "&:hover": { background: "linear-gradient(135deg, #0e7490, #155e75)" },
      },
    },
  },
  MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: "0 1px 3px #0000000f",
        border: "1px solid #0000000f",
      },
    },
  },
  MuiChip: { styleOverrides: { root: { fontWeight: 600, fontSize: "0.75rem" } } },
  MuiTextField: {
    styleOverrides: {
      root: { "& .MuiOutlinedInput-root": { borderRadius: 12 } },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        color: "#6b7280",
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: { body: { fontFamily: "Inter, sans-serif" } },
  },
};

const theme = createTheme({
  palette: {
    primary: { main: "#0891b2", light: "#22d3ee", dark: "#0e7490", contrastText: "#ffffff" },
    secondary: { main: "#164e63", light: "#1e6a7a", dark: "#0c3547", contrastText: "#ffffff" },
    success: { main: "#16a34a", light: "#22c55e", dark: "#15803d" },
    warning: { main: "#eab308", light: "#facc15", dark: "#ca8a04" },
    error: { main: "#DC2626", light: "#ef4444", dark: "#b91c1c" },
    info: { main: "#0891b2", light: "#22d3ee", dark: "#0e7490" },
    background: { default: "#fafafa", paper: "#ffffff" },
    text: { primary: "#111111", secondary: "#555555" },
    grey: {
      50: "#fafafa", 100: "#f5f5f5", 200: "#e5e5e5", 300: "#d4d4d4",
      400: "#a3a3a3", 500: "#737373", 600: "#525252", 700: "#404040",
      800: "#262626", 900: "#171717",
      A100: "#f5f5f5", A200: "#e5e5e5", A400: "#a3a3a3", A700: "#404040",
    },
    divider: "#E0E0E0",
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: sharedComponents,
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#0891b2", light: "#22d3ee", dark: "#0e7490", contrastText: "#ffffff" },
    secondary: { main: "#164e63", light: "#1e6a7a", dark: "#0c3547", contrastText: "#ffffff" },
    success: { main: "#16a34a", light: "#22c55e", dark: "#15803d" },
    warning: { main: "#eab308", light: "#facc15", dark: "#ca8a04" },
    error: { main: "#DC2626", light: "#ef4444", dark: "#b91c1c" },
    info: { main: "#22d3ee", light: "#67e8f9", dark: "#0891b2" },
    background: { default: "#0f172a", paper: "#1e293b" },
    text: { primary: "#f1f5f9", secondary: "#94a3b8" },
    grey: {
      50: "#1e293b", 100: "#334155", 200: "#475569", 300: "#64748b",
      400: "#94a3b8", 500: "#cbd5e1", 600: "#e2e8f0", 700: "#f1f5f9",
      800: "#f8fafc", 900: "#ffffff",
      A100: "#334155", A200: "#475569", A400: "#94a3b8", A700: "#f1f5f9",
    },
    divider: "#334155",
  },
  typography: sharedTypography,
  shape: sharedShape,
  components: {
    ...sharedComponents,
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: "0.75rem",
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
          color: "#94a3b8",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px #00000040",
          border: "1px solid #334155",
        },
      },
    },
  },
});

export default theme;