import { router } from "./routes";
import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./providers/AuthContext";

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </HelmetProvider>
  );
}