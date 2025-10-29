import React from "react";
import { Box, Typography, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 3,
        mt: "auto",
        textAlign: "center",
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        borderTop: `1px solid ${theme.palette.mode === "light" ? "#e0e0e0" : "#444"}`,
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} <strong>MusicTab</strong>. All rights reserved.
      </Typography>

      <Typography variant="body2" sx={{ mt: 0.5 }}>
        Developed by{" "}
        <Link
          href="https://github.com/manita02"
          underline="hover"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": { color: theme.palette.secondary.main },
            transition: "color 0.2s ease",
          }}
        >
          Ana Lucia Juarez
        </Link>
      </Typography>
    </Box>
  );
};