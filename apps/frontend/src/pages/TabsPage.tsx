import React from "react";
import { Typography, Box } from "@mui/material";

export const TabsPage: React.FC = () => {
  return (
    <Box textAlign="center">
      <Typography variant="h4" gutterBottom>
        Tabs Page
      </Typography>
      <Typography variant="body1">
        Here is where the tabs content will be displayed. 
      </Typography>
    </Box>
  );
};
