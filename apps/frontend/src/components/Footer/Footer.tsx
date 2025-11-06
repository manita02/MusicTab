import React from "react";
import { Box, Typography, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import forItLogo from "../../assets/forIt_logo.png";
import formarLogo from "../../assets/formar_logo.png";

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
        borderTop: `1px solid ${
          theme.palette.mode === "light" ? "#e0e0e0" : "#444"
        }`,
      }}
    >
  
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          px: 4,
          gap: 2,
        }}
      >
      
        <Link
          href="https://forit.ar"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-block",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              opacity: 0.85,
            },
          }}
        >
          <Box component="img" src={forItLogo} alt="Logo For IT" sx={{ height: 45 }} />
        </Link>

        <Box sx={{ textAlign: "center", flex: 1 }}>
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

        <Link
          href="https://fundacionformar.ar"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-block",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              opacity: 0.85,
            },
          }}
        >
          <Box component="img" src={formarLogo} alt="Logo Fundación Formar" sx={{ height: 40 }} />
        </Link>
      </Box>

      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
  
        <Box sx={{ textAlign: "center" }}>
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

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Link
            href="https://forit.ar"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "inline-block",
              transition: "transform 0.3s ease, opacity 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
                opacity: 0.85,
              },
            }}
          >
            <Box
              component="img"
              src={forItLogo}
              alt="Logo For IT"
              sx={{ height: 30, width: "auto" }}
            />
          </Link>

          <Link
            href="https://fundacionformar.ar"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "inline-block",
              transition: "transform 0.3s ease, opacity 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
                opacity: 0.85,
              },
            }}
          >
            <Box
              component="img"
              src={formarLogo}
              alt="Logo Fundación Formar"
              sx={{ height: 30, width: "auto" }}
            />
          </Link>
        </Box>
      </Box>
    </Box>
  );
};