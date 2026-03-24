import { Outlet } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";
import ScrollToTop from "../components/common/ScrollToTop";

function SafeThemeProvider({ children, ...rest }: { children: React.ReactNode;[key: string]: any }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export function RootLayout() {
  return (
    <SafeThemeProvider>
      <CssBaseline />
      <ScrollToTop />
      <Outlet />
    </SafeThemeProvider>
  );
}

export default RootLayout;
