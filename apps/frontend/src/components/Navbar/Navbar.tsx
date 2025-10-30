import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Button,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  isLoggedIn: boolean;
  userName?: string;
  userAvatar?: string;
  onLogin?: () => void;
  onSignUp?: () => void;
  onEditUser?: () => void;
  onLogout?: () => void;
}

const pages = [
  { label: "HOME", path: "/" },
  //{ label: "HOW IT WORKS", path: "/how-it-works" },
  { label: "TABS", path: "/tabs" },
];

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  userName,
  userAvatar,
  onLogin,
  onSignUp,
  onEditUser,
  onLogout,
}) => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleNavClick = (path: string) => {
    handleCloseNavMenu();
    navigate(path);
  };

  const menuItems = isLoggedIn
    ? [
        { label: "Update User", action: onEditUser },
        { label: "Log Out", action: onLogout },
      ]
    : [
        { label: "Sign Up", action: onSignUp },
        { label: "Login", action: onLogin },
      ];

  return (
    <AppBar position="static" color="primary" sx={{ backgroundColor: theme.palette.primary.main, boxShadow: "none", px: 2 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Mobile Menu */}
        <Box sx={{ display: { xs: "flex", md: "none" }, flexGrow: 0 }}>
          <IconButton
            size="large"
            aria-label="Navigation menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
            sx={{ color: theme.palette.primary.contrastText, "&:hover": { color: theme.palette.secondary.main } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            data-testid="mobile-menu"
            anchorEl={anchorElNav}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            keepMounted
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
          >
            {pages.map(({ label, path }) => (
              <MenuItem key={label} onClick={() => handleNavClick(path)}>
                <Typography textAlign="center">{label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* MusicTab Logo */}
        <Tooltip title="MusicTab" arrow>
          <Box
            data-testid="navbar-logo"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              mr: { xs: 0, md: 4 },
              transition: "transform 0.3s ease, color 0.3s ease",
              "&:hover": { transform: { xs: "translateX(-50%) scale(1.05)", md: "scale(1.05)" } },
              "&:hover .logo-icon": { color: theme.palette.secondary.main },
              "&:hover .logo-text": { color: theme.palette.secondary.main },
              [theme.breakpoints.up("md")]: { position: "relative", left: "unset", transform: "none" },
            }}
            onClick={() => navigate("/")}
          >
            <LibraryMusicIcon className="logo-icon" sx={{ mr: 1, color: theme.palette.primary.contrastText, fontSize: 30, transition: "color 0.3s ease" }} />
            <Typography className="logo-text" variant="h6" component="div"
              sx={{ fontWeight: 700, color: theme.palette.primary.contrastText, letterSpacing: ".05rem", display: { xs: "none", sm: "flex" }, transition: "color 0.3s ease" }}
            >
              MusicTab
            </Typography>
          </Box>
        </Tooltip>

        {/* Desktop Menu */}
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
          {pages.map(({ label, path }) => (
            <Button
              key={label}
              onClick={() => handleNavClick(path)}
              sx={{
                my: 2,
                color: theme.palette.primary.contrastText,
                textTransform: "none",
                fontWeight: 600,
                mx: 1,
                position: "relative",
                overflow: "hidden",
                transition: "color 0.3s ease, transform 0.2s ease",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  width: "100%",
                  transform: "scaleX(0)",
                  height: 2,
                  bottom: 0,
                  left: 0,
                  backgroundColor: theme.palette.secondary.main,
                  transformOrigin: "bottom right",
                  transition: "transform 0.3s ease-out",
                },
                "&:hover::after": { transformOrigin: "bottom left", transform: "scaleX(1)" },
                "&:hover": { color: theme.palette.secondary.main, transform: "translateY(-1px)" },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        {/* User Menu */}
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title={isLoggedIn ? userName || "User" : "Account"} arrow>
            <IconButton
              onClick={handleOpenUserMenu}
              aria-label={isLoggedIn ? `${userName || "User"} menu` : "Account menu"}
              sx={{
                p: 0,
                transition: "transform 0.2s ease, color 0.3s ease",
                "&:hover": { color: theme.palette.warning.main, transform: "scale(1.05)" },
              }}
            >
              {isLoggedIn ? (
                <Avatar alt={userName} src={userAvatar} />
              ) : (
                <AccountCircleIcon sx={{ color: theme.palette.primary.contrastText, fontSize: 36 }} />
              )}
            </IconButton>
          </Tooltip>

          <Menu
            sx={{ mt: "45px" }}
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {isLoggedIn && userName && (
              <MenuItem disabled>
                <Typography textAlign="center" fontWeight={600}>{userName}</Typography>
              </MenuItem>
            )}
            {menuItems.map(({ label, action }) => (
              <MenuItem key={label} onClick={() => { handleCloseUserMenu(); action?.(); }}>
                <Typography textAlign="center">{label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};