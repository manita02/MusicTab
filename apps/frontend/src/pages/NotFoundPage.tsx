import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme/theme";
import { Button } from "../components/Button/Button";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1.5,
        py: { xs: 4, md: 6 },
        px: 2,
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          fontSize: { xs: "1.5rem", md: "1.85rem" },
          background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.contrastText} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        That URL is not part of MusicTab. You can keep browsing the public catalog from home.
      </Typography>
      <Button label="Go home" variantType="primary" onClick={() => navigate("/")} />
    </Box>
  );
};
