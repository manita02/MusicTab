import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { TabsSlider } from "../components/Home/TabSlider/TabSlider";
import { AboutSection } from "../components/Home/About";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { useLatestTabs, type TabPreview } from "../api/hooks/useLatestTabs";

export const HomePage: React.FC = () => {
  const { data: tabsData, isLoading, error } = useLatestTabs(8);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && tabsData) {
      const timeout = setTimeout(() => setPageLoading(false), 200);
      return () => clearTimeout(timeout);
    } else {
      setPageLoading(true);
    }
  }, [isLoading, tabsData]);

  const tabs = Array.isArray(tabsData)
    ? tabsData.map((tab: TabPreview) => ({
        id: tab.id,
        title: tab.title,
        image: tab.urlImg || "https://via.placeholder.com/400x225?text=No+Image",
        date: tab.createdAt,
        user: tab.userName || `User #${tab.userId}`,
      }))
    : [];

  return (
    <Box sx={{ backgroundColor: "transparent", mt: 3, position: "relative" }}>
      <IconLoader active={pageLoading || isLoading} />

      {error ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Typography color="error">Error al cargar las últimas tabs.</Typography>
        </Box>
      ) : (
        <>
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
            <TabsSlider tabs={tabs} />
          </Box>

          <AboutSection />
        </>
      )}
    </Box>
  );
};