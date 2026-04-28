import { useState } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { user, clearAuth, isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    clearAuth();
    setAnchor(null);
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, color: 'text.primary', textDecoration: 'none', fontWeight: 700 }}
          >
            ReserveSpot
          </Typography>

          <Button color="inherit" component={RouterLink} to="/spots">
            Spots
          </Button>

          {isAdmin() && (
            <Button color="inherit" component={RouterLink} to="/admin">
              Admin
            </Button>
          )}

          {isAuthenticated() ? (
            <>
              <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)}>
                <AccountCircleIcon />
              </IconButton>
              <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </MenuItem>
                <MenuItem component={RouterLink} to="/my-reservations" onClick={() => setAnchor(null)}>
                  My Reservations
                </MenuItem>
                <MenuItem onClick={handleLogout}>Log out</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={RouterLink}
                to="/register"
                sx={{ ml: 1 }}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{ py: 2, px: 3, textAlign: 'center', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} ReserveSpot
        </Typography>
      </Box>
    </Box>
  );
}
