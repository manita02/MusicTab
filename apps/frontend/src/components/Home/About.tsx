import React, { useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { theme } from "../../theme/theme";
import { Button } from "../Button/Button";
import { useAuth } from "../../api/hooks/useAuth";
import { CreateTabDialog } from "../../dialogs/CreateTabDialog";
import { canManageTabs, normalizeRole } from "../../auth/tabPermissions";

export const AboutSection: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const canManage = canManageTabs(isLoggedIn, normalizeRole(userRole));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);
  const handleSaveTab = (data: any) => {
    console.log("Saved tab:", data);
  };
  const handleTabCreated = () => {
    setIsDialogOpen(false);
    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  return (
    <Box textAlign="center" sx={{ mt: { xs: 1, md: 1.5 }, mb: { xs: 1, md: 2 }, px: { xs: 1, md: 2 } }}>
      <Typography
        variant="h5"
        fontWeight={700}
        gutterBottom
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.contrastText} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "2px 2px 6px rgba(0, 0, 0, 0.15)",
          fontSize: { xs: "1.15rem", md: "1.35rem" },
          letterSpacing: "0.5px",
          mb: 1,
        }}
      >
        About MusicTab
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 640, mx: "auto", mb: 2, textAlign: { xs: "left", sm: "justify" }, fontSize: { xs: "0.9rem", md: "1rem" } }}
      >
        MusicTab is a platform created for sharing and discovering song tabs.
        Explore other users' tabs or upload your own to help the community.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Button label="View Tabs" variantType="primary" onClick={() => navigate("/tabs")} />

        <Tooltip title={canManage ? "" : "Only administrators can create tabs"} arrow>
          <span>
            <Button
              label="Create New Tab"
              variantType="secondary"
              onClick={handleOpenDialog}
              disabled={!canManage}
            />
          </span>
        </Tooltip>
      </Box>

      <CreateTabDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveTab}
        onCreated={handleTabCreated}
      />
    </Box>
  );
};