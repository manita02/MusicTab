import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Drawer,
  Fab,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
import { COPILOT_UI } from "../../api/copilot.constants";
import { PuaIcon } from "./PuaIcon";
import { copilotErrorFromUnknown } from "../../api/copilotErrors";
import { formatCooldownMmSs, remainingMsFromQuota } from "../../api/copilotQuota";
import type {
  CopilotHistoryMessage,
  CopilotTabHit,
} from "../../api/copilot.types";
import { useCopilotChat } from "../../api/hooks/useCopilotChat";
import { useCopilotQuota } from "../../api/hooks/useCopilotQuota";
import { Button } from "../Button/Button";

type CopilotDrawerProps = {
  isLoggedIn: boolean;
};

type ChatBubble = CopilotHistoryMessage & {
  id: number;
  hits?: CopilotTabHit[];
};

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement | null>(null);

  const quotaQuery = useCopilotQuota(isLoggedIn && open);
  const chat = useCopilotChat();

  const used = quotaQuery.data?.used ?? 0;
  const limit = quotaQuery.data?.limit ?? COPILOT_UI.DAILY_MESSAGE_LIMIT;
  const remaining = quotaQuery.data?.remaining ?? limit - used;
  const atDailyLimit = remaining <= 0;
  const cooldownRemainingMs = remainingMsFromQuota(quotaQuery.data, nowMs);
  const coolingDown = cooldownRemainingMs > 0;

  const trimmed = draft.trim();
  const overLimit = draft.length > COPILOT_UI.MAX_INPUT_CHARS;
  const sendDisabled =
    !isLoggedIn ||
    chat.isPending ||
    coolingDown ||
    atDailyLimit ||
    trimmed.length === 0 ||
    overLimit;

  useEffect(() => {
    if (!open) return;
    setNowMs(Date.now());
  }, [open, quotaQuery.dataUpdatedAt]);

  useEffect(() => {
    if (!coolingDown) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [coolingDown, quotaQuery.data?.cooldownUntil]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, chat.isPending, open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const goLogin = () => {
    setOpen(false);
    navigate("/login");
  };

  const handleSend = () => {
    if (sendDisabled || !isLoggedIn) return;

    const message = trimmed;
    const history: CopilotHistoryMessage[] = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    setErrorMessage(null);
    chat.mutate(
      { message, history },
      {
        onSuccess: (data) => {
          const userId = nextId.current++;
          const botId = nextId.current++;
          setMessages((prev) => [
            ...prev,
            { id: userId, role: "user", content: message },
            {
              id: botId,
              role: "assistant",
              content: data.reply,
              hits: data.hits,
            },
          ]);
          setDraft("");
          setNowMs(Date.now());
        },
        onError: (error) => {
          const mapped = copilotErrorFromUnknown(error);
          setErrorMessage(mapped.message);
          if (mapped.code === "COPILOT_COOLDOWN") {
            void quotaQuery.refetch();
            setNowMs(Date.now());
          }
          if (mapped.redirectToLogin) {
            navigate("/login");
          }
        },
      },
    );
  };

  const handleChip = (title: string) => {
    setOpen(false);
    navigate(`/tabs?search=${encodeURIComponent(title)}`);
  };

  return (
    <>
      <Tooltip
        title={isLoggedIn ? COPILOT_UI.BRAND_NAME : `Sign in to use ${COPILOT_UI.BRAND_NAME}`}
        arrow
      >
        <Fab
          aria-label={`Open ${COPILOT_UI.BRAND_NAME}`}
          data-testid="copilot-fab"
          onClick={handleOpen}
          size={isMobile ? "medium" : "large"}
          sx={{
            position: "fixed",
            right: { xs: 12, md: 20 },
            bottom: {
              xs: "calc(64px + env(safe-area-inset-bottom, 0px))",
              sm: 60,
              md: 56,
            },
            zIndex: 11,
            width: { xs: 48, md: 56 },
            height: { xs: 48, md: 56 },
            minHeight: { xs: 48, md: 56 },
            p: 0,
            overflow: "visible",
            bgcolor: "#D96B0A",
            border: "3px solid #FF9100",
            boxShadow: "0 0 10px 2px rgba(255,145,0,0.8)",
            transition: "box-shadow 0.3s ease, transform 0.2s ease, background-color 0.2s ease",
            "&:hover": {
              bgcolor: "#E07812",
              boxShadow: "0 0 14px 3px rgba(255,145,0,1)",
              transform: "scale(1.06)",
            },
          }}
        >
          <PuaIcon size={isMobile ? 30 : 36} />
        </Fab>
      </Tooltip>

      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={open}
        onClose={handleClose}
        data-testid="copilot-drawer"
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 380, md: 420 },
            height: { xs: "min(88dvh, 100%)", sm: "100dvh" },
            maxHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            overflow: "hidden",
            borderTopLeftRadius: { xs: 16, sm: 0 },
            borderTopRightRadius: { xs: 16, sm: 0 },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: { xs: 1, sm: 1.5 },
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <PuaIcon size={32} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h2" fontWeight={700}>
              {COPILOT_UI.BRAND_NAME}
            </Typography>
            {isLoggedIn && (
              <Typography variant="caption" color="text.secondary">
                messages today {used}/{limit}
              </Typography>
            )}
          </Box>
          <IconButton aria-label={`Close ${COPILOT_UI.BRAND_NAME}`} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          ref={listRef}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: 2,
            py: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {!isLoggedIn && (
            <Alert
              severity="info"
              action={
                <Button
                  label="Go to login"
                  variantType="primary"
                  size="small"
                  onClick={goLogin}
                />
              }
            >
              Sign in to chat with {COPILOT_UI.BRAND_NAME} and search the catalog.
            </Alert>
          )}

          {isLoggedIn && messages.length === 0 && !chat.isPending && (
            <Typography variant="body2" color="text.secondary">
              Ask me about an artist, genre, or instrument. For example: are there
              tabs by Milo J? or rock tabs.
            </Typography>
          )}

          {messages.map((msg) => (
            <Box key={msg.id}>
              <Box
                sx={{
                  maxWidth: "90%",
                  ml: msg.role === "user" ? "auto" : 0,
                  mr: msg.role === "assistant" ? "auto" : 0,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor:
                    msg.role === "user" ? "primary.main" : "rgba(0,0,0,0.06)",
                  color:
                    msg.role === "user" ? "primary.contrastText" : "text.primary",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <Typography variant="body2" component="p">
                  {msg.role === "assistant"
                    ? msg.content.replace(/https?:\/\/\S*pdf\S*/gi, "").trim()
                    : msg.content}
                </Typography>
              </Box>
              {msg.role === "assistant" && msg.hits && msg.hits.length > 0 && (
                <Box
                  sx={{
                    mt: 0.75,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.75,
                  }}
                >
                  {msg.hits.slice(0, COPILOT_UI.RESULT_LIMIT).map((hit) => (
                    <Chip
                      key={hit.id || hit.title}
                      label={hit.title}
                      size="small"
                      clickable
                      color="secondary"
                      onClick={() => handleChip(hit.title)}
                      aria-label={`Search tab ${hit.title}`}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ))}

          {chat.isPending && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="caption" color="text.secondary">
                Thinking…
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 }, pt: 1, borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
          {errorMessage && (
            <Alert
              severity="error"
              sx={{ mb: 1 }}
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}
          {isLoggedIn && atDailyLimit && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              You've reached the {COPILOT_UI.DAILY_MESSAGE_LIMIT}-message limit for today
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            maxRows={isMobile ? 3 : 4}
            value={draft}
            disabled={!isLoggedIn || chat.isPending || atDailyLimit}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            inputProps={{
              maxLength: COPILOT_UI.MAX_INPUT_CHARS,
              "aria-label": `Message for ${COPILOT_UI.BRAND_NAME}`,
            }}
            placeholder={
              isLoggedIn
                ? "Ask about an artist, genre, or instrument…"
                : "Sign in to chat"
            }
            helperText={`${draft.length}/${COPILOT_UI.MAX_INPUT_CHARS}`}
            FormHelperTextProps={{ sx: { textAlign: "right", m: 0, mt: 0.5 } }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
            {isLoggedIn && coolingDown ? (
              <Box
                data-testid="copilot-cooldown"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  color: "error.main",
                }}
              >
                <HourglassEmptyIcon fontSize="small" aria-hidden />
                <Typography variant="body2" fontWeight={700} component="span">
                  Wait {formatCooldownMmSs(cooldownRemainingMs)}
                </Typography>
              </Box>
            ) : (
              <span />
            )}
            <Button
              label="Send"
              variantType="primary"
              disabled={sendDisabled}
              onClick={handleSend}
              startIcon={<SendIcon />}
              aria-label={`Send message to ${COPILOT_UI.BRAND_NAME}`}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
