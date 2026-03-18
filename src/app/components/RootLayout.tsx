import { Outlet } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";

/**
 * SafeThemeProvider acts as a prop firewall between Figma's inspector
 * (which injects `data-fg-*` props via cloneElement onto every React component)
 * and MUI's ThemeProvider (which rejects unknown props).
 * It accepts any props but only forwards `theme` and `children` to ThemeProvider.
 */
function SafeThemeProvider({ children, ...rest }: { children: React.ReactNode; [key: string]: any }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export function RootLayout() {
  return (
    <SafeThemeProvider>
      <CssBaseline />
      <Outlet />
    </SafeThemeProvider>
  );
}