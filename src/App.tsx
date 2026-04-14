import { router } from "./routes";
import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/sonner";
import { AuthProvider } from "./providers/AuthContext";
import { AppLoadingProvider } from "./providers/AppLoadingProvider";
import GlobalLoadingOverlay from "./components/GlobalLoadingOverlay";

export default function App() {
  return (
    <HelmetProvider>
      <AppLoadingProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <Toaster richColors position="top-right" />
        <GlobalLoadingOverlay />
      </AppLoadingProvider>
    </HelmetProvider>
  );
}