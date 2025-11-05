import React from "react";
import Slider from "react-slick";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  useTheme,
  Chip
} from "@mui/material";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface TabItem {
  id: number;
  title: string;
  image: string;
  date: string;
  user: string;
  instrumentId: number;
}

interface Instrument {
  id: number;
  name: string;
}

interface TabsSliderProps {
  tabs: TabItem[];
  instruments: Instrument[];
}

export const TabsSlider: React.FC<TabsSliderProps> = ({ tabs, instruments }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const handleCardClick = (tab: TabItem) => {
    navigate(`/tabs?search=${encodeURIComponent(tab.title)}`);
  };

  const getInstrumentName = (id: number) =>
    instruments.find((i: any) => i.id === id)?.name || "-";

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 900, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <Box
        sx={{
            position: "relative",
            width: "100%",
            py: 4,
            "& .slick-list": {
            px: { xs: 2, sm: 0 },
            },
            "& .slick-prev, & .slick-next": {
            width: 35,         
            height: 35,
            zIndex: 10,
            top: "50%",
            transform: "translateY(-50%)",
            borderRadius: "50%",
            backgroundColor: theme.palette.warning.main,
            color: theme.palette.warning.contrastText,
            display: "flex !important",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            },
            "& .slick-prev:hover, & .slick-next:hover": {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.warning.main,
            },
            "& .slick-prev": { left: { xs: 8, sm: 0 } },
            "& .slick-next": { right: { xs: 8, sm: 0 } },
        }}
    >

      <Slider {...settings}>
        {tabs.map((tab) => (
          <Box key={tab.id} px={1}>
            <Card
              onClick={() => handleCardClick(tab)}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                backgroundColor: theme.palette.background.paper,
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: `0 0 16px ${theme.palette.warning.main}`,
                  border: `2px solid ${theme.palette.warning.main}`,
                },
              }}
            >
              <CardMedia
                component="img"
                image={tab.image}
                height="250"
                alt={tab.title}
              />
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color={theme.palette.text.primary}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "70%",
                    }}
                  >
                    {tab.title}
                  </Typography>

                  <Chip
                    label={getInstrumentName(tab.instrumentId)}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: theme.palette.warning.main,
                      color: theme.palette.warning.contrastText,
                      ml: 1,
                      flexShrink: 0,
                      "&:hover": {
                        backgroundColor: theme.palette.warning.dark,
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    flexWrap: "wrap",
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Typography variant="body2">
                    By <strong>{tab.user}</strong> •{" "}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarMonthIcon
                      sx={{ fontSize: 16, color: theme.palette.text.secondary }}
                    />
                    <Typography variant="body2">
                      {new Date(tab.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};
