import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";
import { CopilotDrawer } from "../components/Copilot/CopilotDrawer";
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
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        position: "relative",
      }}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${bgDesktop})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          pointerEvents: "none",
          [theme.breakpoints.down("sm")]: {
            backgroundImage: `url(${bgMobile})`,
            backgroundPosition: "center",
          },
        })}
      />
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          zIndex: 0,
          pointerEvents: "none",
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
          justifyContent: "flex-start",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarGutter: "stable",
          minHeight: "100dvh",
          pt: { xs: 8, sm: 8.5, md: 9 },
          pb: { xs: 8, sm: 7.5, md: 7 },
        }}
      >
        <Container
          component="main"
          maxWidth="lg"
          sx={{
            p: { xs: 1.5, sm: 2, md: 2.5 },
            mb: { xs: 1, md: 1.5 },
            backgroundColor: "rgba(245, 241, 220, 0.75)",
            borderRadius: { xs: 2, md: 3 },
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            alignSelf: "center",
            minWidth: 0,
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
      <CopilotDrawer isLoggedIn={isLoggedIn} />
    </Box>
  );
};

