import React from "react";
import { Avatar } from "@mui/material";

export type UserAvatarProps = {
  name?: string | null;
  src?: string | null;
  size?: number;
};

function initials(name?: string | null) {
  const trimmed = (name || "").trim();
  if (!trimmed || trimmed === "-") return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  size = 32,
}) => (
  <Avatar
    alt={name || "User"}
    src={src || undefined}
    sx={{
      width: size,
      height: size,
      fontSize: Math.max(11, size * 0.38),
      bgcolor: "primary.main",
      color: "primary.contrastText",
      flexShrink: 0,
    }}
  >
    {initials(name)}
  </Avatar>
);
