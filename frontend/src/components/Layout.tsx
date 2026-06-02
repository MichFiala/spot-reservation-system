import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button, Stack } from "@mui/material";
import { PageName } from "../constants";
import { useAuthStore } from "../store/authStore";

export default function Layout() {
  const { isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
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
          <Stack
            sx={{
              alignItems: "center",
              backgroundColor: "rgb(65,130, 216)",
              borderRadius: 1,
              flexGrow: 1,
            }}
            direction="row"
          >
              <Box
                component="img"
                alt="The house from the offer."
                src="/favicon.ico"
              />
            <RouterLink to="/" style={{ textDecoration: "none" }}>
              <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  color: "white",
                  backgroundColor: "rgb(65,130, 216)",
                  fontWeight: 700,
                }}
              >
                {PageName}
              </Typography>
            </RouterLink>
          </Stack>
          {isAuthenticated() ? (
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/administrace" sx={{ color: "white", textTransform: "none" }}>
                Administrace
              </Button>
              <Button onClick={handleLogout} sx={{ color: "white", textTransform: "none" }}>
                Odhlásit
              </Button>
            </Stack>
          ) : (
            <Button component={RouterLink} to="/přihlášení" sx={{ color: "white", textTransform: "none" }}>
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
