import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";

export const MainLayout: React.FC = () => {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundImage: `url('https://c1.wallpaperflare.com/preview/52/686/468/guitar-acoustic-guitar-stringed-instrument-instrument.jpg')`, // 🔹 Cambiá esta ruta
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: (theme) => theme.palette.background.default,
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

      <Box sx={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar
          isLoggedIn={false}
          onLogin={() => console.log("Login clicked")}
          onSignUp={() => console.log("Sign Up clicked")}
        />

        {/* Main content (Outlet renders the current route view) */}
        <Container
          component="main"
          sx={{
            flexGrow: 1,
            py: { xs: 4, md: 6 },
            backgroundColor: "rgba(245, 241, 220, 0.7)",
            borderRadius: 2,
            mt: { xs: 2, md: 4 },
            mb: { xs: 2, md: 4 },
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Outlet />
        </Container>

        <Footer />
      </Box>
    </Box>
  );
};
