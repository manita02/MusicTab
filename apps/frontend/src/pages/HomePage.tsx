import React from "react";
import { Typography, Box } from "@mui/material";

export const HomePage: React.FC = () => {
  return (
    <Box textAlign="center">
      <Typography variant="h4" gutterBottom>
        Home Page
      </Typography>
      <Typography variant="body1">
        Welcome to the home page of the site.  
      </Typography>
    </Box>
  );
};
