import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./utils/theme";
import { getTenantFromSubdomain } from "./utils/tenant";
import Layout from "./components/Layout";
import ReservationPage from "./features/reservation-page/ReservationPage";
import LandingPage from "./features/landing/LandingPage";
import AdminDashboard from "./features/admin/AdminDashboard";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ReservationDetailPage from "./features/reservation-detail/ReservationDetailPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

const id = getTenantFromSubdomain();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {id ? (
            <Routes>
              <Route element={<Layout />}>
                <Route path="/rezervace/:id" element={<ReservationDetailPage />} />
                <Route path="*" element={<ReservationPage id={id} />} />
              </Route>
            </Routes>
          ) : (
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="/přihlášení" element={<LoginPage />} />
                <Route path="/registrace" element={<RegisterPage />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/administrace" element={<AdminDashboard />} />
                  </Route>
              </Route>
            </Routes>
          )}
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
