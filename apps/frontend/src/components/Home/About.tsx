import React, { useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { theme } from "../../theme/theme";
import { Button } from "../Button/Button";
import { useAuth } from "../../api/hooks/useAuth";
import { CreateTabDialog } from "../../dialogs/CreateTabDialog";

export const AboutSection: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);
  const handleSaveTab = (data: any) => {
    console.log("Saved tab:", data);
  };

  return (
    <Box textAlign="center" sx={{ mt: 2, mb: 4, px: 3 }}>
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
        sx={{ maxWidth: 600, mx: "auto", mb: 3, textAlign: "justify" }}
      >
        MusicTab is a platform created for sharing and discovering song tabs.
        Explore other users' tabs or upload your own to help the community.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button label="View Tabs" variantType="primary" onClick={() => navigate("/tabs")} />

        <Tooltip title={isLoggedIn ? "" : "Login to create a tab"} arrow>
          <span>
            <Button
              label="Create New Tab"
              variantType="secondary"
              onClick={handleOpenDialog}
              disabled={!isLoggedIn}
            />
          </span>
        </Tooltip>
      </Box>

      <CreateTabDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveTab}
      />
    </Box>
  );
};