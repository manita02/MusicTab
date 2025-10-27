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
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from "@mui/material/styles";
import { theme } from "../../theme/theme";

interface NavbarProps {
  isLoggedIn: boolean;
  userName?: string;
  userAvatar?: string;
  onLogin?: () => void;
  onSignUp?: () => void;
  onEditUser?: () => void;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

const pages = ['HOME', 'HOW IT WORKS', 'TABS'];

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  userName,
  userAvatar,
  onLogin,
  onSignUp,
  onEditUser,
  onLogout,
  onNavigate,
}) => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
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

  const handleNavClick = (page: string) => {
    handleCloseNavMenu();
    onNavigate?.(page);
  };

  return (
    <AppBar
      position="static"
      color="primary"
      sx={{
        backgroundColor: theme.palette.primary.main,
        boxShadow: "none",
        px: 2,
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="Navigation menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {pages.map((page) => (
              <MenuItem key={page} onClick={() => handleNavClick(page)}>
                <Typography textAlign="center">{page}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: { xs: 0, md: 4 } }}
        >
          <LibraryMusicIcon sx={{ mr: 1, color: theme.palette.primary.contrastText, fontSize: 30 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.contrastText,
              letterSpacing: ".05rem",
              display: { xs: 'none', sm: 'flex' } 
            }}
          >
            MusicTab
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
        {pages.map((page) => (
            <Button
            key={page}
            onClick={() => handleNavClick(page)}
            sx={{
                my: 2,
                color: theme.palette.primary.contrastText,
                display: 'block',
                textTransform: 'none',
                fontWeight: 600,
                mx: 1,
                position: "relative",
                overflow: "hidden",
                "&::after": {
                content: '""',
                position: "absolute",
                width: "100%",
                transform: "scaleX(1)",
                height: 2,
                bottom: 0,
                left: 0,
                backgroundColor: theme.palette.primary.contrastText,
                transformOrigin: "bottom right",
                transition: "transform 0.3s ease-out",
                },
                "&:hover::after": {
                transformOrigin: "bottom left",
                transform: "scaleX(1.2)",
                },
                "&:hover": {
                filter: "brightness(1.1)",
                },
            }}
            >
            {page}
            </Button>
        ))}
        </Box>

        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title={isLoggedIn ? userName || "User" : "Account"}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
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
                <Typography textAlign="center" fontWeight={600}>
                  {userName}
                </Typography>
              </MenuItem>
            )}
            {menuItems.map(({ label, action }) => (
              <MenuItem
                key={label}
                onClick={() => {
                  handleCloseUserMenu();
                  action?.();
                }}
              >
                <Typography textAlign="center">{label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};