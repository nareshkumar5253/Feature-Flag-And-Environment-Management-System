
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
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";

import api from "../../services/api";
import type { Environment } from "../../types";


interface EnvironmentForm {
  name: string;
  description: string;
}


const initialForm: EnvironmentForm = {
  name: "",
  description: "",
};


export default function Environments() {

  const [environments, setEnvironments] =
    useState<Environment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingEnvironment, setEditingEnvironment] =
    useState<Environment | null>(null);

  const [form, setForm] =
    useState<EnvironmentForm>(initialForm);

  const [saving, setSaving] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Environment | null>(null);

  const [snackbar, setSnackbar] =
    useState({
      open: false,
      message: "",
      severity: "success" as "success" | "error",
    });


  /* =========================================================
     LOAD ENVIRONMENTS
  ========================================================= */

  const loadEnvironments = async () => {

    try {

      setLoading(true);

      const response =
        await api.get<Environment[]>(
          "/environments"
        );

      setEnvironments(response.data);

    } catch (error: any) {

      setSnackbar({
        open: true,
        message:
          error.response?.data?.detail ||
          "Failed to load environments.",
        severity: "error",
      });

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    loadEnvironments();
  }, []);


  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredEnvironments =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return environments;
      }

      return environments.filter(
        (environment) =>
          environment.name
            .toLowerCase()
            .includes(query) ||
          environment.description
            ?.toLowerCase()
            .includes(query)
      );

    }, [environments, search]);


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalEnvironments =
    environments.length;

  const activeEnvironments =
    environments.filter(
      (environment) =>
        environment.is_active
    ).length;

  const inactiveEnvironments =
    totalEnvironments -
    activeEnvironments;


  /* =========================================================
     OPEN CREATE
  ========================================================= */

  const handleCreate = () => {

    setEditingEnvironment(null);

    setForm(initialForm);

    setDialogOpen(true);

  };


  /* =========================================================
     OPEN EDIT
  ========================================================= */

  const handleEdit = (
    environment: Environment
  ) => {

    setEditingEnvironment(environment);

    setForm({
      name: environment.name,
      description:
        environment.description || "",
    });

    setDialogOpen(true);

  };


  /* =========================================================
     CLOSE DIALOG
  ========================================================= */

  const handleCloseDialog = () => {

    if (saving) {
      return;
    }

    setDialogOpen(false);

    setEditingEnvironment(null);

    setForm(initialForm);

  };


  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {

    if (!form.name.trim()) {

      setSnackbar({
        open: true,
        message: "Environment name is required.",
        severity: "error",
      });

      return;
    }


    try {

      setSaving(true);


      if (editingEnvironment) {

        await api.put(
          `/environments/${editingEnvironment.id}`,
          {
            name: form.name.trim(),
            description:
              form.description.trim() ||
              null,
          }
        );

        setSnackbar({
          open: true,
          message:
            "Environment updated successfully.",
          severity: "success",
        });

      } else {

        await api.post(
          "/environments",
          {
            name: form.name.trim(),
            description:
              form.description.trim() ||
              null,
            is_active: true,
          }
        );

        setSnackbar({
          open: true,
          message:
            "Environment created successfully.",
          severity: "success",
        });

      }


      handleCloseDialog();

      await loadEnvironments();

    } catch (error: any) {

      setSnackbar({
        open: true,
        message:
          error.response?.data?.detail ||
          "Failed to save environment.",
        severity: "error",
      });

    } finally {

      setSaving(false);

    }

  };


  /* =========================================================
     ACTIVATE / DEACTIVATE
  ========================================================= */

  const handleToggle = async (
    environment: Environment
  ) => {

    try {

      setActionLoading(environment.id);


      if (environment.is_active) {

        await api.patch(
          `/environments/${environment.id}/deactivate`
        );

        setSnackbar({
          open: true,
          message:
            `${environment.name} deactivated.`,
          severity: "success",
        });

      } else {

        await api.patch(
          `/environments/${environment.id}/activate`
        );

        setSnackbar({
          open: true,
          message:
            `${environment.name} activated.`,
          severity: "success",
        });

      }


      await loadEnvironments();

    } catch (error: any) {

      setSnackbar({
        open: true,
        message:
          error.response?.data?.detail ||
          "Failed to update environment status.",
        severity: "error",
      });

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

      setActionLoading(deleteTarget.id);


      await api.delete(
        `/environments/${deleteTarget.id}`
      );


      setSnackbar({
        open: true,
        message:
          `${deleteTarget.name} deleted successfully.`,
        severity: "success",
      });


      setDeleteTarget(null);

      await loadEnvironments();

    } catch (error: any) {

      setSnackbar({
        open: true,
        message:
          error.response?.data?.detail ||
          "Failed to delete environment.",
        severity: "error",
      });

    } finally {

      setActionLoading(null);

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

      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          justifyContent: "space-between",
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
              letterSpacing: "-0.02em",
            }}
          >
            Environments
          </Typography>

          <Typography
            sx={{
              mt: 0.6,
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Manage application environments and
            deployment states.
          </Typography>

        </Box>


        <Stack
          direction="row"
          spacing={1}
        >

          <Tooltip title="Refresh">

            <IconButton
              onClick={loadEnvironments}
              disabled={loading}
              sx={{
                border:
                  "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                borderRadius: 2,
                width: 40,
                height: 40,
              }}
            >
              <RefreshRoundedIcon
                sx={{ fontSize: 20 }}
              />
            </IconButton>

          </Tooltip>


          <Button
            variant="contained"
            startIcon={
              <AddRoundedIcon />
            }
            onClick={handleCreate}
            sx={{
              height: 40,
              px: 2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              backgroundColor: "#0f172a",
              "&:hover": {
                backgroundColor: "#1e293b",
                boxShadow: "none",
              },
            }}
          >
            Create Environment
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
            <CloudRoundedIcon />
          }
          label="Total Environments"
          value={totalEnvironments}
          description="Configured environments"
        />

        <StatCard
          icon={
            <PowerSettingsNewRoundedIcon />
          }
          label="Active"
          value={activeEnvironments}
          description="Currently active"
        />

        <StatCard
          icon={
            <StorageRoundedIcon />
          }
          label="Inactive"
          value={inactiveEnvironments}
          description="Currently inactive"
        />

      </Box>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          border:
            "1px solid #e2e8f0",
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >

        {/* SEARCH BAR */}

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
            placeholder="Search environments..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
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
            sx={{
              maxWidth: 500,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

        </Box>


        {/* LOADING */}

        {loading ? (

          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              size={30}
            />
          </Box>

        ) : filteredEnvironments.length === 0 ? (

          /* EMPTY STATE */

          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              px: 3,
            }}
          >

            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                backgroundColor: "#f1f5f9",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <CloudRoundedIcon />
            </Box>

            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: "#334155",
              }}
            >
              No environments found
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              Create an environment to get started.
            </Typography>

          </Box>

        ) : (

          /* ENVIRONMENT LIST */

          <Stack>

            {filteredEnvironments.map(
              (environment, index) => {

                const isActionLoading =
                  actionLoading ===
                  environment.id;

                return (
                  <Box
                    key={environment.id}
                    sx={{
                      p: {
                        xs: 2,
                        md: 2.5,
                      },
                      borderBottom:
                        index <
                        filteredEnvironments.length - 1
                          ? "1px solid #e2e8f0"
                          : "none",
                      transition:
                        "background-color 0.15s ease",
                      "&:hover": {
                        backgroundColor: "#f8fafc",
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
                          width: 46,
                          height: 46,
                          borderRadius: 2.5,
                          backgroundColor:
                            environment.is_active
                              ? "#f1f5f9"
                              : "#f8fafc",
                          color:
                            environment.is_active
                              ? "#334155"
                              : "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CloudRoundedIcon />
                      </Box>


                      {/* INFORMATION */}

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
                            {environment.name}
                          </Typography>

                          <Chip
                            label={
                              environment.is_active
                                ? "Active"
                                : "Inactive"
                            }
                            size="small"
                            sx={{
                              height: 23,
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor:
                                environment.is_active
                                  ? "#ecfdf5"
                                  : "#f1f5f9",
                              color:
                                environment.is_active
                                  ? "#047857"
                                  : "#64748b",
                              border:
                                environment.is_active
                                  ? "1px solid #a7f3d0"
                                  : "1px solid #e2e8f0",
                            }}
                          />

                        </Stack>


                        <Typography
                          sx={{
                            mt: 0.4,
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          {environment.description ||
                            "No description provided."}
                        </Typography>


                        <Typography
                          sx={{
                            mt: 0.7,
                            fontSize: 10,
                            color: "#94a3b8",
                          }}
                        >
                          Environment ID:{" "}
                          {environment.id}
                        </Typography>

                      </Box>


                      {/* ACTIONS */}

                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                      >

                        <Tooltip
                          title={
                            environment.is_active
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          <span>
                            <IconButton
                              onClick={() =>
                                handleToggle(
                                  environment
                                )
                              }
                              disabled={
                                isActionLoading
                              }
                              sx={{
                                color:
                                  environment.is_active
                                    ? "#64748b"
                                    : "#047857",
                                "&:hover": {
                                  backgroundColor:
                                    "#f1f5f9",
                                },
                              }}
                            >
                              {isActionLoading ? (
                                <CircularProgress
                                  size={18}
                                />
                              ) : (
                                <PowerSettingsNewRoundedIcon
                                  sx={{
                                    fontSize: 19,
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
                                environment
                              )
                            }
                            disabled={
                              isActionLoading
                            }
                            sx={{
                              color: "#64748b",
                              "&:hover": {
                                backgroundColor:
                                  "#f1f5f9",
                                color: "#0f172a",
                              },
                            }}
                          >
                            <EditOutlinedIcon
                              sx={{
                                fontSize: 19,
                              }}
                            />
                          </IconButton>

                        </Tooltip>


                        <Tooltip title="Delete">

                          <IconButton
                            onClick={() =>
                              setDeleteTarget(
                                environment
                              )
                            }
                            disabled={
                              isActionLoading
                            }
                            sx={{
                              color: "#94a3b8",
                              "&:hover": {
                                backgroundColor:
                                  "#fef2f2",
                                color: "#dc2626",
                              },
                            }}
                          >
                            <DeleteOutlineRoundedIcon
                              sx={{
                                fontSize: 19,
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
          {editingEnvironment
            ? "Edit Environment"
            : "Create Environment"}
        </DialogTitle>


        <DialogContent>

          <Stack
            spacing={2.5}
            sx={{ pt: 1 }}
          >

            <TextField
              label="Environment Name"
              placeholder="e.g. DEVELOPMENT"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              fullWidth
              autoFocus
            />


            <TextField
              label="Description"
              placeholder="Describe this environment"
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

          </Stack>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >

          <Button
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{
              textTransform: "none",
              color: "#64748b",
              fontWeight: 650,
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              saving ||
              !form.name.trim()
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: "#0f172a",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#1e293b",
                boxShadow: "none",
              },
            }}
          >
            {saving ? (
              <CircularProgress
                size={20}
                sx={{ color: "#ffffff" }}
              />
            ) : editingEnvironment ? (
              "Save Changes"
            ) : (
              "Create Environment"
            )}
          </Button>

        </DialogActions>

      </Dialog>


      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() =>
          !actionLoading &&
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
          Delete Environment?
        </DialogTitle>


        <DialogContent>

          <Typography
            sx={{
              fontSize: 14,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Are you sure you want to delete{" "}
            <strong>
              {deleteTarget?.name}
            </strong>
            ? This action cannot be undone.
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
              textTransform: "none",
              color: "#64748b",
              fontWeight: 650,
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={
              actionLoading !== null
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: "#dc2626",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#b91c1c",
                boxShadow: "none",
              },
            }}
          >
            {actionLoading !== null ? (
              <CircularProgress
                size={20}
                sx={{ color: "#ffffff" }}
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
        backgroundColor: "#ffffff",
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
            backgroundColor: "#f1f5f9",
            color: "#334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              textTransform: "uppercase",
              letterSpacing: "0.04em",
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
