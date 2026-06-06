import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button, IconButton, Stack } from "@mui/material";
import { PageName } from "../constants";
import { useAuthStore } from "../store/authStore";
import LogoutIcon from '@mui/icons-material/Logout';

export default function Layout() {
  const { isAuthenticated, clearAuth, user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    clearAuth();
    navigate("/přihlášení");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "background.default",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ backgroundColor: "rgb(65,130, 216)" }}>
          <Box component="img" alt="Logo" src="/favicon.ico" />
          <RouterLink to="/" style={{ textDecoration: "none" }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700, ml: 1 }}>
              {PageName}
            </Typography>
          </RouterLink>
          <Box sx={{ flex: 1 }} />
          {isAuthenticated() ? (
            <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
              <Button
                component={RouterLink}
                to="/administrace"
                sx={{ color: "white", textTransform: "none" }}
              >
                Administrace
              </Button>
              <Typography variant="caption" sx={{ color: "white" }}>
                {user?.email}
              </Typography>
              <IconButton
                onClick={handleLogout}
                sx={{ color: "white", textTransform: "none" }}
              >
                <LogoutIcon/>
              </IconButton>
            </Stack>
          ) : (
            <Button
              component="a"
              href={`${import.meta.env.VITE_APP_URL}/přihlášení`}
              sx={{ color: "white", textTransform: "none" }}
            >
              Přihlášení
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          textAlign: "center",
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} {PageName}
        </Typography>
      </Box>
    </Box>
  );
}
