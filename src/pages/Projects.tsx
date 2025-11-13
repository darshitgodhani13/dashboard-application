import React, { useMemo, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Drawer,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import type { Project } from "../types";
import { v4 as uuidv4 } from "uuid";
import { useLocalState } from "../hooks/useLocalState";
import ConfirmDialog from "../components/ConfirmDialog";
import EditableCell from "../components/EditableCell";

const statusColors = {
  active: "success",
  paused: "warning",
  completed: "default",
} as const;

const Projects: React.FC = () => {
  const [projects, setProjects] = useLocalState<Project[]>("md_projects", []);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Project["status"]>("active");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Project["status"] | "all">(
    "all"
  );

  const createProject = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      alert("Please provide a project name");
      return;
    }

    const newProject: Project = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      status,
      createdAt: new Date().toISOString(),
    };

    setProjects([newProject, ...projects]);
    setName("");
    setDescription("");
    setStatus("active");
  };

  const openEdit = (p: Project) => {
    setSelectedProject({ ...p });
    setDrawerOpen(true);
  };

  const saveProject = (p: Project) => {
    setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (toDeleteId) {
      setProjects((prev) => prev.filter((p) => p.id !== toDeleteId));
    }
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (filterStatus !== "all") {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [projects, filterStatus]);

  const statusCounts = useMemo(() => {
    return {
      all: projects.length,
      active: projects.filter((p) => p.status === "active").length,
      paused: projects.filter((p) => p.status === "paused").length,
      completed: projects.filter((p) => p.status === "completed").length,
    };
  }, [projects]);

  return (
    <div>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Project Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Statistics
              </Typography>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box>
                  <Typography variant="h4" color="primary">
                    {statusCounts.all}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Projects
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {statusCounts.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {statusCounts.paused}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paused
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="text.secondary">
                    {statusCounts.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Project
        </Typography>
        <Box
          component="form"
          onSubmit={createProject}
          sx={{ display: "grid", gap: 3 }}
        >
          <TextField
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter project name..."
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            placeholder="Describe the project..."
          />
          <FormControl sx={{ width: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as Project["status"])}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ width: "fit-content" }}
          >
            Create Project
          </Button>
        </Box>
      </Paper>

      {projects.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No projects yet. Create your first project using the form above.
        </Alert>
      )}

      {projects.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6">Project List</Typography>
            <TextField
              select
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as Project["status"] | "all")
              }
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Projects</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={200}>Project Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell width={120}>Status</TableCell>
                <TableCell width={150}>Created</TableCell>
                <TableCell width={120} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredProjects.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <EditableCell
                      value={p.name}
                      onSave={(val) =>
                        setProjects((prev) =>
                          prev.map((x) =>
                            x.id === p.id ? { ...x, name: val } : x
                          )
                        )
                      }
                      placeholder="Project name"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={p.description || ""}
                      onSave={(val) =>
                        setProjects((prev) =>
                          prev.map((x) =>
                            x.id === p.id ? { ...x, description: val } : x
                          )
                        )
                      }
                      placeholder="Project description"
                      multiline
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      color={statusColors[p.status]}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(p.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => openEdit(p)}
                      title="Edit project"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(p.id)}
                      color="error"
                      title="Delete project"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filteredProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {filterStatus === "all"
                        ? "No projects created yet"
                        : `No ${filterStatus} projects found`}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Edit drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Edit Project
          </Typography>
          {selectedProject && (
            <Box component="form" sx={{ display: "grid", gap: 3, mt: 2 }}>
              <TextField
                label="Project Name"
                value={selectedProject.name}
                onChange={(e) =>
                  setSelectedProject((s) =>
                    s ? { ...s, name: e.target.value } : s
                  )
                }
                fullWidth
              />
              <TextField
                label="Description"
                value={selectedProject.description || ""}
                onChange={(e) =>
                  setSelectedProject((s) =>
                    s ? { ...s, description: e.target.value } : s
                  )
                }
                multiline
                rows={4}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedProject.status}
                  onChange={(e) =>
                    setSelectedProject((s) =>
                      s
                        ? { ...s, status: e.target.value as Project["status"] }
                        : s
                    )
                  }
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (selectedProject) saveProject(selectedProject);
                  }}
                >
                  Save Changes
                </Button>
                <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Projects;
