import React, { useState } from "react";
import {
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { InputField } from "../components/InputField/InputField";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { theme } from "../theme/theme";
import { Button } from "../components/Button/Button";
import { SelectField } from "../components/SelectField/SelectField";
import { useAuth } from "../api/hooks/useAuth";
import { CreateTabDialog } from "../dialogs/CreateTabDialog";

export const TabsPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "mine">("all");
  const [order, setOrder] = useState("recent");
  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveTab = (data: any) => {
    console.log("🆕 New Tab created:", data);
    handleCloseDialog();
  };

  const handleEdit = (id: number) => console.log("Update:", id);
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this tab?")) {
      console.log("Delete tab:", id);
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={isLoggedIn ? "Update" : "Login to edit"}>
            <span>
              <IconButton
                size="small"
                onClick={() => handleEdit(params.row.id)}
                sx={{
                  color: theme.palette.warning.main,
                  "&:hover": { backgroundColor: "rgba(255,144,19,0.1)" },
                }}
                disabled={!isLoggedIn}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={isLoggedIn ? "Delete" : "Login to delete"}>
            <span>
              <IconButton
                size="small"
                onClick={() => handleDelete(params.row.id)}
                sx={{
                  color: theme.palette.error.main,
                  "&:hover": { backgroundColor: "rgba(255,0,0,0.08)" },
                }}
                disabled={!isLoggedIn}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "tutorial", headerName: "Tutorial", width: 120 },
    { field: "pdf", headerName: "PDF", width: 120 },
    { field: "instrument", headerName: "Instrument", width: 150 },
    { field: "genre", headerName: "Genre", width: 150 },
    { field: "user", headerName: "User", width: 150 },
  ];

  const rows = [
    {
      id: 1,
      title: "Wonderwall",
      tutorial: "Video",
      pdf: "Download",
      instrument: "Guitar",
      genre: "Rock",
      user: "Ana",
    },
    {
      id: 2,
      title: "Imagine",
      tutorial: "Video",
      pdf: "Download",
      instrument: "Piano",
      genre: "Pop",
      user: "Tomás",
    },
  ];

  return (
    <Box sx={{ backgroundColor: "transparent", py: 2 }}>
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.contrastText} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "2px 2px 6px rgba(0, 0, 0, 0.15)",
          letterSpacing: "0.5px",
          mb: 2,
        }}
      >
        Tabs
      </Typography>

      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent={{ xs: "center", md: "space-between" }}
        textAlign={{ xs: "center", md: "left" }}
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2,
          backgroundColor: "rgba(245,241,220,0.6)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          flexDirection: { xs: "column", sm: "row", md: "row" },
        }}
      >
        <Grid item xs={12} sm="auto" sx={{ minWidth: "200px" }}>
          <InputField
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            isSearch
            onSearch={() => console.log("Search:", search)}
          />
        </Grid>

        <Grid item xs={12} sm="auto">
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, val) => val && setView(val)}
            sx={{
              borderRadius: "12px",
              overflow: "hidden",
              height: "56px",
            }}
          >
            <Tooltip title={isLoggedIn ? "" : "Login to view all tabs"}>
              <span>
                <ToggleButton value="all" sx={{ fontWeight: 600 }} disabled={!isLoggedIn}>
                  All
                </ToggleButton>
              </span>
            </Tooltip>

            <Tooltip title={isLoggedIn ? "" : "Login to view your tabs"}>
              <span>
                <ToggleButton value="mine" sx={{ fontWeight: 600 }} disabled={!isLoggedIn}>
                  My Tabs
                </ToggleButton>
              </span>
            </Tooltip>
          </ToggleButtonGroup>
        </Grid>

        <Grid item xs={12} sm="auto">
          <Box sx={{ minWidth: 180, width: { xs: "100%", sm: "auto" } }}>
            <SelectField
              label="Order by"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              options={[
                { value: "recent", label: "Most Recent" },
                { value: "oldest", label: "Oldest" },
              ]}
              fullWidth
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm="auto">
          <Tooltip title={isLoggedIn ? "" : "Login to create a tab"}>
            <span>
              <Button
                label="Create New Tab"
                variantType="secondary"
                startIcon={<AddIcon />}
                sx={{ width: { xs: "100%", sm: "auto" }, height: 56 }}
                onClick={handleOpenDialog} // ✅ abre el dialog
                disabled={!isLoggedIn}
              />
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <Box
        sx={{
          height: 500,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10]}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.warning.contrastText,
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: theme.palette.background.default,
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "rgba(245, 241, 220, 0.4)",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid rgba(0,0,0,0.08)",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid rgba(0,0,0,0.08)",
            },
          }}
        />
      </Box>

      <CreateTabDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveTab}
      />
    </Box>
  );
};