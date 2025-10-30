import React from "react";
import Slider from "react-slick";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  useTheme,
} from "@mui/material";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface TabItem {
  id: number;
  title: string;
  image: string;
  date: string;
  user: string;
}

interface TabsSliderProps {
  tabs: TabItem[];
}

export const TabsSlider: React.FC<TabsSliderProps> = ({ tabs }) => {
  const theme = useTheme();

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
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                backgroundColor: theme.palette.background.paper,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardMedia
                component="img"
                image={tab.image}
                height="180"
                alt={tab.title}
              />
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color={theme.palette.text.primary}
                >
                  {tab.title}
                </Typography>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                  Uploaded by {tab.user}
                </Typography>
                <Typography variant="caption" color={theme.palette.text.secondary}>
                  {new Date(tab.date).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};
