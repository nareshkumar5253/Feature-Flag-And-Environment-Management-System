
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AssessmentRounded,
  CheckCircleRounded,
  CloudRounded,
  FlagRounded,
  HistoryRounded,
  LayersRounded,
  MoreHorizRounded,
  RefreshRounded,
  RocketLaunchRounded,
  SettingsRounded,
  TrendingUpRounded,
  WarningAmberRounded,
} from "@mui/icons-material";

import api from "../../services/api";

import type {
  DashboardRecentActivity,
  DashboardSummary,
} from "../../types";

interface FeatureFlagSummary {
  id: number;
  key: string;
  name: string;
  enabled: boolean;
}

interface EnvironmentSummary {
  id: number;
  name: string;
  is_active: boolean;
}

interface RolloutSummary {
  id: number;
  feature_flag_id: number;
  environment_id: number;
  percentage: number;
  enabled: boolean;
  priority?: number;
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  iconBackground: string;
  iconColor: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        borderRadius: "14px",
        border: "1px solid #e8edf3",
        background: "#ffffff",
        height: "100%",
        transition: "all .2s ease",
        "&:hover": {
          borderColor: "#d7dee8",
          boxShadow: "0 8px 24px rgba(15,23,42,.06)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "#111827",
              fontSize: "28px",
              lineHeight: 1.2,
              fontWeight: 800,
              mt: 0.8,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              color: "#94a3b8",
              fontSize: "11px",
              mt: 0.6,
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: iconBackground,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      sx={{ mb: 2 }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: "15px",
            fontWeight: 800,
            color: "#111827",
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              mt: 0.4,
              fontSize: "11px",
              color: "#94a3b8",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {action}
    </Stack>
  );
}

export default function Dashboard() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [activities, setActivities] =
    useState<DashboardRecentActivity[]>([]);

  const [features, setFeatures] =
    useState<FeatureFlagSummary[]>([]);

  const [environments, setEnvironments] =
    useState<EnvironmentSummary[]>([]);

  const [rollouts, setRollouts] =
    useState<RolloutSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        activityResponse,
        featureResponse,
        environmentResponse,
        rolloutResponse,
      ] = await Promise.all([
        api.get<DashboardSummary>("/dashboard/summary"),
        api.get<DashboardRecentActivity[]>(
          "/dashboard/recent-activity?limit=6"
        ),
        api.get<FeatureFlagSummary[]>("/feature-flags"),
        api.get<EnvironmentSummary[]>("/environments"),
        api.get<RolloutSummary[]>("/rollouts"),
      ]);

      setSummary(summaryResponse.data);
      setActivities(activityResponse.data);
      setFeatures(featureResponse.data);
      setEnvironments(environmentResponse.data);
      setRollouts(rolloutResponse.data);
    } catch (err: any) {
      console.error("Dashboard loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const featurePercentage = useMemo(() => {
    if (!summary || summary.total_features === 0) {
      return 0;
    }

    return Math.round(
      (summary.enabled_features /
        summary.total_features) *
        100
    );
  }, [summary]);

  const environmentPercentage = useMemo(() => {
    if (!summary || summary.total_environments === 0) {
      return 0;
    }

    return Math.round(
      (summary.active_environments /
        summary.total_environments) *
        100
    );
  }, [summary]);

  const evaluationPercentage = useMemo(() => {
    if (!summary || summary.total_evaluations === 0) {
      return 0;
    }

    return Math.round(
      (summary.enabled_evaluations /
        summary.total_evaluations) *
        100
    );
  }, [summary]);

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activityColor = (action: string) => {
    const value = action.toUpperCase();

    if (value.includes("ENABLE")) {
      return "#16a34a";
    }

    if (value.includes("DISABLE")) {
      return "#d97706";
    }

    if (value.includes("ROLLBACK")) {
      return "#9333ea";
    }

    if (value.includes("DELETE")) {
      return "#dc2626";
    }

    return "#2563eb";
  };

  const activityIcon = (action: string) => {
    const value = action.toUpperCase();

    if (value.includes("ENABLE")) {
      return <CheckCircleRounded fontSize="small" />;
    }

    if (value.includes("DISABLE")) {
      return <WarningAmberRounded fontSize="small" />;
    }

    if (value.includes("ROLLBACK")) {
      return <HistoryRounded fontSize="small" />;
    }

    return <SettingsRounded fontSize="small" />;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9fc",
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress size={30} />

          <Typography
            sx={{
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Loading dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!summary || error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadDashboard}
            >
              Retry
            </Button>
          }
        >
          {error || "Dashboard data unavailable."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100%",
        background: "#f7f9fc",
        p: {
          xs: 1.5,
          sm: 2,
          md: 3,
        },
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          borderRadius: "16px",
          overflow: "hidden",
          background:
            "linear-gradient(110deg, #111827 0%, #1e293b 55%, #26354d 100%)",
          color: "#ffffff",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 2,
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1.3}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "11px",
                  background: "rgba(255,255,255,.10)",
                  border:
                    "1px solid rgba(255,255,255,.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RocketLaunchRounded />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: "21px",
                      md: "24px",
                    },
                    fontWeight: 800,
                    letterSpacing: "-.3px",
                  }}
                >
                  Feature Control Center
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,
                    fontSize: "12px",
                    color: "#cbd5e1",
                  }}
                >
                  Manage releases, environments and feature
                  availability
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Chip
              icon={
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22c55e",
                    ml: 1,
                  }}
                />
              }
              label="System Operational"
              size="small"
              sx={{
                height: 30,
                color: "#dcfce7",
                background: "rgba(34,197,94,.10)",
                border:
                  "1px solid rgba(34,197,94,.25)",
                fontSize: "11px",
                fontWeight: 700,
              }}
            />

            <Tooltip title="Refresh dashboard">
              <IconButton
                onClick={loadDashboard}
                sx={{
                  width: 34,
                  height: 34,
                  color: "#ffffff",
                  background: "rgba(255,255,255,.08)",
                  "&:hover": {
                    background: "rgba(255,255,255,.15)",
                  },
                }}
              >
                <RefreshRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 1.8,
          mb: 2,
        }}
      >
        <StatCard
          title="Feature Flags"
          value={summary.total_features}
          subtitle={`${summary.enabled_features} enabled`}
          icon={<FlagRounded />}
          iconBackground="#eef2ff"
          iconColor="#4f46e5"
        />

        <StatCard
          title="Environments"
          value={summary.total_environments}
          subtitle={`${summary.active_environments} active`}
          icon={<LayersRounded />}
          iconBackground="#ecfeff"
          iconColor="#0891b2"
        />

        <StatCard
          title="Rollouts"
          value={summary.total_rollouts}
          subtitle={`${summary.active_rollouts} active rules`}
          icon={<RocketLaunchRounded />}
          iconBackground="#fff7ed"
          iconColor="#ea580c"
        />

        <StatCard
          title="Evaluations"
          value={summary.total_evaluations}
          subtitle={`${summary.unique_users} unique users`}
          icon={<AssessmentRounded />}
          iconBackground="#f0fdf4"
          iconColor="#16a34a"
        />
      </Box>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.35fr .65fr",
          },
          gap: 2,
          mb: 2,
        }}
      >
        {/* RELEASE OVERVIEW */}

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "14px",
            border: "1px solid #e8edf3",
            background: "#ffffff",
          }}
        >
          <SectionTitle
            title="Release Overview"
            subtitle="Current feature and rollout configuration"
            action={
              <IconButton size="small">
                <MoreHorizRounded />
              </IconButton>
            }
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
              },
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                p: 1.8,
                borderRadius: "10px",
                background: "#f8fafc",
              }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                }}
              >
                Enabled
              </Typography>

              <Typography
                sx={{
                  mt: .5,
                  fontSize: "23px",
                  fontWeight: 800,
                  color: "#16a34a",
                }}
              >
                {summary.enabled_features}
              </Typography>

              <Typography
                sx={{
                  fontSize: "10px",
                  color: "#94a3b8",
                }}
              >
                {featurePercentage}% of features
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.8,
                borderRadius: "10px",
                background: "#f8fafc",
              }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                }}
              >
                Active Rollouts
              </Typography>

              <Typography
                sx={{
                  mt: .5,
                  fontSize: "23px",
                  fontWeight: 800,
                  color: "#ea580c",
                }}
              >
                {summary.active_rollouts}
              </Typography>

              <Typography
                sx={{
                  fontSize: "10px",
                  color: "#94a3b8",
                }}
              >
                of {summary.total_rollouts} total
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.8,
                borderRadius: "10px",
                background: "#f8fafc",
              }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: 600,
                }}
              >
                Active Environments
              </Typography>

              <Typography
                sx={{
                  mt: .5,
                  fontSize: "23px",
                  fontWeight: 800,
                  color: "#0891b2",
                }}
              >
                {summary.active_environments}
              </Typography>

              <Typography
                sx={{
                  fontSize: "10px",
                  color: "#94a3b8",
                }}
              >
                {environmentPercentage}% operational
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2.2 }} />

          <Typography
            sx={{
              mb: 1.2,
              fontSize: "12px",
              fontWeight: 700,
              color: "#475569",
            }}
          >
            Rollout Distribution
          </Typography>

          <Stack spacing={1.4}>
            {rollouts.slice(0, 3).map((rollout) => (
              <Box key={rollout.id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: .6 }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: rollout.enabled
                          ? "#22c55e"
                          : "#cbd5e1",
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "#475569",
                        fontWeight: 700,
                      }}
                    >
                      Feature #{rollout.feature_flag_id}
                    </Typography>
                  </Stack>

                  <Typography
                    sx={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#334155",
                    }}
                  >
                    {rollout.percentage}%
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    Math.max(rollout.percentage, 0),
                    100
                  )}
                  sx={{
                    height: 6,
                    borderRadius: 10,
                    background: "#eef2f7",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 10,
                      background: rollout.enabled
                        ? "#2563eb"
                        : "#cbd5e1",
                    },
                  }}
                />
              </Box>
            ))}

            {rollouts.length === 0 && (
              <Typography
                sx={{
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                No rollout rules configured.
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* EVALUATION SUMMARY */}

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "14px",
            border: "1px solid #e8edf3",
            background: "#ffffff",
          }}
        >
          <SectionTitle
            title="Evaluation Health"
            subtitle="Feature evaluation results"
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 1,
            }}
          >
            <Box
              sx={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: `conic-gradient(
                  #2563eb ${evaluationPercentage}%,
                  #e8edf3 ${evaluationPercentage}% 100%
                )`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 116,
                  height: 116,
                  borderRadius: "50%",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {evaluationPercentage}%
                </Typography>

                <Typography
                  sx={{
                    color: "#94a3b8",
                    fontSize: "10px",
                  }}
                >
                  enabled
                </Typography>
              </Box>
            </Box>
          </Box>

          <Stack
            spacing={1.2}
            sx={{ mt: 1.5 }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={.8}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#2563eb",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  Enabled
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                {summary.enabled_evaluations}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={.8}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#cbd5e1",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  Disabled
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                {summary.disabled_evaluations}
              </Typography>
            </Stack>

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                Total evaluations
              </Typography>

              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                {summary.total_evaluations}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* =====================================================
          LOWER CONTENT
      ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 2,
        }}
      >
        {/* ENVIRONMENTS */}

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "14px",
            border: "1px solid #e8edf3",
            background: "#ffffff",
          }}
        >
          <SectionTitle
            title="Environment Status"
            subtitle="Current deployment environments"
          />

          <Stack spacing={1}>
            {environments.map((environment) => (
              <Box
                key={environment.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.3,
                  borderRadius: "10px",
                  background: "#f8fafc",
                  transition: "background .15s ease",
                  "&:hover": {
                    background: "#f1f5f9",
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.2}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "9px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: environment.is_active
                        ? "#ecfdf5"
                        : "#f1f5f9",
                      color: environment.is_active
                        ? "#16a34a"
                        : "#94a3b8",
                    }}
                  >
                    <CloudRounded
                      sx={{ fontSize: 18 }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      {environment.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "10px",
                        color: "#94a3b8",
                      }}
                    >
                      Environment #{environment.id}
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label={
                    environment.is_active
                      ? "Active"
                      : "Inactive"
                  }
                  size="small"
                  sx={{
                    height: 23,
                    fontSize: "10px",
                    fontWeight: 700,
                    background: environment.is_active
                      ? "#dcfce7"
                      : "#f1f5f9",
                    color: environment.is_active
                      ? "#15803d"
                      : "#64748b",
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* RECENT ACTIVITY */}

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "14px",
            border: "1px solid #e8edf3",
            background: "#ffffff",
          }}
        >
          <SectionTitle
            title="Recent Activity"
            subtitle="Latest configuration changes"
          />

          {activities.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
              }}
            >
              <HistoryRounded
                sx={{
                  color: "#cbd5e1",
                  fontSize: 36,
                }}
              />

              <Typography
                sx={{
                  mt: 1,
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                No recent activity.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0}>
              {activities.map((activity, index) => {
                const color = activityColor(
                  activity.action
                );

                return (
                  <Box key={activity.id}>
                    <Stack
                      direction="row"
                      spacing={1.2}
                      alignItems="center"
                      sx={{
                        py: 1.2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: "9px",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: `${color}12`,
                          color,
                        }}
                      >
                        {activityIcon(
                          activity.action
                        )}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={.7}
                          alignItems="center"
                        >
                          <Typography
                            sx={{
                              fontSize: "11px",
                              fontWeight: 800,
                              color: "#334155",
                            }}
                          >
                            {activity.action}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "10px",
                              color: "#94a3b8",
                            }}
                          >
                            {activity.entity_type}
                            {activity.entity_id
                              ? ` #${activity.entity_id}`
                              : ""}
                          </Typography>
                        </Stack>

                        <Typography
                          sx={{
                            mt: .25,
                            fontSize: "10px",
                            color: "#94a3b8",
                          }}
                        >
                          User #{activity.user_id ?? "System"}{" "}
                          • {formatDate(activity.created_at)}
                        </Typography>
                      </Box>
                    </Stack>

                    {index <
                      activities.length - 1 && (
                      <Divider />
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Paper>
      </Box>

      {/* =====================================================
          FEATURE LIST
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2.5,
          borderRadius: "14px",
          border: "1px solid #e8edf3",
          background: "#ffffff",
        }}
      >
        <SectionTitle
          title="Feature Flags"
          subtitle="Current feature configuration"
        />

        {features.length === 0 ? (
          <Typography
            sx={{
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            No feature flags configured.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 1.2,
            }}
          >
            {features.slice(0, 6).map((feature) => (
              <Box
                key={feature.id}
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  border: "1px solid #edf1f5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: feature.enabled
                        ? "#22c55e"
                        : "#cbd5e1",
                    }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      {feature.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "9px",
                        color: "#94a3b8",
                      }}
                    >
                      {feature.key}
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label={
                    feature.enabled
                      ? "ON"
                      : "OFF"
                  }
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "9px",
                    fontWeight: 800,
                    background: feature.enabled
                      ? "#dcfce7"
                      : "#f1f5f9",
                    color: feature.enabled
                      ? "#15803d"
                      : "#64748b",
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* FOOTER */}

      <Box
        sx={{
          py: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: .7,
        }}
      >
        <TrendingUpRounded
          sx={{
            fontSize: 14,
            color: "#cbd5e1",
          }}
        />

        <Typography
          sx={{
            color: "#94a3b8",
            fontSize: "10px",
          }}
        >
          Feature Flag & Environment Management System
        </Typography>
      </Box>
    </Box>
  );
}
