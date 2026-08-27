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
import { UserAvatar } from "../components/UserAvatar/UserAvatar";

import { theme } from "../theme/theme";
import { Button } from "../components/Button/Button";
import { InputField } from "../components/InputField/InputField";
import { SelectField } from "../components/SelectField/SelectField";
import { CreateTabDialog } from "../dialogs/CreateTabDialog";
import { CaptureTabPdfButton } from "../components/CaptureTabPdfButton/CaptureTabPdfButton";
import { useAuth } from "../api/hooks/useAuth";
import { useAllTabs } from "../api/hooks/useTabs";
import { useGenres, useInstruments } from "../api/hooks/useCatalog";
import { useDeleteTab } from "../api/hooks/useDeleteTab";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { EditTabDialog } from "../dialogs/EditTabDialog";
import { MessageModal } from "../components/MessageModal/MessageModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  canDownloadTabPdf,
  canManageTabs,
  canMutateTab,
  normalizeRole,
} from "../auth/tabPermissions";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { STATS_GLOBAL_QUERY_KEY, STATS_ME_QUERY_KEY } from "../api/hooks/useStats";
import { getYouTubeEmbedUrl } from "../utils/youtube";

const GUEST_TABS_MESSAGE =
  "You can browse all published tabs below. Buttons for PDF download and tab editing are locked until you sign in. Sign in or create an account to unlock downloads. Only admins can create tabs, and an admin can edit or delete only the tabs they created.";

export const TabsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const { isLoggedIn, userRole: rawRole, userId } = useAuth();
  const viewerRole = normalizeRole(rawRole);
  const canManage = canManageTabs(isLoggedIn, viewerRole);
  const canDownload = canDownloadTabPdf(isLoggedIn);
  const isGuest = !isLoggedIn;

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
  const localUserId = userId ?? Number(localStorage.getItem("userId"));

  useEffect(() => {
    if (!canManage && view === "mine") {
      setView("all");
    }
  }, [canManage, view]);

  useEffect(() => {
    setGuestInfoOpen(isGuest);
  }, [isGuest]);

  const handleTabCreated = (newTab: any) => {
    setTabs((prev) => [newTab, ...prev]);
    setFilteredTabs((prev) => [newTab, ...prev]);
  };

  const [guestInfoOpen, setGuestInfoOpen] = useState(false);

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
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    if (data) {
      setTabs(data);
      setFilteredTabs(data);
    }
  }, [data]);

  useEffect(() => {
    if (!isLoading && data !== undefined) {
      const timeout = setTimeout(() => setPageLoading(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, data]);

  useEffect(() => {
    let results = [...tabs];
    if (search.trim()) {
      results = results.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (view === "mine" && isLoggedIn && localUserId && canManage) {
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
  }, [tabs, search, view, order, isLoggedIn, localUserId, canManage]);

  const handleSearch = () => {
    setSearch(search.trim());
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleSaveTab = () => {
    handleCloseDialog();
  };

  const handleEdit = (tabId: number) => {
    const tab = filteredTabs.find((t: any) => t.id === tabId) ?? data?.find((t: any) => t.id === tabId);
    if (!tab) return;
    setSelectedTab(tab);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => setEditDialogOpen(false);
  const navigate = useNavigate();
  const handleUpdateTab = () => {
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
      { id: selectedTab.id },
      {
        onSuccess: () => {
          setTabs((prevTabs) => prevTabs.filter((t) => t.id !== selectedTab.id));
          setFilteredTabs((prevTabs) => prevTabs.filter((t) => t.id !== selectedTab.id));
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
      },
    );
  };

  const handleCloseModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  const handleViewPdf = async (tabId: number, pdfUrl: string) => {
    try {
      await api.post(ENDPOINTS.tabs.view(tabId));
      await queryClient.invalidateQueries({ queryKey: STATS_ME_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: STATS_GLOBAL_QUERY_KEY });
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } catch {
      // 401 is handled by the axios interceptor (redirect to login).
    }
  };

  const getGenreName = (id: number) =>
    genres.find((g: any) => g.id === id)?.name || "-";

  const getInstrumentName = (id: number) =>
    instruments.find((i: any) => i.id === id)?.name || "-";

  const rows =
    filteredTabs?.map((tab: any) => ({
      id: tab.id,
      title: tab.title,
      artist: tab.artist || "",
      imageUrl: tab.urlImg || "",
      youtubeUrl: tab.urlYoutube || "",
      pdf: tab.urlPdf || null,
      instrument: getInstrumentName(tab.instrumentId),
      genre: getGenreName(tab.genreId),
      user: tab.userName || "-",
      userImg: tab.userImg || "",
      userId: tab.userId,
      createdAt: tab.createdAt,
    })) || [];

  const guestOrUserManageTooltip = isGuest
    ? "Sign in to manage tabs (admins only)"
    : "Only administrators can manage tabs";

  const actionsCol = {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const canMutate = canMutateTab(isLoggedIn, viewerRole, localUserId, params.row.userId);
        const editTooltip = canMutate
          ? "Update"
          : canManage
            ? "You can only edit tabs you created"
            : guestOrUserManageTooltip;
        const deleteTooltip = canMutate
          ? "Delete"
          : canManage
            ? "You can only delete tabs you created"
            : guestOrUserManageTooltip;

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
          <Tooltip title={editTooltip} arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => canMutate && handleEdit(params.row.id)}
                disabled={!canMutate}
                sx={{
                  color: canMutate ? theme.palette.warning.main : theme.palette.action.disabled,
                  "&:hover": canMutate
                    ? { backgroundColor: "rgba(255,144,19,0.1)" }
                    : undefined,
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
                onClick={() => canMutate && handleDeleteClick(params.row)}
                disabled={!canMutate || isDeleting}
                sx={{
                  color: canMutate ? theme.palette.error.main : theme.palette.action.disabled,
                  "&:hover": canMutate
                    ? { backgroundColor: "rgba(255,0,0,0.08)" }
                    : undefined,
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {params.row.pdf &&
            (canDownload ? (
              <Tooltip title="View PDF" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    void handleViewPdf(params.row.id, params.row.pdf);
                  }}
                  sx={{
                    color: theme.palette.info.main,
                    "&:hover": { backgroundColor: "rgba(0,0,255,0.08)" },
                  }}
                >
                  <PictureAsPdfIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Sign in to download PDFs" arrow>
                <span>
                  <IconButton size="small" disabled sx={{ color: theme.palette.action.disabled }}>
                    <PictureAsPdfIcon fontSize="medium" />
                  </IconButton>
                </span>
              </Tooltip>
            ))}
        </Box>
        );
      },
  };

  const titleCol = {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 180,
      align: "center" as const,
      headerAlign: "center" as const,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            width: "100%",
            minWidth: 0,
            height: "100%",
            py: 0.5,
            textAlign: "center",
          }}
        >
          <Typography
            fontWeight={600}
            sx={{
              width: "100%",
              maxWidth: "100%",
              lineHeight: 1.25,
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {params.row.title}
          </Typography>
          {params.row.artist ? (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: "100%" }}>
              {params.row.artist}
            </Typography>
          ) : null}
          {params.row.imageUrl ? (
            <Box
              component="img"
              src={params.row.imageUrl}
              alt="Preview"
              sx={{
                width: 96,
                aspectRatio: "3 / 4",
                objectFit: "cover",
                objectPosition: "center",
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                flexShrink: 0,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "";
              }}
            />
          ) : (
            <Box
              sx={{
                width: 96,
                aspectRatio: "3 / 4",
                backgroundColor: "rgba(0,0,0,0.3)",
                borderRadius: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 11,
                color: "#fff",
                flexShrink: 0,
                textAlign: "center",
                px: 0.5,
              }}
            >
              No Image
            </Box>
          )}
        </Box>
      ),
  };

  const videoCol = {
      field: "youtubeUrl",
      headerName: "Video",
      width: 280,
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
              p: 1,
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
                  width: "100%",
                  maxWidth: 248,
                  aspectRatio: "16 / 9",
                  height: "auto",
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 248,
                  aspectRatio: "16 / 9",
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
  };

  const metaCols = [
      {
        field: "instrument",
        headerName: "Instrument",
        width: 150,
        align: "center" as const,
        headerAlign: "center" as const,
        renderCell: (params: any) => (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {params.value}
          </Box>
        ),
      },
      {
        field: "genre",
        headerName: "Genre",
        width: 150,
        align: "center" as const,
        headerAlign: "center" as const,
        renderCell: (params: any) => (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {params.value}
          </Box>
        ),
      },
      {
        field: "user",
        headerName: "Uploaded by",
        width: 200,
        align: "center" as const,
        headerAlign: "center" as const,
        renderCell: (params: any) => (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              height: "100%",
              width: "100%",
              minWidth: 0,
            }}
          >
            <UserAvatar name={params.row.user} src={params.row.userImg} size={36} />
            <Box sx={{ minWidth: 0, textAlign: "left" }}>
              <Typography fontWeight={600} noWrap>
                {params.row.user}
              </Typography>
              {params.row.createdAt && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(params.row.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ),
      },
  ];

  const columns = [actionsCol, titleCol, videoCol, ...metaCols];

  return (
    <Box sx={{ position: "relative", backgroundColor: "transparent", py: { xs: 1, md: 1.5 } }}>
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
              fontSize: { xs: "1.5rem", md: "1.85rem" },
              letterSpacing: "0.5px",
              mb: 1.5,
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
              mb: 2,
              p: { xs: 1.5, md: 2 },
              borderRadius: 2,
              backgroundColor: "rgba(245,241,220,0.6)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Grid size={{ xs: 12, sm: "auto" }} sx={{ minWidth: "200px" }}>
              <InputField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                isSearch
                onSearch={handleSearch}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: "auto" }}>
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(_, val) => val && setView(val)}
                sx={{ borderRadius: "12px", overflow: "hidden", height: "56px" }}
              >
                <ToggleButton value="all" sx={{ fontWeight: 600 }}>
                  All
                </ToggleButton>
                {canManage && (
                  <ToggleButton value="mine" sx={{ fontWeight: 600 }}>
                    My Tabs
                  </ToggleButton>
                )}
              </ToggleButtonGroup>
            </Grid>
            <Grid size={{ xs: 12, sm: "auto" }}>
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
            <Grid size={{ xs: 12, sm: "auto" }}>
              <Tooltip title={canManage ? "" : "Only administrators can create tabs"}>
                <span>
                  <Button
                    label="Create New Tab"
                    variantType="secondary"
                    startIcon={<AddIcon />}
                    sx={{ height: 56 }}
                    onClick={handleOpenDialog}
                    disabled={!canManage}
                  />
                </span>
              </Tooltip>
            </Grid>
            <Grid size={{ xs: 12, sm: "auto" }}>
              <CaptureTabPdfButton sx={{ height: 56 }} />
            </Grid>
          </Grid>

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
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10]}
              getRowHeight={() => "auto"}
              getEstimatedRowHeight={() => 220}
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
                "& .MuiDataGrid-cell[data-field=\"title\"]": {
                  whiteSpace: "normal",
                  py: 1,
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

          <CreateTabDialog
            open={openDialog}
            onClose={handleCloseDialog}
            onSave={handleSaveTab}
            onCreated={handleTabCreated}
          />
          <EditTabDialog
            open={editDialogOpen}
            onClose={handleCloseEditDialog}
            tabData={selectedTab}
            onSave={handleUpdateTab}
          />
          <MessageModal
            open={guestInfoOpen}
            type="info"
            title="Browsing as guest"
            message={GUEST_TABS_MESSAGE}
            confirmText="Got it"
            onConfirm={() => setGuestInfoOpen(false)}
            onCancel={() => setGuestInfoOpen(false)}
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
