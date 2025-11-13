import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Box,
  LinearProgress,
  Chip,
} from "@mui/material";

import { useEffect, useState } from "react";
import { User } from "../types";
import PeopleIcon from "@mui/icons-material/People";
import FolderIcon from "@mui/icons-material/Folder";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useLocalState } from "../hooks/useLocalState";
import { fetchUsers } from "../services/api";
import { LocalActivity } from "@mui/icons-material";

const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning";
}> = ({ title, value, subtitle, icon, color = "primary" }) => (
  <Card
    sx={{
      height: "100%",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 8,
      },
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography
            variant="h4"
            component="div"
            fontWeight="bold"
            color={`${color}.main`}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            color: `${color}.main`,
            borderRadius: 2,
            p: 1,
            display: "flex",
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[] | null>(null);
  const [projects] = useLocalState("md_projects", [
    {
      id: "proj-1",
      name: "Initial Mock Project",
      description: "This is mock project for demonstration",
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "proj-2",
      name: "Website Redesign",
      description: "Redesign company website",
      status: "paused",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "proj-3",
      name: "Mobile App",
      description: "Develop mobile application",
      status: "completed",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchUsers()
      .then((data) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const completionRate =
    projects.length > 0 ? (completedProjects / projects.length) * 100 : 0;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Overview
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your project management dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={
              users === null ? <CircularProgress size={24} /> : users.length
            }
            subtitle="Registered users"
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={projects.length}
            subtitle="All projects"
            icon={<FolderIcon />}
            color="secondary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={activeProjects}
            subtitle="Currently in progress"
            icon={<LocalActivity />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completion Rate"
            value={`${Math.round(completionRate)}%`}
            subtitle="Projects completed"
            icon={<TrendingUpIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Project Status Distribution
              </Typography>
              <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
                {["active", "paused", "completed"].map((status) => {
                  const count = projects.filter(
                    (p) => p.status === status
                  ).length;
                  const percentage =
                    projects.length > 0 ? (count / projects.length) * 100 : 0;

                  return (
                    <Box key={status}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={status.toUpperCase()}
                            size="small"
                            color={
                              status === "active"
                                ? "success"
                                : status === "paused"
                                ? "warning"
                                : "default"
                            }
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {count} projects
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {Math.round(percentage)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        color={
                          status === "active"
                            ? "success"
                            : status === "paused"
                            ? "warning"
                            : "inherit"
                        }
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                This dashboard uses JSONPlaceholder for user data and
                localStorage for projects. You can manage users and projects
                from the respective sections in the sidebar.
              </Typography>
              <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<PeopleIcon />}
                  label={`${users?.length || 0} Users`}
                  variant="outlined"
                />
                <Chip
                  icon={<FolderIcon />}
                  label={`${projects.length} Projects`}
                  variant="outlined"
                />
                <Chip
                  icon={<FolderIcon />}
                  label={`${activeProjects} Active`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
