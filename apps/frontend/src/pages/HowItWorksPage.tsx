import { Box, Typography } from "@mui/material";

export const HowItWorksPage: React.FC = () => {
  return (
    <Box textAlign="center" sx={{ px: { xs: 1, md: 2 }, py: { xs: 1, md: 2 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
        How It Works
      </Typography>
      <Typography variant="body1">
        This is a test view.
      </Typography>
    </Box>
  );
};
