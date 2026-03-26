import { Outlet } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";
import ScrollToTop from "../components/common/ScrollToTop";
import RouteNavigationBlocker from "../components/common/RouteNavigationBlocker";

function SafeThemeProvider({ children, ...rest }: { children: React.ReactNode;[key: string]: any }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export function RootLayout() {
  return (
    <SafeThemeProvider>
      <CssBaseline />
      <RouteNavigationBlocker />
      <ScrollToTop />
      <Outlet />
    </SafeThemeProvider>
  );
}

export default RootLayout;
