import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";

export const MainLayout: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
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
          py: 4,
        }}
      >
        <Outlet />
      </Container>

      <Footer />
    </Box>
  );
};
