import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./providers/AuthContext";

// Suppress Figma Make inspector false-positive warnings.
// Figma's FGCmp wraps every React component (including MUI internals like
// ThemeProvider) and injects `data-fg-*` props via cloneElement. MUI's
// prop-types checker rejects these as unsupported, producing console noise.
// This filter silences only that specific warning without hiding real errors.
const _consoleError = console.error.bind(console);
const _consoleWarn = console.warn.bind(console);

// Filter: Figma inspector data-fg prop warnings (MUI false-positive)
// Filter: recharts v2 internal duplicate-key warning (known bug in renderClipPath)
const suppressPattern = (args: unknown[]): boolean => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  const detail = typeof args[1] === "string" ? args[1] : "";

  // Figma inspector data-fg prop warnings
  if (
    args.some(
      (a) => typeof a === "string" && a.includes("props are not supported")
    ) &&
    args.some((a) => typeof a === "string" && a.includes("data-fg"))
  ) {
    return true;
  }

  // recharts v2 duplicate SVG child key warning (internal bug, cosmetic only)
  if (
    msg.includes("Encountered two children with the same key") &&
    args.some(
      (a) =>
        typeof a === "string" &&
        (a.includes("recharts") ||
          a.includes("CategoricalChart") ||
          a.includes("Surface"))
    )
  ) {
    return true;
  }

  return false;
};

console.error = (...args: unknown[]) => {
  if (suppressPattern(args)) return;
  _consoleError(...args);
};
console.warn = (...args: unknown[]) => {
  if (suppressPattern(args)) return;
  _consoleWarn(...args);
};

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}