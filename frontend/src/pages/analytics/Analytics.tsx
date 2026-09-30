import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  Assessment,
  CheckCircle,
  Groups,
  TrendingDown,
} from "@mui/icons-material";

import api from "../../services/api";

import type {
  AnalyticsSummary,
  FeatureAnalytics,
  EnvironmentAnalytics,
} from "../../types";


export default function Analytics() {
  const [summary, setSummary] =
    useState<AnalyticsSummary | null>(null);

  const [features, setFeatures] =
    useState<FeatureAnalytics[]>([]);

  const [environments, setEnvironments] =
    useState<EnvironmentAnalytics[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const summaryResponse =
        await api.get<AnalyticsSummary>(
          "/analytics/summary"
        );

      const featuresResponse =
        await api.get<FeatureAnalytics[]>(
          "/analytics/features"
        );

      const environmentsResponse =
        await api.get<EnvironmentAnalytics[]>(
          "/analytics/environments"
        );

      setSummary(summaryResponse.data);
      setFeatures(featuresResponse.data);
      setEnvironments(
        environmentsResponse.data
      );

    } catch (err: any) {
      console.error(
        "Analytics loading error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load analytics data."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAnalytics();
  }, []);


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />

          <Typography
            sx={{
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            Loading analytics...
          </Typography>
        </Stack>
      </Box>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: "#f8fafc",
        padding: {
          xs: "20px",
          md: "32px",
        },
      }}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
        sx={{
          marginBottom: "28px",
        }}
      >

        <Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.5px",
            }}
          >
            Analytics
          </Typography>

          <Typography
            sx={{
              marginTop: "6px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Monitor feature usage, evaluations,
            and rollout performance.
          </Typography>

        </Box>


        <Chip
          label="Live Analytics"
          icon={<Assessment />}
          color="primary"
          variant="outlined"
          sx={{
            fontWeight: 600,
          }}
        />

      </Stack>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            marginBottom: "24px",
            borderRadius: "12px",
          }}
        >
          {error}
        </Alert>
      )}


      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{
          marginBottom: "28px",
        }}
      >

        {/* TOTAL */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >

          <Card
            sx={{
              height: "100%",
              borderRadius: "16px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 14px rgba(15,23,42,0.05)",
            }}
          >

            <CardContent
              sx={{
                padding: "24px",
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
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    Total Evaluations
                  </Typography>

                  <Typography
                    sx={{
                      marginTop: "8px",
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {summary?.total_evaluations ?? 0}
                  </Typography>

                  <Typography
                    sx={{
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    Total feature evaluations
                  </Typography>

                </Box>

                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "12px",
                    backgroundColor: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  <Assessment
                    sx={{
                      color: "#2563eb",
                      fontSize: 25,
                    }}
                  />

                </Box>

              </Stack>

            </CardContent>

          </Card>

        </Grid>


        {/* ENABLED */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >

          <Card
            sx={{
              height: "100%",
              borderRadius: "16px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 14px rgba(15,23,42,0.05)",
            }}
          >

            <CardContent
              sx={{
                padding: "24px",
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
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    Enabled Evaluations
                  </Typography>

                  <Typography
                    sx={{
                      marginTop: "8px",
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {summary?.enabled_evaluations ?? 0}
                  </Typography>

                  <Typography
                    sx={{
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    Features returned enabled
                  </Typography>

                </Box>

                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "12px",
                    backgroundColor: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  <CheckCircle
                    sx={{
                      color: "#16a34a",
                      fontSize: 25,
                    }}
                  />

                </Box>

              </Stack>

            </CardContent>

          </Card>

        </Grid>


        {/* DISABLED */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >

          <Card
            sx={{
              height: "100%",
              borderRadius: "16px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 14px rgba(15,23,42,0.05)",
            }}
          >

            <CardContent
              sx={{
                padding: "24px",
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
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    Disabled Evaluations
                  </Typography>

                  <Typography
                    sx={{
                      marginTop: "8px",
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {summary?.disabled_evaluations ?? 0}
                  </Typography>

                  <Typography
                    sx={{
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    Features returned disabled
                  </Typography>

                </Box>

                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "12px",
                    backgroundColor: "#fef2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  <TrendingDown
                    sx={{
                      color: "#dc2626",
                      fontSize: 25,
                    }}
                  />

                </Box>

              </Stack>

            </CardContent>

          </Card>

        </Grid>


        {/* USERS */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >

          <Card
            sx={{
              height: "100%",
              borderRadius: "16px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 14px rgba(15,23,42,0.05)",
            }}
          >

            <CardContent
              sx={{
                padding: "24px",
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
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    Unique Users
                  </Typography>

                  <Typography
                    sx={{
                      marginTop: "8px",
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {summary?.unique_users ?? 0}
                  </Typography>

                  <Typography
                    sx={{
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    Users evaluated
                  </Typography>

                </Box>

                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "12px",
                    backgroundColor: "#f5f3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  <Groups
                    sx={{
                      color: "#7c3aed",
                      fontSize: 25,
                    }}
                  />

                </Box>

              </Stack>

            </CardContent>

          </Card>

        </Grid>

      </Grid>


      {/* =====================================================
          OVERVIEW CARDS
      ====================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{
          marginBottom: "28px",
        }}
      >

        {/* ENABLED RATE */}

        <Grid
          size={{
            xs: 12,
            md: 5,
          }}
        >

          <Card
            sx={{
              height: "100%",
              borderRadius: "16px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 14px rgba(15,23,42,0.05)",
            }}
          >

            <CardContent
              sx={{
                padding: "24px",
              }}
            >

              <Typography
                sx={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Evaluation Overview
              </Typography>

              <Typography
                sx={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginTop: "4px",
                }}
              >
                Overall feature evaluation status.
              </Typography>


              <Box
                sx={{
                  marginTop: "28px",
                  textAlign: "center",
                }}
              >

                <Typography
                  sx={{
                    fontSize: "48px",
                    fontWeight: 800,
                    color: "#2563eb",
                  }}
                >
                  {summary?.enabled_percentage ?? 0}%
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Enabled evaluation rate
                </Typography>

              </Box>


              <Box
                sx={{
                  marginTop: "24px",
                }}
              >

                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    Math.max(
                      summary?.enabled_percentage ?? 0,
                      0
                    ),
                    100
                  )}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                  }}
                />

              </Box>


              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{
                  marginTop: "12px",
                }}
              >

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Enabled:{" "}
                  {summary?.enabled_evaluations ?? 0}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Disabled:{" "}
                  {summary?.disabled_evaluations ?? 0}
                </Typography>

              </Stack>

            </CardContent>

          </Card>

        </Grid>


        {/* SYSTEM STATS */}

        <Grid
          size={{
            xs: 12,
            md: 7,
          }}
        >

          <Card
            sx={{
              height: "100%",
              borderRadius: "16px",
              border:
                "1px solid #e2e8f0",
              boxShadow:
                "0 4px 14px rgba(15,23,42,0.05)",
            }}
          >

            <CardContent
              sx={{
                padding: "24px",
              }}
            >

              <Typography
                sx={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                System Analytics
              </Typography>

              <Typography
                sx={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginTop: "4px",
                  marginBottom: "20px",
                }}
              >
                Current platform usage statistics.
              </Typography>


              <Grid
                container
                spacing={2}
              >

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >

                  <Box
                    sx={{
                      padding: "18px",
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      Unique Features
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "26px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginTop: "4px",
                      }}
                    >
                      {summary?.unique_features ?? 0}
                    </Typography>

                  </Box>

                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >

                  <Box
                    sx={{
                      padding: "18px",
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      Unique Users
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "26px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginTop: "4px",
                      }}
                    >
                      {summary?.unique_users ?? 0}
                    </Typography>

                  </Box>

                </Grid>


                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >

                  <Box
                    sx={{
                      padding: "18px",
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      Total Evaluations
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "26px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginTop: "4px",
                      }}
                    >
                      {summary?.total_evaluations ?? 0}
                    </Typography>

                  </Box>

                </Grid>

              </Grid>

            </CardContent>

          </Card>

        </Grid>

      </Grid>


      {/* =====================================================
          FEATURE USAGE
      ====================================================== */}

      <Card
        sx={{
          marginBottom: "28px",
          borderRadius: "16px",
          border:
            "1px solid #e2e8f0",
          boxShadow:
            "0 4px 14px rgba(15,23,42,0.05)",
        }}
      >

        <CardContent
          sx={{
            padding: "24px",
          }}
        >

          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Feature Usage
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",
              color: "#64748b",
              marginTop: "4px",
              marginBottom: "20px",
            }}
          >
            Evaluation statistics for each feature.
          </Typography>


          {features.length === 0 ? (

            <Box
              sx={{
                padding: "30px",
                textAlign: "center",
              }}
            >

              <Typography
                sx={{
                  color: "#94a3b8",
                }}
              >
                No feature usage data available.
              </Typography>

            </Box>

          ) : (

            <Stack spacing={2}>

              {features.map((feature) => (

                <Box
                  key={feature.feature_flag_id}
                  sx={{
                    padding: "18px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                >

                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    justifyContent="space-between"
                    spacing={2}
                  >

                    <Box>

                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {feature.feature_name}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#64748b",
                          marginTop: "3px",
                        }}
                      >
                        {feature.feature_key}
                      </Typography>

                    </Box>


                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                    >

                      <Chip
                        size="small"
                        label={`${feature.total_evaluations} evaluations`}
                      />

                      <Chip
                        size="small"
                        color="success"
                        variant="outlined"
                        label={`${feature.enabled_evaluations} enabled`}
                      />

                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${feature.disabled_evaluations} disabled`}
                      />

                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={`${feature.enabled_percentage}% enabled`}
                      />

                    </Stack>

                  </Stack>


                  <Box
                    sx={{
                      marginTop: "18px",
                    }}
                  >

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        marginBottom: "6px",
                      }}
                    >

                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        Enabled percentage
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {feature.enabled_percentage}%
                      </Typography>

                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        Math.max(
                          feature.enabled_percentage,
                          0
                        ),
                        100
                      )}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                      }}
                    />

                  </Box>

                </Box>

              ))}

            </Stack>

          )}

        </CardContent>

      </Card>


      {/* =====================================================
          ENVIRONMENT ANALYTICS
      ====================================================== */}

      <Card
        sx={{
          borderRadius: "16px",
          border:
            "1px solid #e2e8f0",
          boxShadow:
            "0 4px 14px rgba(15,23,42,0.05)",
        }}
      >

        <CardContent
          sx={{
            padding: "24px",
          }}
        >

          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            Environment Analytics
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",
              color: "#64748b",
              marginTop: "4px",
              marginBottom: "20px",
            }}
          >
            Evaluation activity across application
            environments.
          </Typography>


          {environments.length === 0 ? (

            <Box
              sx={{
                padding: "30px",
                textAlign: "center",
              }}
            >

              <Typography
                sx={{
                  color: "#94a3b8",
                }}
              >
                No environment analytics available.
              </Typography>

            </Box>

          ) : (

            <Stack spacing={3}>

              {environments.map(
                (environment) => (

                  <Box
                    key={
                      environment.environment_id
                    }
                  >

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        marginBottom: "8px",
                      }}
                    >

                      <Box>

                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#334155",
                          }}
                        >
                          {
                            environment.environment_name
                          }
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#94a3b8",
                          }}
                        >
                          {
                            environment.total_evaluations
                          } total evaluations
                        </Typography>

                      </Box>


                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#2563eb",
                        }}
                      >
                        {
                          environment.enabled_percentage
                        }%
                      </Typography>

                    </Stack>


                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        Math.max(
                          environment.enabled_percentage,
                          0
                        ),
                        100
                      )}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                      }}
                    />

                  </Box>

                )
              )}

            </Stack>

          )}

        </CardContent>

      </Card>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Box
        sx={{
          marginTop: "24px",
          padding: "16px 20px",
          borderRadius: "12px",
          backgroundColor: "#f1f5f9",
          border:
            "1px solid #e2e8f0",
        }}
      >

        <Typography
          sx={{
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Analytics data is generated from feature
          evaluation activity recorded by the platform.
        </Typography>

      </Box>

    </Box>
  );
}