import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { theme } from "../../theme/theme";
import { Button } from "../Button/Button";

export const AboutSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" sx={{ mt: 6, px: 3 }}>
      <Typography
        variant="h5"
        fontWeight={700}
        gutterBottom
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.contrastText} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "2px 2px 6px rgba(0, 0, 0, 0.15)",
          letterSpacing: "0.5px",
          mb: 2,
        }}
      >
        About MusicTab
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ 
          maxWidth: 600, 
          mx: "auto", 
          mb: 3,
          textAlign: "justify"
        }}
      >
        MusicTab is a platform created for sharing and discovering song tabs.
        Explore other users' tabs or upload your own to help the community.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button label="View Tabs" variantType="primary" onClick={() => navigate("/tabs")} />
        <Button label="Create New Tab" variantType="secondary" onClick={() => navigate("/create-tab")} />
      </Box>
    </Box>
  );
};