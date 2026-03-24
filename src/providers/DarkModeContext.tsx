import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme, { darkTheme } from "../theme";

interface DarkModeContextType {
  isDark: boolean;
  toggleDark: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggleDark: () => { },
});

export { DarkModeContext };

export function useDarkMode() {
  return useContext(DarkModeContext);
}

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem("jaf_dark_mode") === "true";
    } catch {
      return false;
    }
  });

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jaf_dark_mode", String(next));
      } catch {
        // silently fail
      }
      return next;
    });
  };

  // Keep the <html> element in sync so any global CSS also knows the mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
}
