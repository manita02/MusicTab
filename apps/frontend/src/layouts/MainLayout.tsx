import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";
import { useAuth } from "../api/hooks/useAuth";
import { ManageProfileDialog } from "../dialogs/ManageProfileDialog";
import bgDesktop from "../assets/desktop_background.jpg";
import bgMobile from "../assets/mobile_background.jpg";

export const MainLayout: React.FC = () => {
  const { isLoggedIn, userName, userImg, logout, userRole } = useAuth();
  const [openManageProfile, setOpenManageProfile] = useState(false);
  const handleOpenManageProfile = () => setOpenManageProfile(true);
  const handleCloseManageProfile = () => setOpenManageProfile(false);
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
        backgroundImage: `url(${bgDesktop})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        [theme.breakpoints.down("sm")]: {
          backgroundImage: `url(${bgMobile})`,
          backgroundPosition: "center",
        },
      })}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <Navbar
          isLoggedIn={isLoggedIn}
          userName={userName || undefined}
          userAvatar={userImg || undefined}
          userRole={
            userRole === "ADMIN"
              ? "ADMIN"
              : userRole === "USER"
              ? "USER"
              : undefined
          }
          onLogout={logout}
          onLogin={() => console.log("Login clicked")}
          onSignUp={() => console.log("Sign Up clicked")}
          onManageProfile={handleOpenManageProfile}
        />
      </Box>

      {/* Main content (Outlet renders the current route view) */}
      <Box
        sx={{
          flex: 1,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflowY: "auto",
          minHeight: "100vh",
          pt: { xs: 10, md: 12 },
          pb: { xs: 18, sm: 14, md: 12 },
        }}
      >
        <Container
          component="main"
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            backgroundColor: "rgba(245, 241, 220, 0.75)",
            borderRadius: 3,
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            maxWidth: "md",
            width: "100%",
            alignSelf: "center",
          }}
        >
          <Outlet />
        </Container>
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <Footer />
      </Box>
      <ManageProfileDialog
        open={openManageProfile}
        onClose={handleCloseManageProfile}
      />
    </Box>
  );
};
