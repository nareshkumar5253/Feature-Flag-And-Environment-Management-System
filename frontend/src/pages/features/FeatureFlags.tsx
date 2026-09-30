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
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import api from "../../services/api";
import type { FeatureFlag } from "../../types";


interface FeatureForm {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  default_value: boolean;
}


const initialForm: FeatureForm = {
  key: "",
  name: "",
  description: "",
  enabled: false,
  default_value: false,
};


export default function FeatureFlags() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] =
    useState<FeatureFlag | null>(null);

  const [form, setForm] =
    useState<FeatureForm>(initialForm);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  /* ==========================================================
     LOAD FEATURES
  ========================================================== */

  const loadFeatures = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<FeatureFlag[]>("/feature-flags");

      setFeatures(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load feature flags."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadFeatures();
  }, []);


  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredFeatures = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return features;
    }

    return features.filter(
      (feature) =>
        feature.key.toLowerCase().includes(value) ||
        feature.name.toLowerCase().includes(value) ||
        feature.description
          ?.toLowerCase()
          .includes(value)
    );
  }, [features, search]);


  /* ==========================================================
     STATISTICS
  ========================================================== */

  const enabledCount = features.filter(
    (feature) => feature.enabled
  ).length;

  const disabledCount =
    features.length - enabledCount;


  /* ==========================================================
     OPEN CREATE
  ========================================================== */

  const openCreateDialog = () => {
    setEditingFeature(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setDialogOpen(true);
  };


  /* ==========================================================
     OPEN EDIT
  ========================================================== */

  const openEditDialog = (feature: FeatureFlag) => {
    setEditingFeature(feature);

    setForm({
      key: feature.key,
      name: feature.name,
      description: feature.description || "",
      enabled: feature.enabled,
      default_value: feature.default_value,
    });

    setError("");
    setSuccess("");
    setDialogOpen(true);
  };


  /* ==========================================================
     CLOSE DIALOG
  ========================================================== */

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingFeature(null);
    setForm(initialForm);
  };


  /* ==========================================================
     SAVE FEATURE
  ========================================================== */

  const saveFeature = async () => {
    if (!form.key.trim() && !editingFeature) {
      setError("Feature key is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Feature name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingFeature) {
        await api.put(
          `/feature-flags/${editingFeature.id}`,
          {
            name: form.name,
            description:
              form.description || null,
            enabled: form.enabled,
            default_value:
              form.default_value,
          }
        );

        setSuccess(
          "Feature flag updated successfully."
        );
      } else {
        await api.post("/feature-flags", {
          key: form.key.trim(),
          name: form.name.trim(),
          description:
            form.description.trim() || null,
          enabled: form.enabled,
          default_value:
            form.default_value,
        });

        setSuccess(
          "Feature flag created successfully."
        );
      }

      setDialogOpen(false);
      setForm(initialForm);
      setEditingFeature(null);

      await loadFeatures();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to save feature flag."
      );
    } finally {
      setSaving(false);
    }
  };


  /* ==========================================================
     ENABLE / DISABLE
  ========================================================== */

  const toggleFeature = async (
    feature: FeatureFlag
  ) => {
    try {
      setError("");

      if (feature.enabled) {
        await api.patch(
          `/feature-flags/${feature.id}/disable`
        );
      } else {
        await api.patch(
          `/feature-flags/${feature.id}/enable`
        );
      }

      setSuccess(
        feature.enabled
          ? "Feature disabled successfully."
          : "Feature enabled successfully."
      );

      await loadFeatures();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to change feature status."
      );
    }
  };


  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteFeature = async (
    feature: FeatureFlag
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${feature.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/feature-flags/${feature.id}`
      );

      setSuccess(
        "Feature flag deleted successfully."
      );

      await loadFeatures();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to delete feature flag."
      );
    }
  };


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >

      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          gap: 2,
          flexDirection: {
            xs: "column",
            md: "row",
          },
          mb: 3,
        }}
      >

        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                backgroundColor: "#e0f2fe",
                color: "#0369a1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlagRoundedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Feature Flags
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "#64748b",
                  mt: 0.3,
                }}
              >
                Manage application features and
                release controls.
              </Typography>
            </Box>
          </Stack>
        </Box>


        <Stack
          direction="row"
          spacing={1}
        >

          <Tooltip title="Refresh">

            <IconButton
              onClick={loadFeatures}
              disabled={loading}
              sx={{
                border:
                  "1px solid #e2e8f0",
                borderRadius: 2,
                backgroundColor: "#ffffff",
              }}
            >
              <RefreshRoundedIcon />
            </IconButton>

          </Tooltip>


          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreateDialog}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2,
              boxShadow: "none",
            }}
          >
            Create Feature
          </Button>

        </Stack>

      </Box>


      {/* ALERTS */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}


      {/* STAT CARDS */}

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
          title="Total Features"
          value={features.length}
          icon={<FlagRoundedIcon />}
          description="Configured feature flags"
        />

        <StatCard
          title="Enabled"
          value={enabledCount}
          icon={<PowerSettingsNewRoundedIcon />}
          description="Currently active"
        />

        <StatCard
          title="Disabled"
          value={disabledCount}
          icon={<PowerSettingsNewRoundedIcon />}
          description="Currently inactive"
        />

      </Box>


      {/* MAIN CARD */}

      <Box
        sx={{
          backgroundColor: "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >

        {/* SEARCH BAR */}

        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >

          <TextField
            size="small"
            placeholder="Search feature flags..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            sx={{
              width: {
                xs: "100%",
                sm: 350,
              },

              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{
                      color: "#94a3b8",
                      fontSize: 20,
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <Typography
            sx={{
              fontSize: 12,
              color: "#64748b",
            }}
          >
            {filteredFeatures.length} feature
            {filteredFeatures.length !== 1
              ? "s"
              : ""}
          </Typography>

        </Box>


        <Divider />


        {/* LOADING */}

        {loading ? (
          <Box
            sx={{
              py: 8,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={30} />
          </Box>
        ) : filteredFeatures.length === 0 ? (

          /* EMPTY */

          <Box
            sx={{
              py: 9,
              px: 3,
              textAlign: "center",
            }}
          >

            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <FlagRoundedIcon />
            </Box>

            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: "#334155",
              }}
            >
              No feature flags found
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: "#94a3b8",
                mt: 0.5,
              }}
            >
              Create your first feature flag to
              get started.
            </Typography>

          </Box>

        ) : (

          /* FEATURE LIST */

          <Box>

            {filteredFeatures.map(
              (feature, index) => (

                <Box
                  key={feature.id}
                  sx={{
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexDirection: {
                      xs: "column",
                      md: "row",
                    },
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                    },
                    borderBottom:
                      index !==
                      filteredFeatures.length - 1
                        ? "1px solid #f1f5f9"
                        : "none",
                  }}
                >

                  {/* ICON */}

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      backgroundColor:
                        feature.enabled
                          ? "#dcfce7"
                          : "#f1f5f9",
                      color:
                        feature.enabled
                          ? "#16a34a"
                          : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FlagRoundedIcon
                      sx={{
                        fontSize: 21,
                      }}
                    />
                  </Box>


                  {/* INFORMATION */}

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      width: {
                        xs: "100%",
                        md: "auto",
                      },
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
                        {feature.name}
                      </Typography>

                      <Chip
                        label={
                          feature.enabled
                            ? "Enabled"
                            : "Disabled"
                        }
                        size="small"
                        sx={{
                          height: 23,
                          fontSize: 10,
                          fontWeight: 700,
                          backgroundColor:
                            feature.enabled
                              ? "#dcfce7"
                              : "#f1f5f9",
                          color:
                            feature.enabled
                              ? "#15803d"
                              : "#64748b",
                        }}
                      />

                    </Stack>


                    <Typography
                      sx={{
                        fontSize: 11,
                        fontFamily:
                          "monospace",
                        color: "#64748b",
                        mt: 0.5,
                      }}
                    >
                      {feature.key}
                    </Typography>


                    {feature.description && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#64748b",
                          mt: 0.7,
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {feature.description}
                      </Typography>
                    )}

                  </Box>


                  {/* DEFAULT VALUE */}

                  <Box
                    sx={{
                      minWidth: 110,
                      display: {
                        xs: "none",
                        lg: "block",
                      },
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "#94a3b8",
                        textTransform:
                          "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      Default
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 650,
                        color: "#334155",
                        mt: 0.4,
                      }}
                    >
                      {feature.default_value
                        ? "Enabled"
                        : "Disabled"}
                    </Typography>

                  </Box>


                  {/* ACTIONS */}

                  <Stack
                    direction="row"
                    spacing={0.5}
                  >

                    <Tooltip
                      title={
                        feature.enabled
                          ? "Disable"
                          : "Enable"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          toggleFeature(feature)
                        }
                        sx={{
                          color:
                            feature.enabled
                              ? "#dc2626"
                              : "#16a34a",
                          "&:hover": {
                            backgroundColor:
                              feature.enabled
                                ? "#fee2e2"
                                : "#dcfce7",
                          },
                        }}
                      >
                        <PowerSettingsNewRoundedIcon
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      </IconButton>
                    </Tooltip>


                    <Tooltip title="Edit">

                      <IconButton
                        size="small"
                        onClick={() =>
                          openEditDialog(
                            feature
                          )
                        }
                        sx={{
                          color: "#475569",
                          "&:hover": {
                            backgroundColor:
                              "#f1f5f9",
                          },
                        }}
                      >
                        <EditRoundedIcon
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      </IconButton>

                    </Tooltip>


                    <Tooltip title="Delete">

                      <IconButton
                        size="small"
                        onClick={() =>
                          deleteFeature(
                            feature
                          )
                        }
                        sx={{
                          color: "#dc2626",
                          "&:hover": {
                            backgroundColor:
                              "#fee2e2",
                          },
                        }}
                      >
                        <DeleteRoundedIcon
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      </IconButton>

                    </Tooltip>

                  </Stack>

                </Box>

              )
            )}

          </Box>

        )}

      </Box>


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
            fontWeight: 800,
            color: "#0f172a",
            pb: 1,
          }}
        >

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >

            <Box>

              {editingFeature
                ? "Edit Feature Flag"
                : "Create Feature Flag"}

              <Typography
                sx={{
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 400,
                  mt: 0.5,
                }}
              >
                {editingFeature
                  ? "Update feature configuration."
                  : "Create a new feature control."}
              </Typography>

            </Box>


            <IconButton
              onClick={closeDialog}
              disabled={saving}
            >
              <CloseRoundedIcon />
            </IconButton>

          </Stack>

        </DialogTitle>


        <DialogContent
          dividers
          sx={{
            backgroundColor: "#f8fafc",
          }}
        >

          <Stack spacing={2.2}>

            {!editingFeature && (
              <TextField
                label="Feature Key"
                placeholder="new_dashboard"
                value={form.key}
                onChange={(event) =>
                  setForm({
                    ...form,
                    key: event.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "_"),
                  })
                }
                fullWidth
                required
                helperText="Use lowercase letters, numbers, dots, hyphens or underscores."
              />
            )}


            <TextField
              label="Feature Name"
              placeholder="New Dashboard V2"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              fullWidth
              required
            />


            <TextField
              label="Description"
              placeholder="Describe what this feature controls..."
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              fullWidth
              multiline
              minRows={3}
            />


            <Box
              sx={{
                backgroundColor: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: 2,
                p: 2,
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
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    Feature Status
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#94a3b8",
                      mt: 0.3,
                    }}
                  >
                    Controls whether the
                    feature is globally enabled.
                  </Typography>

                </Box>

                <Button
                  variant={
                    form.enabled
                      ? "contained"
                      : "outlined"
                  }
                  color={
                    form.enabled
                      ? "success"
                      : "inherit"
                  }
                  onClick={() =>
                    setForm({
                      ...form,
                      enabled: !form.enabled,
                    })
                  }
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  {form.enabled
                    ? "Enabled"
                    : "Disabled"}
                </Button>

              </Stack>

            </Box>


            <Box
              sx={{
                backgroundColor: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: 2,
                p: 2,
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
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    Default Value
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#94a3b8",
                      mt: 0.3,
                    }}
                  >
                    Used when no rollout or
                    user assignment applies.
                  </Typography>

                </Box>

                <Button
                  variant={
                    form.default_value
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() =>
                    setForm({
                      ...form,
                      default_value:
                        !form.default_value,
                    })
                  }
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  {form.default_value
                    ? "Enabled"
                    : "Disabled"}
                </Button>

              </Stack>

            </Box>

          </Stack>

        </DialogContent>


        <DialogActions
          sx={{
            p: 2,
            backgroundColor: "#ffffff",
          }}
        >

          <Button
            onClick={closeDialog}
            disabled={saving}
            sx={{
              textTransform: "none",
              color: "#64748b",
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={saveFeature}
            disabled={saving}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 700,
              minWidth: 120,
              boxShadow: "none",
            }}
          >

            {saving ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : editingFeature ? (
              "Save Changes"
            ) : (
              "Create Feature"
            )}

          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

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
    <Box
      sx={{
        backgroundColor: "#ffffff",
        border:
          "1px solid #e2e8f0",
        borderRadius: 3,
        p: 2.2,
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
              fontSize: 11,
              color: "#64748b",
              fontWeight: 650,
              textTransform:
                "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
              mt: 0.6,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: "#94a3b8",
              mt: 0.3,
            }}
          >
            {description}
          </Typography>

        </Box>


        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            backgroundColor: "#f1f5f9",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            "& svg": {
              fontSize: 20,
            },
          }}
        >
          {icon}
        </Box>

      </Stack>

    </Box>
  );
}