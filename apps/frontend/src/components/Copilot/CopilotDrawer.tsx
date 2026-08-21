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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { useNavigate } from "react-router-dom";
import { COPILOT_UI } from "../../api/copilot.constants";
import { copilotErrorFromUnknown } from "../../api/copilotErrors";
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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coolingDown, setCoolingDown] = useState(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement | null>(null);

  const quotaQuery = useCopilotQuota(isLoggedIn && open);
  const chat = useCopilotChat();

  const used = quotaQuery.data?.used ?? 0;
  const limit = quotaQuery.data?.limit ?? COPILOT_UI.DAILY_MESSAGE_LIMIT;
  const remaining = quotaQuery.data?.remaining ?? limit - used;
  const atDailyLimit = remaining <= 0;

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
    return () => {
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    };
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, chat.isPending, open]);

  const startCooldown = () => {
    setCoolingDown(true);
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => {
      setCoolingDown(false);
    }, COPILOT_UI.SEND_COOLDOWN_MS);
  };

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
    startCooldown();
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
        },
        onError: (error) => {
          const mapped = copilotErrorFromUnknown(error);
          setErrorMessage(mapped.message);
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
        title={isLoggedIn ? "Copilot" : "Sign in to use Copilot"}
        arrow
      >
        <Fab
          color="secondary"
          aria-label="Open Copilot"
          data-testid="copilot-fab"
          onClick={handleOpen}
          sx={{
            position: "fixed",
            right: { xs: 16, md: 24 },
            bottom: { xs: 148, md: 112 },
            zIndex: 11,
          }}
        >
          <SmartToyIcon />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        data-testid="copilot-drawer"
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <SmartToyIcon color="secondary" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h2" fontWeight={700}>
              Copilot
            </Typography>
            {isLoggedIn && (
              <Typography variant="caption" color="text.secondary">
                messages today {used}/{limit}
              </Typography>
            )}
          </Box>
          <IconButton aria-label="Close Copilot" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          ref={listRef}
          sx={{
            flex: 1,
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
              Sign in to chat with Copilot and search the catalog.
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

        <Box sx={{ px: 2, pb: 2, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
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
              You've reached the 5-message limit for today
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            maxRows={4}
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
              "aria-label": "Message for Copilot",
            }}
            placeholder={
              isLoggedIn
                ? "Ask about an artist, genre, or instrument…"
                : "Sign in to chat"
            }
            helperText={`${draft.length}/${COPILOT_UI.MAX_INPUT_CHARS}`}
            FormHelperTextProps={{ sx: { textAlign: "right", m: 0, mt: 0.5 } }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              label="Send"
              variantType="primary"
              disabled={sendDisabled}
              onClick={handleSend}
              startIcon={<SendIcon />}
              aria-label="Send message to Copilot"
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
