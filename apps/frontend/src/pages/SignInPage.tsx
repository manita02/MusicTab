import * as React from "react";
import { useRef, useState } from "react";
import { Box, Typography, Tooltip, useTheme, TextField, Grid, Avatar } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { InputField } from "../components/InputField/InputField";
import { Button } from "../components/Button/Button";
import { MessageModal } from "../components/MessageModal/MessageModal";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { useRegister } from "../api/hooks/useRegister";

const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

const DEFAULT_PROFILE_IMG =
  "https://imgs.search.brave.com/cKpndh_PLl3bVHQqLUPiuQ3ERWbja_MIKeFqA52qCqs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMTUvVXNl/ci1CYWNrZ3JvdW5k/LVBORy5wbmc";

const blockTypedEmail = (
  onBlocked: () => void,
) => {
  return (e: React.ClipboardEvent<HTMLInputElement> | React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onBlocked();
  };
};

export const SignInPage: React.FC = () => {
  const theme = useTheme();
  const { mutate: registerUser, isPending } = useRegister();
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [pasteHintOn, setPasteHintOn] = useState<"email" | "confirm" | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const emailsMatch = email.trim().toLowerCase() === emailConfirm.trim().toLowerCase();
  const confirmError = confirmTouched && !!emailConfirm && !emailsMatch;

  const showModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  const resetTurnstile = () => {
    setTurnstileToken("");
    turnstileRef.current?.reset();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalType === "success") {
      setUsername("");
      setEmail("");
      setEmailConfirm("");
      setPassword("");
      setProfileUrl("");
      setBirthDate("");
      setConfirmTouched(false);
      setPasteHintOn(null);
      resetTurnstile();
    }
  };

  const handleSignIn = async () => {
    if (!username || !email || !emailConfirm || !password || !birthDate) {
      showModal("warning", "Incomplete form", "Please complete all required fields.");
      return;
    }
    if (!emailsMatch) {
      setConfirmTouched(true);
      showModal("warning", "Email addresses do not match", "Please type the same email in both fields.");
      return;
    }
    if (!turnstileToken) {
      showModal("warning", "Verification required", "Please complete the verification challenge");
      return;
    }
    registerUser(
      {
        username,
        email,
        emailConfirm,
        password,
        birthDate,
        turnstileToken,
        urlImg: profileUrl.trim().startsWith("http") ? profileUrl.trim() : DEFAULT_PROFILE_IMG,
      },
      {
        onSuccess: () => {
          showModal("success", "Registration Successful", "Your account has been created successfully!");
        },
        onError: (error) => {
          resetTurnstile();
          const backendMsg =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "An unexpected error occurred.";
          showModal("error", "Registration Failed", backendMsg);
        },
      }
    );
  };

  const emailPasteHint = pasteHintOn === "email" ? "Please type your email" : "";
  const confirmHelper = confirmError
    ? "Email addresses do not match"
    : pasteHintOn === "confirm"
      ? "Please type your email"
      : "";
  const previewImg = profileUrl.trim().startsWith("http") ? profileUrl.trim() : DEFAULT_PROFILE_IMG;

  return (
    <>
      <IconLoader active={isPending} />
      <MessageModal
        open={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        onConfirm={handleModalClose}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: { xs: 2, sm: 3, md: 4 },
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: 400, md: 680 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, sm: 2 },
            textAlign: "center",
            px: 2,
          }}
        >
          <Tooltip title="MusicTab" arrow>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }}>
              <LibraryMusicIcon sx={{ color: theme.palette.primary.main, fontSize: 36, mr: 1 }} />
            </Box>
          </Tooltip>

          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Sign In to MusicTab
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Enter your details to create your account
          </Typography>

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar
                src={previewImg}
                alt="Profile preview"
                sx={{
                  width: { xs: 88, md: 112 },
                  height: { xs: 88, md: 112 },
                  border: "3px solid #2979FF",
                  boxShadow: "0 0 10px 2px rgba(41,121,255,0.8)",
                  transition: "box-shadow 0.3s ease, transform 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 0 14px 3px rgba(41,121,255,1)",
                    transform: "scale(1.08)",
                  },
                }}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <InputField
                  label="Username *"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Date of birth *"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ borderRadius: "12px" }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <InputField
                  label="Email *"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setPasteHintOn((prev) => (prev === "email" ? null : prev));
                  }}
                  type="email"
                  placeholder="you@gmail.com"
                  onPaste={blockTypedEmail(() => setPasteHintOn("email"))}
                  onDrop={blockTypedEmail(() => setPasteHintOn("email"))}
                  error={!!emailPasteHint}
                  helperText={emailPasteHint}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <InputField
                  label="Confirm email *"
                  value={emailConfirm}
                  onChange={(e) => {
                    setEmailConfirm(e.target.value);
                    setPasteHintOn((prev) => (prev === "confirm" ? null : prev));
                  }}
                  type="email"
                  placeholder="Type your email again"
                  onPaste={blockTypedEmail(() => setPasteHintOn("confirm"))}
                  onDrop={blockTypedEmail(() => setPasteHintOn("confirm"))}
                  error={confirmError || pasteHintOn === "confirm"}
                  helperText={confirmHelper}
                  onBlur={() => setConfirmTouched(true)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <InputField
                  label="Password *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="********"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <InputField
                  label="Profile Image URL"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                height: 65,
                overflow: "hidden",
                "& iframe": { display: "block" },
              }}
            >
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={resetTurnstile}
                onError={resetTurnstile}
              />
            </Box>

            <Button
              label={isPending ? "Signing in..." : "Sign In"}
              onClick={handleSignIn}
              disabled={isPending}
              variantType="primary"
              sx={{ width: { xs: "100%", md: "auto" }, alignSelf: { md: "center" }, minWidth: { md: 220 }, mt: 1 }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};
