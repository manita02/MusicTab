import React from "react";
import { Chip } from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PersonIcon from "@mui/icons-material/Person";

type RoleBadgeProps = {
  role?: "ADMIN" | "USER" | string | null;
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const isAdmin = (role ?? "").toUpperCase() === "ADMIN";

  return (
    <Chip
      size="small"
      label={isAdmin ? "Admin" : "User"}
      icon={
        isAdmin ? (
          <WorkspacePremiumIcon sx={{ fontSize: 18, color: "white" }} />
        ) : (
          <PersonIcon sx={{ fontSize: 18, color: "white" }} />
        )
      }
      sx={{
        fontWeight: 600,
        pl: 0.5,
        backgroundColor: isAdmin ? "#FF9100" : "#2979FF",
        color: "white",
        "& .MuiChip-icon": { ml: "4px" },
        "&:hover": {
          backgroundColor: isAdmin ? "#FB8C00" : "#1565C0",
        },
        boxShadow: isAdmin
          ? "0 2px 6px rgba(255,145,0,0.4)"
          : "0 2px 6px rgba(41,121,255,0.4)",
      }}
    />
  );
};
