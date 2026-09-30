
import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
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
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";

import api from "../../services/api";

import type {
  Environment,
  FeatureFlag,
  FeatureRollout,
} from "../../types";


interface RolloutForm {
  feature_flag_id: string;
  environment_id: string;
  percentage: string;
  enabled: boolean;
  scheduled_start: string;
  scheduled_end: string;
  notes: string;
  priority: string;
}


const initialForm: RolloutForm = {
  feature_flag_id: "",
  environment_id: "",
  percentage: "100",
  enabled: false,
  scheduled_start: "",
  scheduled_end: "",
  notes: "",
  priority: "1",
};


export default function Rollouts() {

  const [rollouts, setRollouts] =
    useState<FeatureRollout[]>([]);

  const [features, setFeatures] =
    useState<FeatureFlag[]>([]);

  const [environments, setEnvironments] =
    useState<Environment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingRollout, setEditingRollout] =
    useState<FeatureRollout | null>(null);

  const [form, setForm] =
    useState<RolloutForm>(initialForm);

  const [saving, setSaving] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<FeatureRollout | null>(null);

  const [snackbar, setSnackbar] =
    useState({
      open: false,
      message: "",
      severity: "success" as "success" | "error",
    });


  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = async () => {

    try {

      setLoading(true);

      const [
        rolloutsResponse,
        featuresResponse,
        environmentsResponse,
      ] = await Promise.all([
        api.get<FeatureRollout[]>(
          "/rollouts"
        ),
        api.get<FeatureFlag[]>(
          "/feature-flags"
        ),
        api.get<Environment[]>(
          "/environments"
        ),
      ]);

      setRollouts(
        rolloutsResponse.data
      );

      setFeatures(
        featuresResponse.data
      );

      setEnvironments(
        environmentsResponse.data
      );

    } catch (error: any) {

      setSnackbar({
        open: true,
        message:
          error.response?.data?.detail ||
          "Failed to load rollout data.",
        severity: "error",
      });

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    loadData();
  }, []);


  /* =========================================================
     LOOKUP HELPERS
  ========================================================= */

  const getFeature = (
    featureId: number
  ) =>
    features.find(
      (feature) =>
        feature.id === featureId
    );


  const getEnvironment = (
    environmentId: number
  ) =>
    environments.find(
      (environment) =>
        environment.id === environmentId
    );


  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredRollouts =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return rollouts;
      }

      return rollouts.filter(
        (rollout) => {

          const feature =
            getFeature(
              rollout.feature_flag_id
            );

          const environment =
            getEnvironment(
              rollout.environment_id
            );

          return (
            feature?.name
              .toLowerCase()
              .includes(query) ||
            feature?.key
              .toLowerCase()
              .includes(query) ||
            environment?.name
              .toLowerCase()
              .includes(query) ||
            rollout.notes
              ?.toLowerCase()
              .includes(query)
          );

        }
      );

    }, [
      rollouts,
      features,
      environments,
      search,
    ]);


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalRollouts =
    rollouts.length;

  const enabledRollouts =
    rollouts.filter(
      (rollout) =>
        rollout.enabled
    ).length;

  const disabledRollouts =
    totalRollouts -
    enabledRollouts;


  /* =========================================================
     CREATE
  ========================================================= */

  const handleCreate = () => {

    setEditingRollout(null);

    setForm({
      ...initialForm,
      feature_flag_id:
        features.length > 0
          ? String(features[0].id)
          : "",
      environment_id:
        environments.length > 0
          ? String(environments[0].id)
          : "",
    });

    setDialogOpen(true);

  };


  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (
    rollout: FeatureRollout
  ) => {

    setEditingRollout(rollout);

    setForm({
      feature_flag_id:
        String(
          rollout.feature_flag_id
        ),
      environment_id:
        String(
          rollout.environment_id
        ),
      percentage:
        String(
          rollout.percentage
        ),
      enabled:
        rollout.enabled,
      scheduled_start:
        formatDateTimeLocal(
          rollout.scheduled_start
        ),
      scheduled_end:
        formatDateTimeLocal(
          rollout.scheduled_end
        ),
      notes:
        rollout.notes || "",
      priority:
        String(
          rollout.priority
        ),
    });

    setDialogOpen(true);

  };


  /* =========================================================
     CLOSE
  ========================================================= */

  const handleCloseDialog = () => {

    if (saving) {
      return;
    }

    setDialogOpen(false);

    setEditingRollout(null);

    setForm(initialForm);

  };


  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {

    const featureId =
      Number(
        form.feature_flag_id
      );

    const environmentId =
      Number(
        form.environment_id
      );

    const percentage =
      Number(
        form.percentage
      );

    const priority =
      Number(
        form.priority
      );


    if (!featureId) {

      showError(
        "Please select a feature."
      );

      return;
    }


    if (!environmentId) {

      showError(
        "Please select an environment."
      );

      return;
    }


    if (
      Number.isNaN(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {

      showError(
        "Percentage must be between 0 and 100."
      );

      return;
    }


    if (
      Number.isNaN(priority) ||
      priority < 1
    ) {

      showError(
        "Priority must be at least 1."
      );

      return;
    }


    if (
      form.scheduled_start &&
      form.scheduled_end &&
      new Date(
        form.scheduled_end
      ) <=
        new Date(
          form.scheduled_start
        )
    ) {

      showError(
        "Scheduled end must be later than scheduled start."
      );

      return;
    }


    try {

      setSaving(true);


      const payload = {
        feature_flag_id:
          featureId,
        environment_id:
          environmentId,
        percentage,
        enabled:
          form.enabled,
        scheduled_start:
          form.scheduled_start
            ? new Date(
                form.scheduled_start
              ).toISOString()
            : null,
        scheduled_end:
          form.scheduled_end
            ? new Date(
                form.scheduled_end
              ).toISOString()
            : null,
        notes:
          form.notes.trim() ||
          null,
        priority,
      };


      if (editingRollout) {

        await api.put(
          `/rollouts/${editingRollout.id}`,
          {
            percentage:
              payload.percentage,
            enabled:
              payload.enabled,
            scheduled_start:
              payload.scheduled_start,
            scheduled_end:
              payload.scheduled_end,
            notes:
              payload.notes,
            priority:
              payload.priority,
          }
        );

        showSuccess(
          "Rollout updated successfully."
        );

      } else {

        await api.post(
          "/rollouts",
          payload
        );

        showSuccess(
          "Rollout created successfully."
        );

      }


      handleCloseDialog();

      await loadData();

    } catch (error: any) {

      showError(
        error.response?.data?.detail ||
        "Failed to save rollout."
      );

    } finally {

      setSaving(false);

    }

  };


  /* =========================================================
     TOGGLE
  ========================================================= */

  const handleToggle = async (
    rollout: FeatureRollout
  ) => {

    try {

      setActionLoading(
        rollout.id
      );


      if (rollout.enabled) {

        await api.patch(
          `/rollouts/${rollout.id}/disable`
        );

        showSuccess(
          "Rollout disabled."
        );

      } else {

        await api.patch(
          `/rollouts/${rollout.id}/enable`
        );

        showSuccess(
          "Rollout enabled."
        );

      }


      await loadData();

    } catch (error: any) {

      showError(
        error.response?.data?.detail ||
        "Failed to update rollout."
      );

    } finally {

      setActionLoading(null);

    }

  };


  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {

    if (!deleteTarget) {
      return;
    }


    try {

      setActionLoading(
        deleteTarget.id
      );


      await api.delete(
        `/rollouts/${deleteTarget.id}`
      );


      showSuccess(
        "Rollout deleted successfully."
      );


      setDeleteTarget(null);

      await loadData();

    } catch (error: any) {

      showError(
        error.response?.data?.detail ||
        "Failed to delete rollout."
      );

    } finally {

      setActionLoading(null);

    }

  };


  /* =========================================================
     SNACKBAR HELPERS
  ========================================================= */

  const showSuccess = (
    message: string
  ) => {

    setSnackbar({
      open: true,
      message,
      severity: "success",
    });

  };


  const showError = (
    message: string
  ) => {

    setSnackbar({
      open: true,
      message,
      severity: "error",
    });

  };


  /* =========================================================
     RENDER
  ========================================================= */

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

      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          justifyContent:
            "space-between",
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: "column",
            md: "row",
          },
        }}
      >

        <Box>

          <Typography
            sx={{
              fontSize: {
                xs: 24,
                md: 28,
              },
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing:
                "-0.02em",
            }}
          >
            Rollouts
          </Typography>

          <Typography
            sx={{
              mt: 0.6,
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Control how features are released
            across environments.
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
                backgroundColor:
                  "#ffffff",
                borderRadius: 2,
                width: 40,
                height: 40,
              }}
            >
              <RefreshRoundedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </IconButton>

          </Tooltip>


          <Button
            variant="contained"
            startIcon={
              <AddRoundedIcon />
            }
            onClick={handleCreate}
            disabled={
              features.length === 0 ||
              environments.length === 0
            }
            sx={{
              height: 40,
              px: 2,
              borderRadius: 2,
              textTransform:
                "none",
              fontWeight: 700,
              boxShadow: "none",
              backgroundColor:
                "#0f172a",
              "&:hover": {
                backgroundColor:
                  "#1e293b",
                boxShadow: "none",
              },
            }}
          >
            Create Rollout
          </Button>

        </Stack>

      </Box>


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
          icon={
            <RocketLaunchRoundedIcon />
          }
          label="Total Rollouts"
          value={totalRollouts}
          description="Configured rollouts"
        />

        <StatCard
          icon={
            <ToggleOnRoundedIcon />
          }
          label="Enabled"
          value={enabledRollouts}
          description="Currently active"
        />

        <StatCard
          icon={
            <ToggleOffRoundedIcon />
          }
          label="Disabled"
          value={disabledRollouts}
          description="Currently inactive"
        />

      </Box>


      {/* =====================================================
          LIST
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          border:
            "1px solid #e2e8f0",
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor:
            "#ffffff",
        }}
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
            placeholder="Search rollouts..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                >
                  <SearchRoundedIcon
                    sx={{
                      color:
                        "#94a3b8",
                      fontSize: 20,
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              "& .MuiOutlinedInput-root":
                {
                  borderRadius: 2,
                },
            }}
          />

        </Box>


        {/* LOADING */}

        {loading ? (

          <Box
            sx={{
              minHeight: 280,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
            }}
          >
            <CircularProgress
              size={30}
            />
          </Box>

        ) : filteredRollouts.length === 0 ? (

          /* EMPTY */

          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              flexDirection:
                "column",
              px: 3,
            }}
          >

            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                backgroundColor:
                  "#f1f5f9",
                color: "#64748b",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                mb: 2,
              }}
            >
              <RocketLaunchRoundedIcon />
            </Box>

            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: "#334155",
              }}
            >
              No rollouts found
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              Create a rollout to control
              feature distribution.
            </Typography>

          </Box>

        ) : (

          <Stack>

            {filteredRollouts.map(
              (
                rollout,
                index
              ) => {

                const feature =
                  getFeature(
                    rollout.feature_flag_id
                  );

                const environment =
                  getEnvironment(
                    rollout.environment_id
                  );

                const isLoading =
                  actionLoading ===
                  rollout.id;

                return (

                  <Box
                    key={rollout.id}
                    sx={{
                      p: {
                        xs: 2,
                        md: 2.5,
                      },
                      borderBottom:
                        index <
                        filteredRollouts.length -
                          1
                          ? "1px solid #e2e8f0"
                          : "none",
                      transition:
                        "background-color 0.15s ease",
                      "&:hover": {
                        backgroundColor:
                          "#f8fafc",
                      },
                    }}
                  >

                    <Stack
                      direction={{
                        xs: "column",
                        md: "row",
                      }}
                      spacing={2}
                      alignItems={{
                        xs: "flex-start",
                        md: "center",
                      }}
                    >

                      {/* ICON */}

                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius:
                            2.5,
                          backgroundColor:
                            "#f1f5f9",
                          color:
                            "#334155",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          flexShrink: 0,
                        }}
                      >
                        <RocketLaunchRoundedIcon />
                      </Box>


                      {/* DETAILS */}

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                        >

                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 750,
                              color: "#0f172a",
                            }}
                          >
                            {feature?.name ||
                              `Feature #${rollout.feature_flag_id}`}
                          </Typography>

                          <Chip
                            label={
                              rollout.enabled
                                ? "Enabled"
                                : "Disabled"
                            }
                            size="small"
                            sx={{
                              height: 23,
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor:
                                rollout.enabled
                                  ? "#ecfdf5"
                                  : "#f1f5f9",
                              color:
                                rollout.enabled
                                  ? "#047857"
                                  : "#64748b",
                              border:
                                rollout.enabled
                                  ? "1px solid #a7f3d0"
                                  : "1px solid #e2e8f0",
                            }}
                          />

                        </Stack>


                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={{
                            xs: 0.5,
                            sm: 2,
                          }}
                          sx={{
                            mt: 0.5,
                          }}
                        >

                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#64748b",
                            }}
                          >
                            {feature?.key ||
                              "Unknown feature"}
                          </Typography>

                          <Typography
                            sx={{
                              display: {
                                xs: "none",
                                sm: "block",
                              },
                              color:
                                "#cbd5e1",
                            }}
                          >
                            •
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#64748b",
                              fontWeight: 650,
                            }}
                          >
                            {environment?.name ||
                              `Environment #${rollout.environment_id}`}
                          </Typography>

                        </Stack>


                        {/* ROLLOUT INFO */}

                        <Stack
                          direction="row"
                          spacing={2}
                          flexWrap="wrap"
                          sx={{
                            mt: 1.2,
                          }}
                        >

                          <InfoItem
                            icon={
                              <PercentRoundedIcon />
                            }
                            label="Rollout"
                            value={`${rollout.percentage}%`}
                          />

                          <InfoItem
                            icon={
                              <ScheduleRoundedIcon />
                            }
                            label="Schedule"
                            value={
                              rollout.scheduled_start
                                ? formatDisplayDate(
                                    rollout.scheduled_start
                                  )
                                : "Immediate"
                            }
                          />

                          <InfoItem
                            icon={
                              <RocketLaunchRoundedIcon />
                            }
                            label="Priority"
                            value={`P${rollout.priority}`}
                          />

                        </Stack>


                        {rollout.notes && (
                          <Typography
                            sx={{
                              mt: 1,
                              fontSize: 11,
                              color: "#94a3b8",
                              fontStyle:
                                "italic",
                            }}
                          >
                            {rollout.notes}
                          </Typography>
                        )}

                      </Box>


                      {/* ACTIONS */}

                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                      >

                        <Tooltip
                          title={
                            rollout.enabled
                              ? "Disable"
                              : "Enable"
                          }
                        >
                          <span>

                            <IconButton
                              onClick={() =>
                                handleToggle(
                                  rollout
                                )
                              }
                              disabled={
                                isLoading
                              }
                              sx={{
                                color:
                                  rollout.enabled
                                    ? "#64748b"
                                    : "#047857",
                                "&:hover":
                                  {
                                    backgroundColor:
                                      "#f1f5f9",
                                  },
                              }}
                            >
                              {isLoading ? (
                                <CircularProgress
                                  size={18}
                                />
                              ) : rollout.enabled ? (
                                <ToggleOffRoundedIcon
                                  sx={{
                                    fontSize:
                                      21,
                                  }}
                                />
                              ) : (
                                <ToggleOnRoundedIcon
                                  sx={{
                                    fontSize:
                                      21,
                                  }}
                                />
                              )}
                            </IconButton>

                          </span>
                        </Tooltip>


                        <Tooltip title="Edit">

                          <IconButton
                            onClick={() =>
                              handleEdit(
                                rollout
                              )
                            }
                            disabled={
                              isLoading
                            }
                            sx={{
                              color:
                                "#64748b",
                              "&:hover":
                                {
                                  backgroundColor:
                                    "#f1f5f9",
                                  color:
                                    "#0f172a",
                                },
                            }}
                          >
                            <EditOutlinedIcon
                              sx={{
                                fontSize:
                                  19,
                              }}
                            />
                          </IconButton>

                        </Tooltip>


                        <Tooltip title="Delete">

                          <IconButton
                            onClick={() =>
                              setDeleteTarget(
                                rollout
                              )
                            }
                            disabled={
                              isLoading
                            }
                            sx={{
                              color:
                                "#94a3b8",
                              "&:hover":
                                {
                                  backgroundColor:
                                    "#fef2f2",
                                  color:
                                    "#dc2626",
                                },
                            }}
                          >
                            <DeleteOutlineRoundedIcon
                              sx={{
                                fontSize:
                                  19,
                              }}
                            />
                          </IconButton>

                        </Tooltip>

                      </Stack>

                    </Stack>

                  </Box>

                );

              }
            )}

          </Stack>

        )}

      </Paper>


      {/* =====================================================
          CREATE / EDIT DIALOG
      ====================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {editingRollout
            ? "Edit Rollout"
            : "Create Rollout"}
        </DialogTitle>


        <DialogContent>

          <Stack
            spacing={2.2}
            sx={{
              pt: 1,
            }}
          >

            {/* FEATURE */}

            <TextField
              select
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
              fullWidth
              disabled={
                Boolean(
                  editingRollout
                )
              }
            >

              {features.map(
                (feature) => (
                  <MenuItem
                    key={feature.id}
                    value={
                      feature.id
                    }
                  >
                    {feature.name} (
                    {feature.key})
                  </MenuItem>
                )
              )}

            </TextField>


            {/* ENVIRONMENT */}

            <TextField
              select
              label="Environment"
              value={
                form.environment_id
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  environment_id:
                    event.target.value,
                })
              }
              fullWidth
              disabled={
                Boolean(
                  editingRollout
                )
              }
            >

              {environments.map(
                (environment) => (
                  <MenuItem
                    key={environment.id}
                    value={
                      environment.id
                    }
                  >
                    {environment.name}
                  </MenuItem>
                )
              )}

            </TextField>


            {/* PERCENTAGE */}

            <TextField
              label="Rollout Percentage"
              type="number"
              value={
                form.percentage
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  percentage:
                    event.target.value,
                })
              }
              fullWidth
              inputProps={{
                min: 0,
                max: 100,
                step: 1,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    %
                  </InputAdornment>
                ),
              }}
            />


            {/* PRIORITY */}

            <TextField
              label="Priority"
              type="number"
              value={
                form.priority
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  priority:
                    event.target.value,
                })
              }
              fullWidth
              inputProps={{
                min: 1,
                step: 1,
              }}
            />


            {/* ENABLED */}

            <Box
              sx={{
                border:
                  "1px solid #e2e8f0",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
              }}
            >

              <Box>

                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      "#334155",
                  }}
                >
                  Enable Rollout
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,
                    fontSize: 11,
                    color:
                      "#94a3b8",
                  }}
                >
                  Activate this rollout
                  immediately.
                </Typography>

              </Box>


              <Button
                variant={
                  form.enabled
                    ? "contained"
                    : "outlined"
                }
                onClick={() =>
                  setForm({
                    ...form,
                    enabled:
                      !form.enabled,
                  })
                }
                sx={{
                  minWidth: 100,
                  textTransform:
                    "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  boxShadow: "none",
                }}
              >
                {form.enabled
                  ? "Enabled"
                  : "Disabled"}
              </Button>

            </Box>


            <Divider />


            {/* SCHEDULE */}

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 750,
                color: "#334155",
              }}
            >
              Schedule
            </Typography>


            <TextField
              label="Scheduled Start"
              type="datetime-local"
              value={
                form.scheduled_start
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  scheduled_start:
                    event.target.value,
                })
              }
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />


            <TextField
              label="Scheduled End"
              type="datetime-local"
              value={
                form.scheduled_end
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  scheduled_end:
                    event.target.value,
                })
              }
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />


            {/* NOTES */}

            <TextField
              label="Notes"
              placeholder="Optional rollout notes"
              value={
                form.notes
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  notes:
                    event.target.value,
                })
              }
              fullWidth
              multiline
              minRows={3}
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
            onClick={
              handleCloseDialog
            }
            disabled={saving}
            sx={{
              textTransform:
                "none",
              color: "#64748b",
              fontWeight: 650,
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={
              handleSave
            }
            disabled={
              saving ||
              !form.feature_flag_id ||
              !form.environment_id
            }
            sx={{
              textTransform:
                "none",
              fontWeight: 700,
              backgroundColor:
                "#0f172a",
              boxShadow: "none",
              "&:hover": {
                backgroundColor:
                  "#1e293b",
                boxShadow: "none",
              },
            }}
          >
            {saving ? (
              <CircularProgress
                size={20}
                sx={{
                  color:
                    "#ffffff",
                }}
              />
            ) : editingRollout ? (
              "Save Changes"
            ) : (
              "Create Rollout"
            )}
          </Button>

        </DialogActions>

      </Dialog>


      {/* =====================================================
          DELETE DIALOG
      ====================================================== */}

      <Dialog
        open={Boolean(
          deleteTarget
        )}
        onClose={() =>
          actionLoading === null &&
          setDeleteTarget(null)
        }
        maxWidth="xs"
        fullWidth
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          Delete Rollout?
        </DialogTitle>


        <DialogContent>

          <Typography
            sx={{
              fontSize: 14,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Are you sure you want to
            delete this rollout?
            This action cannot be undone.
          </Typography>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >

          <Button
            onClick={() =>
              setDeleteTarget(null)
            }
            disabled={
              actionLoading !== null
            }
            sx={{
              textTransform:
                "none",
              color: "#64748b",
              fontWeight: 650,
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={
              handleDelete
            }
            disabled={
              actionLoading !== null
            }
            sx={{
              textTransform:
                "none",
              fontWeight: 700,
              backgroundColor:
                "#dc2626",
              boxShadow: "none",
              "&:hover": {
                backgroundColor:
                  "#b91c1c",
                boxShadow: "none",
              },
            }}
          >
            {actionLoading !== null ? (
              <CircularProgress
                size={20}
                sx={{
                  color:
                    "#ffffff",
                }}
              />
            ) : (
              "Delete"
            )}
          </Button>

        </DialogActions>

      </Dialog>


      {/* =====================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        open={
          snackbar.open
        }
        autoHideDuration={
          3500
        }
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
          severity={
            snackbar.severity
          }
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
            })
          }
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}


function StatCard({
  icon,
  label,
  value,
  description,
}: StatCardProps) {

  return (
    <Paper
      elevation={0}
      sx={{
        border:
          "1px solid #e2e8f0",
        borderRadius: 3,
        p: 2.2,
        backgroundColor:
          "#ffffff",
      }}
    >

      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
      >

        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            backgroundColor:
              "#f1f5f9",
            color: "#334155",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>


        <Box>

          <Typography
            sx={{
              fontSize: 11,
              color: "#64748b",
              fontWeight: 700,
              textTransform:
                "uppercase",
              letterSpacing:
                "0.04em",
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              fontSize: 25,
              lineHeight: 1.1,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: 10,
              color: "#94a3b8",
            }}
          >
            {description}
          </Typography>

        </Box>

      </Stack>

    </Paper>
  );
}


/* ============================================================
   INFO ITEM
============================================================ */

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}


function InfoItem({
  icon,
  label,
  value,
}: InfoItemProps) {

  return (
    <Stack
      direction="row"
      spacing={0.6}
      alignItems="center"
    >

      <Box
        sx={{
          display: "flex",
          color: "#94a3b8",
          "& svg": {
            fontSize: 15,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 10,
          color: "#94a3b8",
        }}
      >
        {label}:
      </Typography>

      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: "#475569",
        }}
      >
        {value}
      </Typography>

    </Stack>
  );
}


/* ============================================================
   DATE HELPERS
============================================================ */

function formatDateTimeLocal(
  value: string | null
): string {

  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (Number.isNaN(
    date.getTime()
  )) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  const hours =
    String(
      date.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      date.getMinutes()
    ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


function formatDisplayDate(
  value: string
): string {

  const date =
    new Date(value);

  if (Number.isNaN(
    date.getTime()
  )) {
    return "Scheduled";
  }

  return date.toLocaleString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}
