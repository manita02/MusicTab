import * as React from "react";
import { useState } from "react";
import { Box, Typography, Tooltip, useTheme, TextField } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { InputField } from "../components/InputField/InputField";
import { Button } from "../components/Button/Button";

export const SignInPage: React.FC = () => {
  const theme = useTheme();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 500));
    console.log("Sign In", { name, username, email, password, profileUrl });
    setLoading(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: { xs: 4, sm: 6 },
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", sm: 360 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
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
          Enter your credentials to access your account
        </Typography>

        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <InputField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <InputField
            label="Last Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your last name"
          />
          <InputField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
          <TextField
            label="Date of birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              borderRadius: "12px",
            }}
          />
          <InputField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="********"
          />
          <InputField
            label="Profile Image URL"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />

          <Button
            label={loading ? "Signing in..." : "Sign In"}
            onClick={handleSignIn}
            disabled={loading}
            variantType="primary"
            sx={{ width: "100%", mt: 1 }}
          />
        </Box>
      </Box>
    </Box>
  );
};