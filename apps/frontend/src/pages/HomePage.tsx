import React from "react";
import { Box, Typography } from "@mui/material";
import { TabsSlider } from "../components/Home/TabSlider/TabSlider";
import { AboutSection } from "../components/Home/About";

const mockTabs = [
  { id: 1, title: "Wonderwall", image: "https://img.freepik.com/free-vector/gradient-album-cover-template_23-2150597431.jpg?semt=ais_hybrid&w=740&q=80", date: "2025-09-20", user: "Ana" },
  { id: 2, title: "Hotel California", image: "https://img.freepik.com/premium-psd/plastic-overlay-album-art-cover-psd-template-02_984100-730.jpg?w=360", date: "2025-09-21", user: "Juan" },
  { id: 3, title: "Nothing Else Matters", image: "https://i.pinimg.com/736x/cd/06/e1/cd06e1cec5800a10d0ff9488363c26fa.jpg", date: "2025-09-22", user: "Mia" },
  { id: 4, title: "Creep", image: "https://img.freepik.com/free-vector/gradient-album-cover-template_23-2150597431.jpg?semt=ais_hybrid&w=740&q=80", date: "2025-09-23", user: "Leo" },
  { id: 5, title: "Blackbird", image: "https://img.freepik.com/free-vector/gradient-album-cover-template_23-2150597431.jpg?semt=ais_hybrid&w=740&q=80", date: "2025-09-24", user: "Sara" },
  { id: 6, title: "Imagine", image: "https://img.freepik.com/free-vector/gradient-album-cover-template_23-2150597431.jpg?semt=ais_hybrid&w=740&q=80", date: "2025-09-25", user: "Tomás" },
];

export const HomePage: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: "transparent", mt: 3 }}>
      <Typography
        variant="h4"
        textAlign="center"
        fontWeight={700}
        sx={{
          position: "relative",
          display: "inline-block",
          mx: "auto",
          px: 3,
          pb: 1,
          color: (theme) => theme.palette.text.primary,
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: "3px",
            borderRadius: "2px",
            background: (theme) =>
              `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.primary.main})`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          },
        }}
      >
        Latest tabs uploaded
      </Typography>
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          overflow: "visible",
          backgroundColor: "transparent",
        }}
      >
        <TabsSlider tabs={mockTabs} />
      </Box>
      <AboutSection />
    </Box>
  );
};
