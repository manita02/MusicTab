import * as React from "react";
import { useState } from "react";
import { Box, Typography, Tooltip, useTheme } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { InputField } from "../components/InputField/InputField";
import { Button } from "../components/Button/Button";

export const LoginPage: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 500));
    console.log("Login", { email, password });
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

        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
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
            label={loading ? "Logging in..." : "Login"}
            onClick={handleLogin}
            disabled={loading}
            variantType="primary"
            sx={{
              width: "100%",
              mt: 1,
            }}
          />
        </Box>

        {/* Forgot Password 
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mt: 1 }}
        >
          ¿Olvidaste tu contraseña?
        </Typography>
        */}
      </Box>
    </Box>
  );
};