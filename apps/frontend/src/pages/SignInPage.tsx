import * as React from "react";
import { useState } from "react";
import { Box, Typography, Tooltip, useTheme, TextField, Grid, Avatar } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { InputField } from "../components/InputField/InputField";
import { Button } from "../components/Button/Button";
import { MessageModal } from "../components/MessageModal/MessageModal";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { useRegister } from "../api/hooks/useRegister";

export const SignInPage: React.FC = () => {
  const theme = useTheme();
  const { mutate: registerUser, isPending } = useRegister();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

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

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalType === "success") {
      setUsername("");
      setEmail("");
      setPassword("");
      setProfileUrl("");
      setBirthDate("");
    }
  };

  const handleSignIn = async () => {
    if (!username || !email || !password || !birthDate) {
      showModal("warning", "Incomplete form", "Please complete all required fields.");
      return;
    }
    registerUser(
      {
        username,
        email,
        password,
        birthDate,
        urlImg:
          profileUrl ||
          "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg",
      },
      {
        onSuccess: () => {
          showModal("success", "Registration Successful", "Your account has been created successfully!");
        },
        onError: (error) => {
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
            {profileUrl ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Avatar src={profileUrl} alt="Profile preview" sx={{ width: 72, height: 72 }} />
              </Box>
            ) : null}
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
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="example@gmail.com"
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
              <Grid size={{ xs: 12 }}>
                <InputField
                  label="Profile Image URL"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </Grid>
            </Grid>

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