import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme/theme";
import { Button } from "../components/Button/Button";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { StatsBarList } from "../components/Stats/StatsBarList";
import { StatsTabCard } from "../components/Stats/StatsTabCard";
import { useAuth } from "../api/hooks/useAuth";
import { useStatsGlobal, useStatsMe } from "../api/hooks/useStats";
import type { StatsHit } from "../api/stats.types";

type Scope = "me" | "community";

function formatOpenedAt(iso?: string) {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString();
}

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

function isOpenedRecently(hit: StatsHit): boolean {
  if (!hit.lastViewedAt) return false;
  const at = new Date(hit.lastViewedAt).getTime();
  if (Number.isNaN(at)) return false;
  return Date.now() - at < STALE_AFTER_MS;
}

function mergePickup(never: StatsHit[], stale: StatsHit[]): StatsHit[] {
  const seen = new Set<number>();
  const merged: StatsHit[] = [];
  for (const hit of [...never, ...stale]) {
    if (seen.has(hit.id)) continue;
    if (isOpenedRecently(hit)) continue;
    seen.add(hit.id);
    merged.push(hit);
  }
  return merged;
}

export const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [scope, setScope] = useState<Scope>(isLoggedIn ? "me" : "community");

  const globalQuery = useStatsGlobal();
  const meQuery = useStatsMe(isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) setScope("community");
  }, [isLoggedIn]);

  const openTab = (title: string) => {
    navigate(`/tabs?search=${encodeURIComponent(title)}`);
  };

  const goLogin = () => navigate("/login");

  const loading =
    globalQuery.isLoading || (isLoggedIn && scope === "me" && meQuery.isLoading);

  const most =
    scope === "me" ? meQuery.data?.most ?? [] : globalQuery.data?.most ?? [];
  const least =
    scope === "me" ? meQuery.data?.least ?? [] : globalQuery.data?.least ?? [];
  const lastViewed = meQuery.data?.lastViewed ?? null;
  const neverIds = useMemo(
    () => new Set((meQuery.data?.never ?? []).map((h) => h.id)),
    [meQuery.data?.never],
  );
  const pickup = useMemo(
    () => mergePickup(meQuery.data?.never ?? [], meQuery.data?.stale ?? []),
    [meQuery.data?.never, meQuery.data?.stale],
  );

  const emptyMost =
    scope === "me" ? "No PDF opens yet" : "No community views yet";
  const emptyLeast =
    most.length > 0
      ? "Need more tabs with fewer opens"
      : emptyMost;

  return (
    <Box sx={{ position: "relative", py: { xs: 1, md: 1.5 } }}>
      <IconLoader active={loading} />

      <Typography
        variant="h4"
        fontWeight={700}
        textAlign="center"
        sx={{
          fontSize: { xs: "1.5rem", md: "1.85rem" },
          background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.contrastText} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 0.5,
        }}
      >
        Stats
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 0.5 }}
      >
        Your listening vs the community.
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        textAlign="center"
        sx={{ mb: 2 }}
      >
        Based on PDF opens
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          mb: 3,
        }}
      >
        <ToggleButtonGroup
          value={scope}
          exclusive
          onChange={(_, val: Scope | null) => {
            if (!val) return;
            if (val === "me" && !isLoggedIn) return;
            setScope(val);
          }}
          aria-label="Stats scope"
          sx={{ borderRadius: "12px", overflow: "hidden", height: 48 }}
        >
          <Tooltip title={isLoggedIn ? "" : "Sign in to see your stats"} arrow>
            <span>
              <ToggleButton value="me" disabled={!isLoggedIn} sx={{ fontWeight: 600 }}>
                For you
              </ToggleButton>
            </span>
          </Tooltip>
          <ToggleButton value="community" sx={{ fontWeight: 600 }}>
            Community
          </ToggleButton>
        </ToggleButtonGroup>
        {!isLoggedIn && (
          <Button label="Sign in to see your stats" variantType="secondary" onClick={goLogin} />
        )}
      </Box>

      {scope === "community" && !isLoggedIn && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
          Sign in to track your opens
        </Typography>
      )}

      {scope === "me" && isLoggedIn && lastViewed && (
        <Box sx={{ mb: 3, maxWidth: 480, mx: "auto" }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Last opened
          </Typography>
          <StatsTabCard
            hit={lastViewed}
            caption={
              formatOpenedAt(lastViewed.lastViewedAt)
                ? `Opened ${formatOpenedAt(lastViewed.lastViewedAt)}`
                : undefined
            }
            onOpen={openTab}
          />
        </Box>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatsBarList
            title="Most opened"
            hits={most}
            personal={scope === "me"}
            emptyLabel={emptyMost}
            onOpen={openTab}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatsBarList
            title="Least opened"
            hits={least}
            personal={scope === "me"}
            emptyLabel={emptyLeast}
            onOpen={openTab}
          />
        </Grid>
      </Grid>

      {scope === "me" && isLoggedIn && (
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Pick up again
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Never opened, or last opened more than 7 days ago
          </Typography>
          {pickup.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              You are all caught up
            </Typography>
          ) : (
            <Grid container spacing={1.5}>
              {pickup.map((hit) => (
                <Grid key={hit.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <StatsTabCard
                    hit={hit}
                    caption={
                      neverIds.has(hit.id)
                        ? "Never opened"
                        : formatOpenedAt(hit.lastViewedAt)
                          ? `Last opened ${formatOpenedAt(hit.lastViewedAt)}`
                          : "Opened more than 7 days ago"
                    }
                    onOpen={openTab}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};
