
import type { ReactNode } from "react";

import {
  Box,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";

import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface NavigationItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardRoundedIcon />,
  },
  {
    label: "Feature Flags",
    path: "/features",
    icon: <FlagRoundedIcon />,
  },
  {
    label: "Environments",
    path: "/environments",
    icon: <CloudRoundedIcon />,
  },
  {
    label: "Rollouts",
    path: "/rollouts",
    icon: <RocketLaunchRoundedIcon />,
  },
  {
    label: "Assignments",
    path: "/assignments",
    icon: <PeopleRoundedIcon />,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: <AnalyticsRoundedIcon />,
  },
  {
    label: "Audit Logs",
    path: "/audit",
    icon: <HistoryRoundedIcon />,
  },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/features": "Feature Flags",
  "/environments": "Environments",
  "/rollouts": "Rollouts",
  "/assignments": "User Assignments",
  "/analytics": "Analytics",
  "/audit": "Audit Logs",
};

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentPage =
    pageTitles[location.pathname] || "Feature Management";

  const initials =
    user?.full_name
      ?.split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f4f7fb",
        color: "#0f172a",
      }}
    >
      {/* =========================================================
          DESKTOP SIDEBAR
      ========================================================= */}

      <Box
        component="aside"
        sx={{
          display: {
            xs: "none",
            md: "flex",
          },
          width: 268,
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1200,
          flexDirection: "column",
          background:
            "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
          color: "#ffffff",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* BRAND */}

        <Box
          sx={{
            height: 78,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            borderBottom:
              "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
              color: "#0f172a",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.25)",
              mr: 1.5,
            }}
          >
            <BoltRoundedIcon
              sx={{
                fontSize: 22,
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                color: "#ffffff",
              }}
            >
              Feature Control
            </Typography>

            <Typography
              sx={{
                fontSize: 10.5,
                color: "#94a3b8",
                mt: 0.5,
                letterSpacing: "0.01em",
              }}
            >
              Enterprise Management
            </Typography>
          </Box>
        </Box>

        {/* WORKSPACE LABEL */}

        <Box
          sx={{
            px: 2.5,
            pt: 3,
            pb: 1.2,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Workspace
          </Typography>
        </Box>

        {/* NAVIGATION */}

        <Box
          sx={{
            flex: 1,
            px: 1.5,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#334155",
              borderRadius: 4,
            },
          }}
        >
          <Stack spacing={0.4}>
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {({ isActive }) => (
                  <Box
                    sx={{
                      position: "relative",
                      height: 46,
                      px: 1.5,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      color: isActive
                        ? "#ffffff"
                        : "#94a3b8",
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.09)"
                        : "transparent",
                      transition:
                        "all 0.18s ease",
                      cursor: "pointer",

                      "&:hover": {
                        backgroundColor:
                          "rgba(255,255,255,0.07)",
                        color: "#ffffff",
                      },
                    }}
                  >
                    {/* ACTIVE INDICATOR */}

                    {isActive && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 10,
                          bottom: 10,
                          width: 3,
                          borderRadius:
                            "0 4px 4px 0",
                          backgroundColor:
                            "#ffffff",
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "9px",
                        mr: 1.1,
                        backgroundColor: isActive
                          ? "rgba(255,255,255,0.08)"
                          : "transparent",

                        "& svg": {
                          fontSize: 20,
                        },
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Typography
                      sx={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: isActive
                          ? 650
                          : 500,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.label}
                    </Typography>

                    {isActive && (
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          backgroundColor:
                            "#ffffff",
                        }}
                      />
                    )}
                  </Box>
                )}
              </NavLink>
            ))}
          </Stack>
        </Box>

        {/* SIDEBAR BOTTOM */}

        <Box
          sx={{
            px: 1.5,
            pb: 1.5,
          }}
        >
          <Divider
            sx={{
              borderColor:
                "rgba(255,255,255,0.07)",
              mb: 1.5,
            }}
          />

          {/* SYSTEM STATUS */}

          <Box
            sx={{
              px: 1.5,
              py: 1.2,
              mb: 1,
              borderRadius: "10px",
              backgroundColor:
                "rgba(255,255,255,0.035)",
              border:
                "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  boxShadow:
                    "0 0 0 4px rgba(34,197,94,0.10)",
                }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#e2e8f0",
                  }}
                >
                  All systems operational
                </Typography>

                <Typography
                  sx={{
                    fontSize: 9.5,
                    color: "#64748b",
                    mt: 0.2,
                  }}
                >
                  API & services online
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* USER */}

          <Box
            sx={{
              p: 1.25,
              borderRadius: "11px",
              backgroundColor:
                "rgba(255,255,255,0.06)",
              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.1}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #475569, #334155)",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {initials}
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 650,
                    color: "#f8fafc",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.full_name || "User"}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 9.5,
                    color: "#64748b",
                    mt: 0.2,
                  }}
                >
                  {user?.role?.name || "User"}
                </Typography>
              </Box>

              <Tooltip title="Logout">
                <IconButton
                  onClick={logout}
                  size="small"
                  sx={{
                    color: "#64748b",
                    borderRadius: "8px",

                    "&:hover": {
                      color: "#ffffff",
                      backgroundColor:
                        "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  <LogoutRoundedIcon
                    sx={{ fontSize: 18 }}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* =========================================================
          MAIN AREA
      ========================================================= */}

      <Box
        sx={{
          minHeight: "100vh",
          ml: {
            xs: 0,
            md: "268px",
          },
        }}
      >
        {/* TOP HEADER */}

        <Box
          component="header"
          sx={{
            height: 76,
            px: {
              xs: 2,
              sm: 3,
              lg: 4,
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
            borderBottom:
              "1px solid #e5eaf0",
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        >
          {/* LEFT */}

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
          >
            {/* MOBILE MENU */}

            <IconButton
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
                color: "#334155",
              }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 750,
                    color: "#0f172a",
                    letterSpacing:
                      "-0.025em",
                  }}
                >
                  {currentPage}
                </Typography>

                <Box
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                    width: 1,
                    height: 18,
                    backgroundColor:
                      "#e2e8f0",
                  }}
                />

                <Typography
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                    fontSize: 11,
                    color: "#94a3b8",
                  }}
                >
                  Feature Management
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: 10.5,
                  color: "#94a3b8",
                  mt: 0.35,
                }}
              >
                Centralized control for application features
              </Typography>
            </Box>
          </Stack>

          {/* RIGHT */}

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            {/* ENVIRONMENT */}

            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "flex",
                },
                alignItems: "center",
                gap: 0.8,
                px: 1.25,
                py: 0.7,
                borderRadius: "9px",
                border:
                  "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <CircleRoundedIcon
                sx={{
                  fontSize: 7,
                  color: "#22c55e",
                }}
              />

              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Production
              </Typography>

              <KeyboardArrowDownRoundedIcon
                sx={{
                  fontSize: 15,
                  color: "#94a3b8",
                }}
              />
            </Box>

            {/* NOTIFICATIONS */}

            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  width: 38,
                  height: 38,
                  color: "#64748b",
                  border:
                    "1px solid transparent",

                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    borderColor:
                      "#e2e8f0",
                  },
                }}
              >
                <NotificationsNoneRoundedIcon
                  sx={{ fontSize: 20 }}
                />
              </IconButton>
            </Tooltip>

            {/* SETTINGS */}

            <Tooltip title="Settings">
              <IconButton
                sx={{
                  display: {
                    xs: "none",
                    sm: "flex",
                  },
                  width: 38,
                  height: 38,
                  color: "#64748b",

                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                <SettingsOutlinedIcon
                  sx={{ fontSize: 19 }}
                />
              </IconButton>
            </Tooltip>

            {/* USER */}

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                height: 28,
                mx: 0.5,
                alignSelf: "center",
                borderColor: "#e2e8f0",
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                pl: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                  color: "#334155",
                  fontSize: 11,
                  fontWeight: 750,
                }}
              >
                {initials}
              </Box>

              <Box
                sx={{
                  display: {
                    xs: "none",
                    lg: "block",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 650,
                    color: "#1e293b",
                    lineHeight: 1.2,
                  }}
                >
                  {user?.full_name || "User"}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 9.5,
                    color: "#94a3b8",
                    mt: 0.3,
                  }}
                >
                  {user?.role?.name || "User"}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* PAGE CONTENT */}

        <Box
          component="main"
          sx={{
            minHeight:
              "calc(100vh - 76px)",
            width: "100%",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
