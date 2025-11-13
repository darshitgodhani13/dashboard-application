import React, { useEffect, useMemo, useState } from "react";
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
  TableContainer,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import { User } from "../types";
import EditableCell from "../components/EditableCell";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchUsers } from "../services/api";

type SortField = "name" | "email" | "company";
type SortOrder = "asc" | "desc";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchUsers()
      .then((data) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const f = users.filter(
      (u) =>
        u.name.toLowerCase().includes(filter.toLowerCase()) ||
        u.email.toLowerCase().includes(filter.toLowerCase()) ||
        u.company?.name.toLowerCase().includes(filter.toLowerCase())
    );

    return f.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "company") {
        aValue = a.company?.name || "";
        bValue = b.company?.name || "";
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, filter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const openEditDrawer = (user: User) => {
    setSelectedUser({ ...user });
    setDrawerOpen(true);
  };

  const saveUser = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setDrawerOpen(false);
  };

  const handleDelete = (id: number) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (toDeleteId != null) {
      setUsers((prev) => prev.filter((u) => u.id !== toDeleteId));
      setToDeleteId(null);
    }
    setConfirmOpen(false);
  };

  const SortableHeader: React.FC<{
    field: SortField;
    children: React.ReactNode;
  }> = ({ field, children }) => (
    <TableCell
      sx={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => handleSort(field)}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {children}
        <SortIcon
          fontSize="small"
          sx={{
            transform:
              sortField === field && sortOrder === "desc"
                ? "rotate(180deg)"
                : "none",
            opacity: sortField === field ? 1 : 0.3,
          }}
        />
      </Box>
    </TableCell>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        User Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box display="flex" gap={3}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {users.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="secondary">
                    {filtered.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Filtered Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search users..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <TextField
            select
            label="Sort by"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="company">Company</MenuItem>
          </TextField>
          <TextField
            select
            label="Order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <SortableHeader field="company">Company</SortableHeader>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <EditableCell
                    value={u.name}
                    onSave={(val) =>
                      setUsers((prev) =>
                        prev.map((x) =>
                          x.id === u.id ? { ...x, name: val } : x
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={u.email}
                    onSave={(val) =>
                      setUsers((prev) =>
                        prev.map((x) =>
                          x.id === u.id ? { ...x, email: val } : x
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.company?.name || "-"}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{u.phone || "-"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => openEditDrawer(u)}
                    title="Edit in drawer"
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(u.id)}
                    color="error"
                    title="Delete user"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {filter ? "No users match your search" : "No users found"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Edit User
          </Typography>
          {selectedUser && (
            <Box component="form" sx={{ display: "grid", gap: 3, mt: 2 }}>
              <TextField
                label="Name"
                value={selectedUser.name}
                onChange={(e) =>
                  setSelectedUser((s) =>
                    s ? { ...s, name: e.target.value } : s
                  )
                }
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser((s) =>
                    s ? { ...s, email: e.target.value } : s
                  )
                }
                fullWidth
              />
              <TextField
                label="Company"
                value={selectedUser.company?.name || ""}
                onChange={(e) =>
                  setSelectedUser((s) =>
                    s
                      ? {
                          ...s,
                          company: {
                            ...(s.company ?? { name: "" }),
                            name: e.target.value,
                          },
                        }
                      : s
                  )
                }
                fullWidth
              />
              <TextField
                label="Phone"
                value={selectedUser.phone || ""}
                onChange={(e) =>
                  setSelectedUser((s) =>
                    s ? { ...s, phone: e.target.value } : s
                  )
                }
                fullWidth
              />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (selectedUser) saveUser(selectedUser);
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
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Users;
