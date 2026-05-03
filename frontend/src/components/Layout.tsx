import { Outlet, Link as RouterLink } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";
import { PageName } from "../constants";

export default function Layout() {
  // const { user, clearAuth, isAuthenticated, isAdmin } = useAuthStore();
  // const navigate = useNavigate();
  // const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  // const handleLogout = () => {
  //   clearAuth();
  //   setAnchor(null);
  //   navigate("/login");
  // };

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
