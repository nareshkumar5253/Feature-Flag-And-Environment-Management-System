import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const locationState = location.state as LocationState | null;

  const redirectPath =
    locationState?.from?.pathname || "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(email.trim(), password);

      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "Login failed. Please check your email and password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e293b 100%)",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },
            borderRadius: 4,
            backgroundColor: "#ffffff",
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#111827",
                  color: "#ffffff",
                }}
              >
                <LoginRoundedIcon fontSize="large" />
              </Box>

              <Typography
                variant="h4"
                fontWeight={700}
                color="#111827"
              >
                Welcome Back
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Sign in to Feature Flag Management System
              </Typography>
            </Box>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={2.5}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  fullWidth
                  required
                  autoComplete="email"
                  autoFocus
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  fullWidth
                  required
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress
                        size={20}
                        color="inherit"
                      />
                    ) : (
                      <LoginRoundedIcon />
                    )
                  }
                  sx={{
                    py: 1.5,
                    mt: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    backgroundColor: "#111827",
                    "&:hover": {
                      backgroundColor: "#1f2937",
                    },
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </Stack>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Secure access with JWT authentication
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}