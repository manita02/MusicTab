import React from "react";
import { Box } from "@mui/material";
import puaBot from "../../assets/PuaBot.png";

type PuaIconProps = {
  size?: number;
};

export const PuaIcon: React.FC<PuaIconProps> = ({ size = 36 }) => (
  <Box
    component="img"
    src={puaBot}
    alt=""
    width={size}
    height={size}
    sx={{
      width: size,
      height: size,
      objectFit: "contain",
      display: "block",
      pointerEvents: "none",
      userSelect: "none",
    }}
  />
);
