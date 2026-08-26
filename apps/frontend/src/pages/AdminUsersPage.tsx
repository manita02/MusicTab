import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { theme } from "../theme/theme";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { UserAvatar } from "../components/UserAvatar/UserAvatar";
import { RoleBadge } from "../components/RoleBadge/RoleBadge";
import { MessageModal } from "../components/MessageModal/MessageModal";
import { ManageProfileDialog } from "../dialogs/ManageProfileDialog";
import { useAuth } from "../api/hooks/useAuth";
import { ADMIN_USERS_QUERY_KEY, useAdminUsers, type AdminUser } from "../api/hooks/useAdminUsers";
import { useDeleteUser } from "../api/hooks/useDeleteUser";
import { canManageUsers, normalizeRole } from "../auth/tabPermissions";

export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn, userId, userRole } = useAuth();
  const canManage = canManageUsers(isLoggedIn, normalizeRole(userRole));
  const { data = [], isLoading, isError, error } = useAdminUsers(canManage);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modal, setModal] = useState<{
    open: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({ open: false, type: "warning", title: "", message: "" });

  useEffect(() => {
    if (!canManage) return;
    if (isAxiosError(error) && error.response?.status === 403) {
      navigate("/", { replace: true });
    }
  }, [canManage, error, navigate]);

  const adminCount = useMemo(
    () => data.filter((user) => user.role === "ADMIN").length,
    [data],
  );

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleDeleteClick = (user: AdminUser) => {
    setSelectedUser(user);
    const isSelf = userId != null && user.id === userId;
    setModal({
      open: true,
      type: "warning",
      title: isSelf ? "Delete your account?" : "Delete this user?",
      message: isSelf
        ? `Are you sure you want to delete your account "${user.username}"? This will permanently delete this account, all tabs you published, your PDF view history, login sessions, and Copilot usage. This cannot be undone.`
        : `Are you sure you want to delete "${user.username}"? This will permanently delete this account, all tabs they published, their PDF view history, login sessions, and Copilot usage. This cannot be undone.`,
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    const deletedSelf = userId != null && selectedUser.id === userId;
    deleteUser(selectedUser.id, {
      onSuccess: () => {
        queryClient.setQueryData<AdminUser[]>(ADMIN_USERS_QUERY_KEY, (prev) =>
          (prev ?? []).filter((row) => row.id !== selectedUser.id),
        );
        setModal({
          open: true,
          type: "success",
          title: "Deleted successfully",
          message: deletedSelf
            ? "Your account and its associated data (published tabs, PDF view history, login sessions, and Copilot usage) were deleted."
            : `The account "${selectedUser.username}" and its associated data (published tabs, PDF view history, login sessions, and Copilot usage) were deleted.`,
        });
        setSelectedUser(null);
        if (deletedSelf) {
          localStorage.clear();
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }
      },
      onError: (err) => {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred while deleting the user.";
        setModal({
          open: true,
          type: "error",
          title: "Error deleting",
          message: errorMessage,
        });
      },
    });
  };

  const handleCloseModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  const columns: GridColDef<AdminUser>[] = [
    {
      field: "username",
      headerName: "User",
      flex: 1,
      minWidth: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            width: "100%",
            minWidth: 0,
            height: "100%",
          }}
        >
          <UserAvatar name={params.row.username} src={params.row.urlImg} size={36} />
          <Typography fontWeight={600} noWrap>
            {params.row.username}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "role",
      headerName: "Role",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <RoleBadge role={params.row.role} />
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, width: "100%" }}>
          <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            {params.row.createdAt ? new Date(params.row.createdAt).toLocaleDateString() : "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const isLastAdmin = params.row.role === "ADMIN" && adminCount <= 1;
        const deleteDisabled = isLastAdmin || isDeleting;
        const deleteTooltip = isLastAdmin ? "Cannot delete the last administrator" : "Delete";

        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <Tooltip title="Update" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(params.row)}
                  sx={{
                    color: theme.palette.warning.main,
                    "&:hover": { backgroundColor: "rgba(255,144,19,0.1)" },
                  }}
                >
                  <EditIcon fontSize="medium" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={deleteTooltip} arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => !deleteDisabled && handleDeleteClick(params.row)}
                  disabled={deleteDisabled}
                  sx={{
                    color: deleteDisabled ? theme.palette.action.disabled : theme.palette.error.main,
                    "&:hover": deleteDisabled ? undefined : { backgroundColor: "rgba(255,0,0,0.08)" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ position: "relative", backgroundColor: "transparent", py: { xs: 1, md: 1.5 } }}>
      <IconLoader active={isLoading} />

      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{
          display: "flex",
          justifyContent: "center",
          background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.contrastText} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "2px 2px 6px rgba(0, 0, 0, 0.15)",
          fontSize: { xs: "1.5rem", md: "1.85rem" },
          letterSpacing: "0.5px",
          mb: 1.5,
        }}
      >
        Users
      </Typography>

      {isError && !(isAxiosError(error) && error.response?.status === 403) && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
          <Typography color="error">Error loading users.</Typography>
        </Box>
      )}

      <Box
        sx={{
          height: { xs: 420, md: "min(520px, calc(100dvh - 260px))" },
          minHeight: 360,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          overflow: "auto",
          width: "100%",
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10]}
          getRowHeight={() => "auto"}
          getEstimatedRowHeight={() => 72}
          sx={{
            border: "none",
            minWidth: 720,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.warning.contrastText,
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: theme.palette.background.default,
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "rgba(245,241,220,0.4)",
            },
          }}
        />
      </Box>

      <ManageProfileDialog
        open={editOpen}
        user={selectedUser}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
        }}
      />

      <MessageModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={
          modal.type === "warning" ? (isDeleting ? "Deleting..." : "Yes, delete") : "Accept"
        }
        cancelText={modal.type === "warning" ? "Cancel" : undefined}
        onConfirm={modal.type === "warning" ? handleConfirmDelete : handleCloseModal}
        onCancel={handleCloseModal}
      />
    </Box>
  );
};
