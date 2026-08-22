import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { publicCoverUrl, type StatsHit } from "../../api/stats.types";

type StatsTabCardProps = {
  hit: StatsHit;
  caption?: string;
  actionLabel?: string;
  onOpen: (title: string) => void;
};

export const StatsTabCard: React.FC<StatsTabCardProps> = ({
  hit,
  caption,
  actionLabel = "Open tab",
  onOpen,
}) => {
  const theme = useTheme();

  return (
    <Card
      component="button"
      type="button"
      onClick={() => onOpen(hit.title)}
      aria-label={`${actionLabel}: ${hit.title}`}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        border: "none",
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        p: 1,
        "&:hover": {
          boxShadow: `0 0 12px ${theme.palette.warning.main}`,
        },
        "&:focus-visible": {
          outline: `2px solid ${theme.palette.secondary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        component="img"
        src={publicCoverUrl(hit.id)}
        alt=""
        sx={{
          width: 56,
          aspectRatio: "3 / 4",
          objectFit: "cover",
          objectPosition: "center",
          borderRadius: 1,
          flexShrink: 0,
          backgroundColor: "rgba(0,0,0,0.12)",
        }}
      />
      <CardContent sx={{ p: "0 !important", minWidth: 0, flex: 1 }}>
        <Typography fontWeight={700} noWrap>
          {hit.title}
        </Typography>
        {hit.artist ? (
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {hit.artist}
          </Typography>
        ) : null}
        {caption ? (
          <Typography variant="caption" color="text.secondary" display="block">
            {caption}
          </Typography>
        ) : null}
        <Typography variant="caption" fontWeight={600} color="secondary.main">
          {actionLabel}
        </Typography>
      </CardContent>
    </Card>
  );
};
