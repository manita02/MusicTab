import React, { useState, useEffect } from "react";
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import { theme } from "../theme/theme";
import { Button } from "../components/Button/Button";
import { InputField } from "../components/InputField/InputField";
import { SelectField } from "../components/SelectField/SelectField";
import { CreateTabDialog } from "../dialogs/CreateTabDialog";
import { useAuth } from "../api/hooks/useAuth";
import { useAllTabs } from "../api/hooks/useTabs";
import { useGenres, useInstruments } from "../api/hooks/useCatalog";
import { useDeleteTab } from "../api/hooks/useDeleteTab";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { EditTabDialog } from "../dialogs/EditTabDialog";
import { MessageModal } from "../components/MessageModal/MessageModal";
import { useNavigate, useSearchParams } from "react-router-dom";

export const TabsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const { isLoggedIn, userId: loggedUserId, userRole } = useAuth();
  const [view, setView] = useState<"all" | "mine">("all");
  const [order, setOrder] = useState("recent");
  const [openDialog, setOpenDialog] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const { data, isLoading, isError } = useAllTabs();
  const { data: genres = [] } = useGenres();
  const { data: instruments = [] } = useInstruments();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<any>(null);

  const { mutate: deleteTab, isPending: isDeleting } = useDeleteTab();
  const localUserId  = Number(localStorage.getItem("userId"));

  const handleTabCreated = (newTab: any) => {
    setTabs((prev) => [newTab, ...prev]);
    setFilteredTabs((prev) => [newTab, ...prev]);
  };

  const [modal, setModal] = useState<{
    open: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });

  const [tabs, setTabs] = useState<any[]>([]);
  const [filteredTabs, setFilteredTabs] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setTabs(data);
      setFilteredTabs(data);
    }
  }, [data]);

  useEffect(() => {
    if (!isLoading && data) {
      const timeout = setTimeout(() => setPageLoading(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, data]);

  useEffect(() => {
    let results = [...tabs];
    if (search.trim()) {
      results = results.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (view === "mine" && isLoggedIn && localUserId) {
      results = results.filter((t) => t.userId === localUserId);
    }
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return order === "recent"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
    setFilteredTabs(results);
  }, [tabs, search, view, order, isLoggedIn, localUserId ]);

  const handleSearch = () => {
    setSearch(search.trim());
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleSaveTab = (tabData: any) => {
    console.log("🆕 New Tab created:", tabData);
    handleCloseDialog();
  };

  const handleEdit = (tabId: number) => {
    const tab = data.find((t: any) => t.id === tabId);
    if (!tab) return;
    setSelectedTab(tab);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => setEditDialogOpen(false);
  const navigate = useNavigate();
  const handleUpdateTab = (updatedTab: any) => {
    navigate("/tabs");
    setTimeout(() => {
      window.location.reload();
    }, 200);
    setEditDialogOpen(false);
  };

  const handleDeleteClick = (tab: { id: number; title: string; userId: number }) => {
    setSelectedTab(tab);
    setModal({
      open: true,
      type: "warning",
      title: "Delete this tab?",
      message: `Are you sure you want to delete "${tab.title}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedTab) return;
    deleteTab(
      { id: selectedTab.id, userId: Number(localStorage.getItem("userId")) },
      {
        onSuccess: () => {
          setTabs((prevTabs) => prevTabs.filter((t) => t.id !== selectedTab.id));
          setFilteredTabs((prevTabs) =>
            prevTabs.filter((t) => t.id !== selectedTab.id)
          );
          setModal({
            open: true,
            type: "success",
            title: "Deleted successfully",
            message: `The tab "${selectedTab.title}" was deleted successfully.`,
          });
          setSelectedTab(null);
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "An unexpected error occurred while deleting the tab.";
          setModal({
            open: true,
            type: "error",
            title: "Error deleting",
            message: errorMessage,
          });
        },
      }
    );
  };

  const handleCloseModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  const getGenreName = (id: number) =>
    genres.find((g: any) => g.id === id)?.name || "-";

  const getInstrumentName = (id: number) =>
    instruments.find((i: any) => i.id === id)?.name || "-";

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url?.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const rows =
    filteredTabs?.map((tab: any) => ({
      id: tab.id,
      title: tab.title,
      imageUrl: tab.urlImg || "",
      youtubeUrl: tab.urlYoutube || "",
      pdf: tab.urlPdf || null,
      instrument: getInstrumentName(tab.instrumentId),
      genre: getGenreName(tab.genreId),
      user: tab.userName || "-",
      userId: tab.userId,
      createdAt: tab.createdAt,
    })) || [];

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const canManage =
          isLoggedIn &&
          (userRole === "ADMIN" || params.row.userId === loggedUserId);
        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            {canManage && (
              <Tooltip title="Update" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(params.row.id)}
                  sx={{
                    color: theme.palette.warning.main,
                    "&:hover": { backgroundColor: "rgba(255,144,19,0.1)" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {canManage && (
              <Tooltip title="Delete" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(params.row)}
                  disabled={isDeleting}
                  sx={{
                    color: theme.palette.error.main,
                    "&:hover": { backgroundColor: "rgba(255,0,0,0.08)" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {params.row.pdf && (
              <Tooltip title="View PDF" arrow>
                <IconButton
                  size="small"
                  component="a"
                  href={params.row.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: theme.palette.info.main,
                    "&:hover": { backgroundColor: "rgba(0,0,255,0.08)" },
                  }}
                >
                  <PictureAsPdfIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 180,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            alignItems: "center",
          }}
        >
          <Typography fontWeight={600}>{params.row.title}</Typography>
          {params.row.imageUrl ? (
            <Box
              component="img"
              src={params.row.imageUrl}
              alt="Preview"
              sx={{
                width: 160,
                height: 170,
                objectFit: "cover",
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "";
              }}
            />
          ) : (
            <Box
              sx={{
                width: 160,
                height: 170,
                backgroundColor: "rgba(0,0,0,0.3)",
                borderRadius: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 12,
                color: "#fff",
              }}
            >
              No Image
            </Box>
          )}
        </Box>
      ),
    },
    {
      field: "youtubeUrl",
      headerName: "Video",
      width: 360,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const embedUrl = getYouTubeEmbedUrl(params.value || "");
        return (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 2,
            }}
          >
            {embedUrl ? (
              <Box
                component="iframe"
                src={embedUrl}
                title="YouTube"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{
                  width: 347,
                  height: 195,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 347,
                  height: 195,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 12,
                  color: "#fff",
                }}
              >
                No Video
              </Box>
            )}
          </Box>
        );
      },
    },
    { field: "instrument", headerName: "Instrument", width: 150 },
    { field: "genre", headerName: "Genre", width: 150 },
    {
      field: "user",
      headerName: "Uploaded by",
      width: 150,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 0.5,
            height: "100%",
          }}
        >
          <Typography fontWeight={600}>{params.row.user}</Typography>
          {params.row.createdAt && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayIcon
                sx={{ fontSize: 14, color: "text.secondary" }}
              />
              <Typography variant="caption" color="text.secondary">
                {new Date(params.row.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ position: "relative", backgroundColor: "transparent", py: 2 }}>
      <IconLoader active={pageLoading || isLoading} />
      {isError && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Typography color="error">Error loading tabs.</Typography>
        </Box>
      )}
      {!isError && (
        <>
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
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Grid item xs={12} sm="auto" sx={{ minWidth: "200px" }}>
              <InputField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                isSearch
                onSearch={handleSearch}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(_, val) => val && setView(val)}
                sx={{ borderRadius: "12px", overflow: "hidden", height: "56px" }}
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
              <Box sx={{ minWidth: 180 }}>
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
                    sx={{ height: 56 }}
                    onClick={handleOpenDialog}
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
              getRowHeight={() => 220}
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
                  backgroundColor: "rgba(245,241,220,0.4)",
                },
              }}
            />
          </Box>

          <CreateTabDialog open={openDialog} onClose={handleCloseDialog} onSave={handleSaveTab} onCreated={handleTabCreated}/>
          <EditTabDialog
            open={editDialogOpen}
            onClose={handleCloseEditDialog}
            tabData={selectedTab}
            onSave={handleUpdateTab}
          />
          <MessageModal
            open={modal.open}
            type={modal.type}
            title={modal.title}
            message={modal.message}
            confirmText={
              modal.type === "warning"
                ? isDeleting
                  ? "Deleting..."
                  : "Yes, delete"
                : "Accept"
            }
            cancelText={modal.type === "warning" ? "Cancel" : undefined}
            onConfirm={
              modal.type === "warning" ? handleConfirmDelete : handleCloseModal
            }
            onCancel={handleCloseModal}
          />
        </>
      )}
    </Box>
  );
};