import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Add,
  CheckCircle,
  Delete,
  Edit,
  People,
  Refresh,
  Search,
  ToggleOff,
  ToggleOn,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import api from "../../services/api";

import type {
  FeatureFlag,
  User,
  UserAssignment,
} from "../../types";


interface AssignmentForm {
  user_id: string;
  feature_flag_id: string;
  enabled: boolean;
  notes: string;
}


const emptyForm: AssignmentForm = {
  user_id: "",
  feature_flag_id: "",
  enabled: true,
  notes: "",
};


interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  description: string;
}


function StatCard({
  title,
  value,
  icon,
  description,
}: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        height: "100%",
        transition: "0.2s",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#64748b",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: "28px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {value}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: "12px",
                color: "#94a3b8",
              }}
            >
              {description}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#eff6ff",
              color: "#2563eb",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}


export default function Assignments() {
  const [assignments, setAssignments] =
    useState<UserAssignment[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [features, setFeatures] =
    useState<FeatureFlag[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [editingAssignment, setEditingAssignment] =
    useState<UserAssignment | null>(null);

  const [deletingAssignment, setDeletingAssignment] =
    useState<UserAssignment | null>(null);

  const [form, setForm] =
    useState<AssignmentForm>(emptyForm);

  const [snackbar, setSnackbar] =
    useState({
      open: false,
      message: "",
      severity: "success" as
        | "success"
        | "error",
    });


  const showMessage = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };


  const loadData = async () => {
    try {
      setLoading(true);

      const [
        assignmentsResponse,
        usersResponse,
        featuresResponse,
      ] = await Promise.all([
        api.get<UserAssignment[]>(
          "/assignments"
        ),
        api.get<User[]>("/users"),
        api.get<FeatureFlag[]>(
          "/feature-flags"
        ),
      ]);

      setAssignments(
        assignmentsResponse.data
      );

      setUsers(usersResponse.data);

      setFeatures(featuresResponse.data);

    } catch (error: any) {
      console.error(
        "Failed to load assignments:",
        error
      );

      showMessage(
        error?.response?.data?.detail ||
          "Failed to load assignment data",
        "error"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  const getUser = (userId: number) => {
    return users.find(
      (user) => user.id === userId
    );
  };


  const getFeature = (
    featureId: number
  ) => {
    return features.find(
      (feature) =>
        feature.id === featureId
    );
  };


  const filteredAssignments =
    useMemo(() => {

      const value =
        search.trim().toLowerCase();

      if (!value) {
        return assignments;
      }

      return assignments.filter(
        (assignment) => {

          const user =
            getUser(
              assignment.user_id
            );

          const feature =
            getFeature(
              assignment.feature_flag_id
            );

          return (
            user?.full_name
              ?.toLowerCase()
              .includes(value) ||
            user?.email
              ?.toLowerCase()
              .includes(value) ||
            feature?.name
              ?.toLowerCase()
              .includes(value) ||
            feature?.key
              ?.toLowerCase()
              .includes(value) ||
            assignment.notes
              ?.toLowerCase()
              .includes(value)
          );
        }
      );

    }, [
      assignments,
      users,
      features,
      search,
    ]);


  const totalAssignments =
    assignments.length;

  const enabledAssignments =
    assignments.filter(
      (assignment) =>
        assignment.enabled
    ).length;

  const disabledAssignments =
    totalAssignments -
    enabledAssignments;


  const openCreateDialog = () => {

    setEditingAssignment(null);

    setForm({
      ...emptyForm,
      feature_flag_id:
        features.length > 0
          ? String(features[0].id)
          : "",
      user_id:
        users.length > 0
          ? String(users[0].id)
          : "",
    });

    setDialogOpen(true);
  };


  const openEditDialog = (
    assignment: UserAssignment
  ) => {

    setEditingAssignment(
      assignment
    );

    setForm({
      user_id: String(
        assignment.user_id
      ),
      feature_flag_id:
        String(
          assignment.feature_flag_id
        ),
      enabled:
        assignment.enabled,
      notes:
        assignment.notes || "",
    });

    setDialogOpen(true);
  };


  const closeDialog = () => {

    if (saving) {
      return;
    }

    setDialogOpen(false);

    setEditingAssignment(null);

    setForm(emptyForm);
  };


  const handleSave = async () => {

    if (!form.user_id) {
      showMessage(
        "Please select a user",
        "error"
      );
      return;
    }

    if (!form.feature_flag_id) {
      showMessage(
        "Please select a feature flag",
        "error"
      );
      return;
    }

    try {

      setSaving(true);

      const payload = {
        user_id: Number(
          form.user_id
        ),
        feature_flag_id:
          Number(
            form.feature_flag_id
          ),
        enabled: form.enabled,
        notes:
          form.notes.trim() ||
          null,
      };


      if (editingAssignment) {

        const response =
          await api.put<UserAssignment>(
            `/assignments/${editingAssignment.id}`,
            {
              enabled:
                payload.enabled,
              notes:
                payload.notes,
            }
          );

        setAssignments(
          (current) =>
            current.map(
              (assignment) =>
                assignment.id ===
                editingAssignment.id
                  ? response.data
                  : assignment
            )
        );

        showMessage(
          "Assignment updated successfully"
        );

      } else {

        const response =
          await api.post<UserAssignment>(
            "/assignments",
            payload
          );

        setAssignments(
          (current) => [
            response.data,
            ...current,
          ]
        );

        showMessage(
          "User assignment created successfully"
        );
      }

      closeDialog();

    } catch (error: any) {

      console.error(
        "Failed to save assignment:",
        error
      );

      showMessage(
        error?.response?.data?.detail ||
          "Failed to save assignment",
        "error"
      );

    } finally {
      setSaving(false);
    }
  };


  const toggleAssignment =
    async (
      assignment: UserAssignment
    ) => {

      try {

        const endpoint =
          assignment.enabled
            ? `/assignments/${assignment.id}/disable`
            : `/assignments/${assignment.id}/enable`;

        const response =
          await api.patch<UserAssignment>(
            endpoint
          );

        setAssignments(
          (current) =>
            current.map(
              (item) =>
                item.id === assignment.id
                  ? response.data
                  : item
            )
        );

        showMessage(
          response.data.enabled
            ? "Feature enabled for user"
            : "Feature disabled for user"
        );

      } catch (error: any) {

        console.error(
          "Failed to update assignment:",
          error
        );

        showMessage(
          error?.response?.data?.detail ||
            "Failed to update assignment",
          "error"
        );
      }
    };


  const confirmDelete = (
    assignment: UserAssignment
  ) => {

    setDeletingAssignment(
      assignment
    );

    setDeleteDialogOpen(true);
  };


  const handleDelete = async () => {

    if (!deletingAssignment) {
      return;
    }

    try {

      setSaving(true);

      await api.delete(
        `/assignments/${deletingAssignment.id}`
      );

      setAssignments(
        (current) =>
          current.filter(
            (assignment) =>
              assignment.id !==
              deletingAssignment.id
          )
      );

      showMessage(
        "Assignment deleted successfully"
      );

      setDeleteDialogOpen(false);

      setDeletingAssignment(null);

    } catch (error: any) {

      console.error(
        "Failed to delete assignment:",
        error
      );

      showMessage(
        error?.response?.data?.detail ||
          "Failed to delete assignment",
        "error"
      );

    } finally {
      setSaving(false);
    }
  };


  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
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
          xs: "stretch",
          md: "center",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >

        <Box>

          <Typography
            sx={{
              fontSize: {
                xs: "24px",
                md: "28px",
              },
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            User Assignments
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            Control feature access for
            specific users.
          </Typography>

        </Box>


        <Stack
          direction="row"
          spacing={1}
        >

          <Tooltip title="Refresh">

            <IconButton
              onClick={loadData}
              disabled={loading}
              sx={{
                border:
                  "1px solid #e2e8f0",
                borderRadius: "10px",
              }}
            >
              <Refresh />
            </IconButton>

          </Tooltip>


          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={
              openCreateDialog
            }
            disabled={
              users.length === 0 ||
              features.length === 0
            }
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              boxShadow: "none",
              "&:hover": {
                boxShadow:
                  "0 6px 16px rgba(37, 99, 235, 0.25)",
              },
            }}
          >
            Create Assignment
          </Button>

        </Stack>

      </Stack>


      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >

        <StatCard
          title="Total Assignments"
          value={totalAssignments}
          icon={<People />}
          description="User-specific feature rules"
        />

        <StatCard
          title="Enabled"
          value={enabledAssignments}
          icon={<CheckCircle />}
          description="Features currently enabled"
        />

        <StatCard
          title="Disabled"
          value={disabledAssignments}
          icon={<ToggleOff />}
          description="Features currently disabled"
        />

      </Box>


      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid #e2e8f0",
          borderRadius: "16px",
        }}
      >

        <CardContent
          sx={{ p: 0 }}
        >

          {/* SEARCH */}

          <Box
            sx={{
              p: 2,
              borderBottom:
                "1px solid #e2e8f0",
            }}
          >

            <TextField
              fullWidth
              size="small"
              placeholder="Search by user, email, feature or notes..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        color:
                          "#94a3b8",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: "600px",
                "& .MuiOutlinedInput-root":
                  {
                    borderRadius:
                      "10px",
                  },
              }}
            />

          </Box>


          {/* LOADING */}

          {loading ? (

            <Box
              sx={{
                py: 10,
                display: "flex",
                justifyContent:
                  "center",
              }}
            >
              <CircularProgress />
            </Box>

          ) : filteredAssignments.length ===
            0 ? (

            /* EMPTY STATE */

            <Box
              sx={{
                py: 10,
                px: 3,
                textAlign: "center",
              }}
            >

              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "16px",
                  background:
                    "#eff6ff",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <People
                  sx={{
                    fontSize: 30,
                    color: "#2563eb",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#0f172a",
                }}
              >
                No assignments found
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Create a user-specific
                feature assignment to
                control access.
              </Typography>

            </Box>

          ) : (

            /* ASSIGNMENT LIST */

            <Box>

              {filteredAssignments.map(
                (
                  assignment,
                  index
                ) => {

                  const user =
                    getUser(
                      assignment.user_id
                    );

                  const feature =
                    getFeature(
                      assignment.feature_flag_id
                    );

                  return (
                    <Box
                      key={
                        assignment.id
                      }
                      sx={{
                        px: 2.5,
                        py: 2.25,
                        borderBottom:
                          index <
                          filteredAssignments.length -
                            1
                            ? "1px solid #f1f5f9"
                            : "none",
                        transition:
                          "background 0.2s",
                        "&:hover": {
                          background:
                            "#f8fafc",
                        },
                      }}
                    >

                      <Stack
                        direction={{
                          xs: "column",
                          lg: "row",
                        }}
                        spacing={2}
                        alignItems={{
                          xs: "stretch",
                          lg: "center",
                        }}
                      >

                        {/* USER */}

                        <Box
                          sx={{
                            flex: 1.2,
                            minWidth: 0,
                          }}
                        >

                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: "15px",
                              color:
                                "#0f172a",
                            }}
                          >
                            {user?.full_name ||
                              `User #${assignment.user_id}`}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.25,
                              fontSize: "12px",
                              color:
                                "#64748b",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                            }}
                          >
                            {user?.email ||
                              "Unknown user"}
                          </Typography>

                        </Box>


                        {/* FEATURE */}

                        <Box
                          sx={{
                            flex: 1.2,
                            minWidth: 0,
                          }}
                        >

                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "14px",
                              color:
                                "#334155",
                            }}
                          >
                            {feature?.name ||
                              `Feature #${assignment.feature_flag_id}`}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.25,
                              fontSize: "12px",
                              color:
                                "#64748b",
                              fontFamily:
                                "monospace",
                            }}
                          >
                            {feature?.key ||
                              "unknown_feature"}
                          </Typography>

                        </Box>


                        {/* STATUS */}

                        <Box
                          sx={{
                            minWidth: 110,
                          }}
                        >

                          <Chip
                            size="small"
                            icon={
                              assignment.enabled
                                ? (
                                  <CheckCircle
                                    sx={{
                                      fontSize:
                                        "16px !important",
                                    }}
                                  />
                                )
                                : undefined
                            }
                            label={
                              assignment.enabled
                                ? "Enabled"
                                : "Disabled"
                            }
                            sx={{
                              fontWeight: 600,
                              backgroundColor:
                                assignment.enabled
                                  ? "#ecfdf5"
                                  : "#f1f5f9",
                              color:
                                assignment.enabled
                                  ? "#047857"
                                  : "#64748b",
                            }}
                          />

                        </Box>


                        {/* NOTES */}

                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            display: {
                              xs: "none",
                              md: "block",
                            },
                          }}
                        >

                          <Typography
                            sx={{
                              fontSize: "13px",
                              color:
                                "#64748b",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {assignment.notes ||
                              "No notes"}
                          </Typography>

                        </Box>


                        {/* ACTIONS */}

                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >

                          <Tooltip
                            title={
                              assignment.enabled
                                ? "Disable"
                                : "Enable"
                            }
                          >

                            <IconButton
                              size="small"
                              onClick={() =>
                                toggleAssignment(
                                  assignment
                                )
                              }
                              sx={{
                                color:
                                  assignment.enabled
                                    ? "#f59e0b"
                                    : "#16a34a",
                              }}
                            >
                              {assignment.enabled ? (
                                <ToggleOn />
                              ) : (
                                <ToggleOff />
                              )}
                            </IconButton>

                          </Tooltip>


                          <Tooltip title="Edit">

                            <IconButton
                              size="small"
                              onClick={() =>
                                openEditDialog(
                                  assignment
                                )
                              }
                              sx={{
                                color:
                                  "#2563eb",
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>

                          </Tooltip>


                          <Tooltip title="Delete">

                            <IconButton
                              size="small"
                              onClick={() =>
                                confirmDelete(
                                  assignment
                                )
                              }
                              sx={{
                                color:
                                  "#dc2626",
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>

                          </Tooltip>

                        </Stack>

                      </Stack>

                    </Box>
                  );
                }
              )}

            </Box>

          )}

        </CardContent>

      </Card>


      {/* =====================================================
          CREATE / EDIT DIALOG
      ====================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {editingAssignment
            ? "Edit User Assignment"
            : "Create User Assignment"}
        </DialogTitle>


        <DialogContent>

          <Stack spacing={2.5} sx={{ pt: 1 }}>

            {!editingAssignment && (

              <>
                <TextField
                  select
                  fullWidth
                  label="User"
                  value={form.user_id}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      user_id:
                        event.target.value,
                    })
                  }
                >

                  {users.map((user) => (
                    <MenuItem
                      key={user.id}
                      value={user.id}
                    >
                      {user.full_name} —{" "}
                      {user.email}
                    </MenuItem>
                  ))}

                </TextField>


                <TextField
                  select
                  fullWidth
                  label="Feature Flag"
                  value={
                    form.feature_flag_id
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      feature_flag_id:
                        event.target.value,
                    })
                  }
                >

                  {features.map(
                    (feature) => (
                      <MenuItem
                        key={feature.id}
                        value={feature.id}
                      >
                        {feature.name} —{" "}
                        {feature.key}
                      </MenuItem>
                    )
                  )}

                </TextField>
              </>

            )}


            {editingAssignment && (

              <Box
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                }}
              >

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                    mb: 0.5,
                  }}
                >
                  Assignment
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  {getUser(
                    editingAssignment.user_id
                  )?.full_name ||
                    `User #${editingAssignment.user_id}`}
                  {" → "}
                  {getFeature(
                    editingAssignment.feature_flag_id
                  )?.name ||
                    `Feature #${editingAssignment.feature_flag_id}`}
                </Typography>

              </Box>

            )}


            <TextField
              select
              fullWidth
              label="Feature Access"
              value={
                form.enabled
                  ? "enabled"
                  : "disabled"
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  enabled:
                    event.target.value ===
                    "enabled",
                })
              }
            >

              <MenuItem value="enabled">
                Enabled
              </MenuItem>

              <MenuItem value="disabled">
                Disabled
              </MenuItem>

            </TextField>


            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Notes"
              placeholder="Add a note about this assignment..."
              value={form.notes}
              onChange={(event) =>
                setForm({
                  ...form,
                  notes:
                    event.target.value,
                })
              }
            />

          </Stack>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >

          <Button
            onClick={closeDialog}
            disabled={saving}
            sx={{
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              textTransform: "none",
              borderRadius: "9px",
              boxShadow: "none",
            }}
          >

            {saving ? (
              <CircularProgress
                size={20}
                sx={{ color: "#fff" }}
              />
            ) : (
              editingAssignment
                ? "Save Changes"
                : "Create Assignment"
            )}

          </Button>

        </DialogActions>

      </Dialog>


      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onClose={() =>
          !saving &&
          setDeleteDialogOpen(false)
        }
        maxWidth="xs"
        fullWidth
      >

        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Delete Assignment
        </DialogTitle>


        <DialogContent>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Are you sure you want to remove this
            user-specific feature assignment?
          </Typography>

          {deletingAssignment && (

            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: "10px",
                background:
                  "#f8fafc",
              }}
            >

              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                {getUser(
                  deletingAssignment.user_id
                )?.full_name ||
                  `User #${deletingAssignment.user_id}`}
              </Typography>

              <Typography
                sx={{
                  fontSize: "13px",
                  color: "#64748b",
                  mt: 0.25,
                }}
              >
                {getFeature(
                  deletingAssignment.feature_flag_id
                )?.name ||
                  `Feature #${deletingAssignment.feature_flag_id}`}
              </Typography>

            </Box>

          )}

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >

          <Button
            onClick={() =>
              setDeleteDialogOpen(false)
            }
            disabled={saving}
            sx={{
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={saving}
            sx={{
              textTransform: "none",
              borderRadius: "9px",
              boxShadow: "none",
            }}
          >
            {saving
              ? "Deleting..."
              : "Delete Assignment"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* =====================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >

        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
            })
          }
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>
  );
}