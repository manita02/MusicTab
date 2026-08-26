import React from "react";
import Slider from "react-slick";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  useMediaQuery,
  useTheme,
  Chip,
  Tooltip,
} from "@mui/material";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { UserAvatar } from "../../UserAvatar/UserAvatar";
import { resolveInstrumentIco } from "../../../assets/instrumentIcons";

interface TabItem {
  id: number;
  title: string;
  image: string;
  date: string;
  user: string;
  userImg?: string | null;
  instrumentId: number;
}

interface Instrument {
  id: number;
  name: string;
  urlIco?: string;
}

interface TabsSliderProps {
  tabs: TabItem[];
  instruments: Instrument[];
}

const COVER_SX = {
  width: "100%",
  height: { xs: 180, sm: 220, md: 250 },
  objectFit: "cover" as const,
  objectPosition: "center",
};

export const TabsSlider: React.FC<TabsSliderProps> = ({ tabs, instruments }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  const isSm = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const isMd = useMediaQuery(theme.breakpoints.down("lg"), { noSsr: true });

  const handleCardClick = (tab: TabItem) => {
    navigate(`/tabs?search=${encodeURIComponent(tab.title)}`);
  };

  const getInstrument = (id: number) => instruments.find((i) => i.id === id);

  const renderInstrumentBadge = (instrumentId: number) => {
    const instrument = getInstrument(instrumentId);
    const name = instrument?.name || "-";
    const iconUrl = resolveInstrumentIco(instrument?.urlIco);

    if (iconUrl) {
      return (
        <Tooltip title={name} arrow>
          <Box component="span" sx={{ display: "inline-flex", flexShrink: 0 }}>
            <Box
              component="img"
              src={iconUrl}
              alt={name}
              sx={{
                width: 32,
                height: 32,
                p: "2px",
                borderRadius: "50%",
                backgroundColor: theme.palette.warning.main,
                objectFit: "contain",
                boxSizing: "border-box",
              }}
            />
          </Box>
        </Tooltip>
      );
    }

    return (
      <Chip
        label={name}
        size="small"
        sx={{
          fontWeight: 600,
          backgroundColor: theme.palette.warning.main,
          color: theme.palette.warning.contrastText,
          flexShrink: 0,
          height: 22,
          "&:hover": {
            backgroundColor: theme.palette.warning.dark,
          },
        }}
      />
    );
  };

  let slidesToShow = 4;
  let slidesToScroll = 4;
  if (isXs) {
    slidesToShow = 2;
    slidesToScroll = 1;
  } else if (isSm) {
    slidesToShow = 2;
    slidesToScroll = 2;
  } else if (isMd) {
    slidesToShow = 3;
    slidesToScroll = 3;
  }

  const settings = {
    dots: false,
    infinite: tabs.length > slidesToShow,
    speed: 600,
    slidesToShow,
    slidesToScroll,
    arrows: true,
    centerMode: false,
    variableWidth: false,
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        py: { xs: 1.5, md: 2 },
        overflow: "visible",
        "& .slick-slider": {
          overflow: "visible",
        },
        "& .slick-list": {
          px: 0,
          overflow: "hidden",
        },
        "& .slick-slide": {
          px: { xs: 0.5, sm: 0.75 },
        },
        "& .slick-prev, & .slick-next": {
          width: { xs: 28, md: 32 },
          height: { xs: 28, md: 32 },
          zIndex: 20,
          top: "50%",
          transform: "translateY(-50%)",
          borderRadius: "50%",
          backgroundColor: theme.palette.warning.main,
          color: theme.palette.warning.contrastText,
          display: "flex !important",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        },
        "& .slick-prev:hover, & .slick-next:hover": {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.warning.main,
        },
        "& .slick-prev": { left: { xs: 8, sm: 10, md: 12 } },
        "& .slick-next": { right: { xs: 8, sm: 10, md: 12 } },
      }}
    >
      <Slider key={`${slidesToShow}-${slidesToScroll}`} {...settings}>
        {tabs.map((tab) => (
          <Box key={tab.id}>
            <Card
              onClick={() => handleCardClick(tab)}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                backgroundColor: theme.palette.background.paper,
                cursor: "pointer",
                height: "100%",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: `0 0 16px ${theme.palette.warning.main}`,
                  border: `2px solid ${theme.palette.warning.main}`,
                },
              }}
            >
              {tab.image ? (
                <CardMedia
                  component="img"
                  image={tab.image}
                  alt={tab.title}
                  sx={{
                    ...COVER_SX,
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    ...COVER_SX,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}33, ${theme.palette.warning.light}44)`,
                    color: theme.palette.text.secondary,
                    px: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption">
                    Sign in to see cover art for this tab
                  </Typography>
                </Box>
              )}
              <CardContent sx={{ py: 1.25, px: 1.5, "&:last-child": { pb: 1.25 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 0.75,
                    mb: 0.75,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color={theme.palette.text.primary}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                      fontSize: { xs: "0.95rem", md: "1rem" },
                    }}
                  >
                    {tab.title}
                  </Typography>

                  {renderInstrumentBadge(tab.instrumentId)}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    minWidth: 0,
                    color: theme.palette.text.secondary,
                  }}
                >
                  <UserAvatar name={tab.user} src={tab.userImg} size={26} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="caption"
                      component="p"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        lineHeight: 1.2,
                      }}
                    >
                      {tab.user}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <CalendarMonthIcon
                        sx={{ fontSize: 13, color: theme.palette.text.secondary }}
                      />
                      <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                        {new Date(tab.date).toLocaleDateString()}
                      </Typography>
                    </Box>
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
