import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";
import { useAuth } from "../api/hooks/useAuth";

export const MainLayout: React.FC = () => {
  const { isLoggedIn, userName, logout } = useAuth();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundImage: `url('https://c1.wallpaperflare.com/preview/52/686/468/guitar-acoustic-guitar-stringed-instrument-instrument.jpg')`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "scroll",
        position: "relative",
      }}
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
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar
          isLoggedIn={isLoggedIn}
          userName={userName || undefined}
          onLogout={logout}
          onLogin={() => console.log("Login clicked")}
          onSignUp={() => console.log("Sign Up clicked")}
        />

        {/* Main content (Outlet renders the current route view) */}
        <Container
          component="main"
          sx={{
            flex: "0 1 auto",
            p: 2,
            m: "auto",
            backgroundColor: "rgba(245, 241, 220, 0.7)",
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            maxWidth: "lg",
          }}
        >
          <Outlet />
        </Container>

        <Footer />
      </Box>
    </Box>
  );
};
