import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { opensForBar, type StatsHit } from "../../api/stats.types";

const ORANGE_LIGHT = "#FFD6A3";
const ORANGE_MID = "#FF9730";
const ORANGE_DARK = "#C44E00";

function hexChannel(hex: string, shift: number): number {
  return (parseInt(hex.slice(1), 16) >> shift) & 255;
}

function mixHex(from: string, to: string, t: number): string {
  const clamp = Math.min(1, Math.max(0, t));
  const ch = (shift: number) =>
    Math.round(hexChannel(from, shift) + (hexChannel(to, shift) - hexChannel(from, shift)) * clamp);
  return `#${[ch(16), ch(8), ch(0)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function barOrange(opens: number, min: number, max: number): string {
  if (max <= min) return ORANGE_MID;
  const t = (opens - min) / (max - min);
  return t < 0.5 ? mixHex(ORANGE_LIGHT, ORANGE_MID, t * 2) : mixHex(ORANGE_MID, ORANGE_DARK, (t - 0.5) * 2);
}

type StatsBarListProps = {
  title: string;
  hits: StatsHit[];
  personal: boolean;
  emptyLabel: string;
  onOpen: (title: string) => void;
};

export const StatsBarList: React.FC<StatsBarListProps> = ({
  title,
  hits,
  personal,
  emptyLabel,
  onOpen,
}) => {
  const theme = useTheme();
  const counts = hits.map((h) => opensForBar(h, personal));
  const max = Math.max(1, ...counts);
  const min = counts.length ? Math.min(...counts) : 0;

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} textAlign="center" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {hits.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {emptyLabel}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-evenly",
            gap: { xs: 1, sm: 1.5, md: 2 },
            minHeight: { xs: 240, sm: 260, md: 280 },
            px: { xs: 0.5, sm: 1 },
          }}
        >
          {hits.map((hit) => {
            const opens = opensForBar(hit, personal);
            const pct = Math.max(12, Math.round((opens / max) * 100));
            const fill = barOrange(opens, min, max);
            const label = hit.artist ? `${hit.title} by ${hit.artist}` : hit.title;
            return (
              <Box
                key={hit.id}
                component="button"
                type="button"
                onClick={() => onOpen(hit.title)}
                aria-label={`${label}, ${opens} opens`}
                title={label}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  maxWidth: { xs: 120, sm: 148, md: 168 },
                  minWidth: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  p: 0,
                  "&:focus-visible": {
                    outline: `2px solid ${theme.palette.secondary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, flexShrink: 0 }}>
                  {opens}
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: { xs: 140, sm: 160, md: 176 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 28, sm: 36, md: 44 },
                      height: `${pct}%`,
                      borderRadius: "8px 8px 2px 2px",
                      background: `linear-gradient(180deg, ${mixHex(fill, "#FFFFFF", 0.22)} 0%, ${fill} 100%)`,
                      transition: "height 0.25s ease, filter 0.2s ease",
                      "&:hover": { filter: "brightness(1.08)" },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: "100%",
                    mt: 0.75,
                    pt: 0.5,
                    borderTop: `2px solid ${theme.palette.primary.main}33`,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    textAlign="center"
                    sx={{
                      width: "100%",
                      lineHeight: 1.3,
                      minHeight: "2.6em",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {hit.title}
                  </Typography>
                  {hit.artist ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      textAlign="center"
                      noWrap
                      sx={{
                        display: "block",
                        width: "100%",
                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                      }}
                    >
                      {hit.artist}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
