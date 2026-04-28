import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './utils/theme';
import { getTenantFromSubdomain } from './utils/tenant';
import Layout from './components/Layout';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ReservationPage from './features/reservation-page/ReservationPage';
import ReservationPagesAdmin from './features/admin/Pages';
import LandingPage from './features/landing/LandingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

const slug = getTenantFromSubdomain();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {slug ? (
            <Routes>
              <Route element={<Layout />}>
                <Route path="*" element={<ReservationPage slug={slug} />} />
              </Route>
            </Routes>
          ) : (
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="reserve" element={<ReservationPage />} />
                <Route path="/reservation-pages/:slug" element={<ReservationPagesAdmin />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>
            </Routes>
          )}
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
