
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  AdminPanelSettings,
  History,
  Refresh,
  Search,
  Settings,
  Shield,
} from "@mui/icons-material";

import api from "../../services/api";
import type { AuditLog, User } from "../../types";

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActionColor(action: string) {
  const normalized = action.toUpperCase();

  if (normalized.includes("ENABLE")) {
    return "success";
  }

  if (normalized.includes("DISABLE")) {
    return "warning";
  }

  if (normalized.includes("CREATE")) {
    return "info";
  }

  if (normalized.includes("DELETE")) {
    return "error";
  }

  if (normalized.includes("ROLLBACK")) {
    return "secondary";
  }

  return "default";
}

function getActionIcon(action: string) {
  const normalized = action.toUpperCase();

  if (normalized.includes("ROLLBACK")) {
    return <History fontSize="small" />;
  }

  if (
    normalized.includes("ENABLE") ||
    normalized.includes("DISABLE")
  ) {
    return <Settings fontSize="small" />;
  }

  if (normalized.includes("DELETE")) {
    return <Shield fontSize="small" />;
  }

  return <History fontSize="small" />;
}

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const [auditResponse, usersResponse] = await Promise.all([
        api.get<AuditLog[]>("/audit-logs"),
        api.get<User[]>("/users"),
      ]);

      setAuditLogs(auditResponse.data);
      setUsers(usersResponse.data);
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view the complete audit log."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load audit logs."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<number, User>();

    users.forEach((user) => {
      map.set(user.id, user);
    });

    return map;
  }, [users]);

  const availableActions = useMemo(() => {
    return Array.from(
      new Set(auditLogs.map((log) => log.action))
    );
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return auditLogs.filter((log) => {
      const user = log.user_id
        ? userMap.get(log.user_id)
        : undefined;

      const matchesSearch =
        !query ||
        log.action.toLowerCase().includes(query) ||
        log.entity_type.toLowerCase().includes(query) ||
        String(log.entity_id ?? "").includes(query) ||
        String(log.user_id ?? "").includes(query) ||
        user?.full_name.toLowerCase().includes(query) ||
        user?.email.toLowerCase().includes(query) ||
        log.old_value?.toLowerCase().includes(query) ||
        log.new_value?.toLowerCase().includes(query);

      const matchesAction =
        actionFilter === "ALL" ||
        log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [auditLogs, search, actionFilter, userMap]);

  const totalEvents = auditLogs.length;

  const rollbackEvents = auditLogs.filter(
    (log) => log.action.toUpperCase() === "ROLLBACK"
  ).length;

  const updateEvents = auditLogs.filter(
    (log) => log.action.toUpperCase() === "UPDATE"
  ).length;

  const uniqueUsers = new Set(
    auditLogs
      .map((log) => log.user_id)
      .filter((id): id is number => id !== null)
  ).size;

  return (
    <Box
      sx={{
        minHeight: "100%",
        background: "#f8fafc",
        p: { xs: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
          mb: 3,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            mb={0.5}
          >
            <Avatar
              sx={{
                width: 42,
                height: 42,
                background:
                  "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
              }}
            >
              <History />
            </Avatar>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                fontSize: { xs: "1.65rem", md: "2rem" },
              }}
            >
              Audit Logs
            </Typography>
          </Stack>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Track feature changes, rollouts and administrative activity.
          </Typography>
        </Box>

        <Tooltip title="Refresh audit logs">
          <IconButton
            onClick={loadAuditLogs}
            disabled={loading}
            sx={{
              width: 44,
              height: 44,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              "&:hover": {
                background: "#f1f5f9",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Refresh />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          {
            label: "Total Events",
            value: totalEvents,
            icon: <History />,
            background: "#eef2ff",
            color: "#4f46e5",
          },
          {
            label: "Updates",
            value: updateEvents,
            icon: <Settings />,
            background: "#ecfeff",
            color: "#0891b2",
          },
          {
            label: "Rollbacks",
            value: rollbackEvents,
            icon: <History />,
            background: "#faf5ff",
            color: "#9333ea",
          },
          {
            label: "Active Users",
            value: uniqueUsers,
            icon: <AdminPanelSettings />,
            background: "#f0fdf4",
            color: "#16a34a",
          },
        ].map((item) => (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {item.value}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  background: item.background,
                  color: item.color,
                }}
              >
                {item.icon}
              </Avatar>
            </Stack>
          </Paper>
        ))}
      </Box>

      {/* Main content */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search audit activity..."
            sx={{
              flex: 1,
              minWidth: 240,
              maxWidth: 420,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                background: "#f8fafc",
              },
            }}
            InputProps={{
              startAdornment: (
                <Search
                  sx={{
                    mr: 1,
                    color: "#94a3b8",
                  }}
                />
              ),
            }}
          />

          <TextField
            select
            size="small"
            value={actionFilter}
            onChange={(event) =>
              setActionFilter(event.target.value)
            }
            SelectProps={{
              native: true,
            }}
            sx={{
              minWidth: 170,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          >
            <option value="ALL">All Actions</option>

            {availableActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </TextField>
        </Box>

        <Divider />

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {loading ? (
          <Box
            sx={{
              minHeight: 320,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : !error && filteredLogs.length === 0 ? (
          <Box
            sx={{
              minHeight: 320,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mb: 2,
                background: "#f1f5f9",
                color: "#64748b",
              }}
            >
              <History />
            </Avatar>

            <Typography
              sx={{
                fontWeight: 700,
                color: "#334155",
              }}
            >
              No audit activity found
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              Try changing your search or action filter.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: "#f8fafc",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                      fontSize: "12px",
                    }}
                  >
                    ACTION
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                      fontSize: "12px",
                    }}
                  >
                    ENTITY
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                      fontSize: "12px",
                    }}
                  >
                    USER
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                      fontSize: "12px",
                    }}
                  >
                    CHANGES
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                      fontSize: "12px",
                    }}
                  >
                    DATE & TIME
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredLogs.map((log) => {
                  const user = log.user_id
                    ? userMap.get(log.user_id)
                    : undefined;

                  return (
                    <TableRow
                      key={log.id}
                      hover
                      sx={{
                        "&:last-child td": {
                          borderBottom: 0,
                        },
                      }}
                    >
                      <TableCell>
                        <Chip
                          icon={getActionIcon(log.action)}
                          label={log.action}
                          color={
                            getActionColor(log.action) as
                              | "default"
                              | "primary"
                              | "secondary"
                              | "error"
                              | "info"
                              | "success"
                              | "warning"
                          }
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: "14px",
                          }}
                        >
                          {log.entity_type}
                        </Typography>

                        <Typography
                          sx={{
                            color: "#94a3b8",
                            fontSize: "12px",
                            mt: 0.3,
                          }}
                        >
                          ID: {log.entity_id ?? "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: "13px",
                              fontWeight: 700,
                              background:
                                "linear-gradient(135deg, #2563eb, #4f46e5)",
                            }}
                          >
                            {user?.full_name
                              ? user.full_name
                                  .split(" ")
                                  .map((part) => part[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              : "U"}
                          </Avatar>

                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: "#334155",
                                fontSize: "13px",
                              }}
                            >
                              {user?.full_name ||
                                `User ${log.user_id ?? "System"}`}
                            </Typography>

                            {user?.email && (
                              <Typography
                                sx={{
                                  color: "#94a3b8",
                                  fontSize: "11px",
                                }}
                              >
                                {user.email}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ minWidth: 260 }}>
                        <Stack spacing={0.7}>
                          {log.old_value && (
                            <Box>
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  color: "#ef4444",
                                  mr: 0.7,
                                }}
                              >
                                OLD
                              </Typography>

                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "12px",
                                  color: "#64748b",
                                }}
                              >
                                {log.old_value}
                              </Typography>
                            </Box>
                          )}

                          {log.new_value && (
                            <Box>
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  color: "#16a34a",
                                  mr: 0.7,
                                }}
                              >
                                NEW
                              </Typography>

                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "12px",
                                  color: "#334155",
                                }}
                              >
                                {log.new_value}
                              </Typography>
                            </Box>
                          )}

                          {!log.old_value && !log.new_value && (
                            <Typography
                              sx={{
                                color: "#94a3b8",
                                fontSize: "12px",
                              }}
                            >
                              No change details
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ minWidth: 175 }}>
                        <Stack
                          direction="row"
                          spacing={0.7}
                          alignItems="center"
                        >
                          <AccessTime
                            sx={{
                              fontSize: 16,
                              color: "#94a3b8",
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "#64748b",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDateTime(log.created_at)}
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Footer */}
        {!loading && !error && (
          <>
            <Divider />

            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                Showing {filteredLogs.length} of {auditLogs.length} audit
                events
              </Typography>

              <Typography
                sx={{
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                Audit history is read-only
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
