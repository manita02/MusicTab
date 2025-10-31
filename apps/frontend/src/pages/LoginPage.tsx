import * as React from "react";
import { useState, useEffect } from "react";
import { Box, Typography, Tooltip, useTheme } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { InputField } from "../components/InputField/InputField";
import { Button } from "../components/Button/Button";
import { useLogin } from "../api/hooks/useLogin";
import { useNavigate } from "react-router-dom";

export const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const isLoading = loginMutation.status === "pending";
  const isError = loginMutation.status === "error";
  const isSuccess = loginMutation.status === "success";

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

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
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <LibraryMusicIcon sx={{ color: theme.palette.primary.main, fontSize: 36, mr: 1 }} />
          </Box>
        </Tooltip>

        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Login to MusicTab
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
          Welcome user, please login to continue
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <InputField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="example@gmail.com"
          />
          <InputField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="********"
          />

          <Button
            label={isLoading ? "Logging in..." : "Login"}
            onClick={handleLogin}
            disabled={isLoading}
            variantType="primary"
            sx={{ width: "100%", mt: 1 }}
          />

          {isError && (
            <Typography color="error" mt={1}>
              {(loginMutation.error as any)?.response?.data?.message || "Invalid credentials"}
            </Typography>
          )}

          {isSuccess && (
            <Typography color="success.main" mt={1}>
              Login successful! Redirecting...
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};