import React from "react";
import { CircularProgress, Box, useTheme } from "@mui/material";

export interface IconLoaderProps {
  active: boolean;
}

export const IconLoader: React.FC<IconLoaderProps> = ({ active }) => {
  const theme = useTheme();

  if (!active) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="theme_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.primary.main} />
            <stop offset="100%" stopColor={theme.palette.secondary.main} />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress 
        size={60} 
        thickness={5} 
        sx={{ 'svg circle': { stroke: 'url(#theme_gradient)' } }} 
        />
    </Box>
  );
};