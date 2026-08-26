import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { InputField } from "../components/InputField/InputField";
import { SelectField } from "../components/SelectField/SelectField";
import { Button } from "../components/Button/Button";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { MessageModal } from "../components/MessageModal/MessageModal";
import { useGenres, useInstruments } from "../api/hooks/useCatalog";
import { useCreateTab } from "../api/hooks/useCreateTab";
import { useAuth } from "../api/hooks/useAuth";
import { canManageTabs, normalizeRole } from "../auth/tabPermissions";

interface CreateTabDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onCreated?: (newTab: any) => void;
}

export const CreateTabDialog: React.FC<CreateTabDialogProps> = ({
  open,
  onClose,
  onSave,
  onCreated,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [instrument, setInstrument] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const [debouncedImageUrl, setDebouncedImageUrl] = useState(imageUrl);
  const [imageValid, setImageValid] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const { data: genres = [], isLoading: loadingGenres } = useGenres();
  const { data: instruments = [], isLoading: loadingInstruments } = useInstruments();
  const { mutate: createTab, isPending } = useCreateTab();
  const { isLoggedIn, userRole } = useAuth();

  const isLoading = loadingGenres || loadingInstruments || isPending;

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setGenre("");
    setInstrument("");
    setYoutubeUrl("");
    setImageUrl("");
    setDebouncedImageUrl("");
    setImageValid(true);
    setPdfUrl("");
  };

  const showModal = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalType === "success") {
      resetForm();
      onClose();
    }
  };

  const handleSave = async () => {
    if (!canManageTabs(isLoggedIn, normalizeRole(userRole))) {
      showModal(
        "error",
        "Not allowed",
        "Only administrators can create tabs. If you need access, contact support.",
      );
      return;
    }

    if (!title.trim() || !artist.trim() || !genre || !instrument) {
      showModal("warning", "Incomplete Form", "Please complete all required fields before saving.");
      return;
    }

    const newTab = {
      title,
      artist: artist.trim(),
      genreId: Number(genre),
      instrumentId: Number(instrument),
      urlPdf: pdfUrl,
      urlYoutube: youtubeUrl,
      urlImg: imageUrl,
    };

    createTab(newTab, {
      onSuccess: (data) => {
        showModal("success", "Tab Created", "The tab has been successfully created!");
        onSave(data);
        if (onCreated) onCreated(data);
      },
      onError: (error) => {
        const backendMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "An unexpected error occurred.";

        showModal("error", "Error Creating Tab", backendMsg);
      },
    });
  };


  const getYouTubeEmbedUrl = (url: string) => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

  const previewBoxStyles = {
    width: "100%",
    maxWidth: 190,
    aspectRatio: "3 / 4",
    mx: "auto",
    borderRadius: 2,
    boxShadow: 3,
    border: `1px solid ${theme.palette.divider}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
  };

  const coverPreviewSx = {
    width: "100%",
    maxWidth: 190,
    aspectRatio: "3 / 4",
    mx: "auto",
    borderRadius: 2,
    boxShadow: 3,
    objectFit: "cover",
    objectPosition: "center",
    border: `1px solid ${theme.palette.divider}`,
    display: "block",
  };

  const videoPreviewSx = {
    width: "100%",
    maxWidth: { xs: "100%", sm: 400 },
    aspectRatio: "16 / 9",
    mx: "auto",
    borderRadius: 2,
    boxShadow: 3,
    border: `1px solid ${theme.palette.divider}`,
    display: "block",
  };

  const videoPlaceholderSx = {
    ...videoPreviewSx,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedImageUrl(imageUrl);
      setImageValid(true);
    }, 500);
    return () => clearTimeout(handler);
  }, [imageUrl]);

  return (
    <>
      <IconLoader active={isLoading} />

      <MessageModal
        open={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        onConfirm={handleModalClose}
      />

      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, md: 3 },
            p: { xs: 0, sm: 1, md: 1.25 },
            backgroundColor: theme.palette.background.paper,
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: "100dvh", md: "90dvh" },
            overflowX: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            textAlign: "center",
            color: theme.palette.primary.main,
            pt: { xs: 1.25, sm: 1.5 },
            pb: { xs: 0.75, sm: 1 },
            px: { xs: 1.5, sm: 2 },
          }}
        >
          Create New Tab
        </DialogTitle>

        <DialogContent dividers sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1.5, sm: 2 }, overflowX: "hidden" }}>
          <Grid container spacing={{ xs: 1, sm: 1.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField label="Artist *" value={artist} onChange={(e) => setArtist(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SelectField
                label="Instrument *"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                options={loadingInstruments ? [] : instruments.map((i) => ({ value: i.id.toString(), label: i.name }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SelectField
                label="Genre *"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                options={loadingGenres ? [] : genres.map((g) => ({ value: g.id.toString(), label: g.name }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputField label="PDF URL" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputField label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputField label="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {debouncedImageUrl && imageValid ? (
                <Box
                  component="img"
                  src={debouncedImageUrl}
                  alt="Preview"
                  sx={coverPreviewSx}
                  onError={() => setImageValid(false)}
                />
              ) : (
                <Box sx={previewBoxStyles}>
                  <Typography>No image</Typography>
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {embedUrl ? (
                <Box
                  component="iframe"
                  src={embedUrl}
                  title="YouTube preview"
                  allowFullScreen
                  sx={videoPreviewSx}
                />
              ) : (
                <Box sx={videoPlaceholderSx}>
                  <Typography>No video</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          disableSpacing
          sx={{
            justifyContent: "center",
            py: { xs: 1, sm: 1.5 },
            px: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 1.5 },
            flexWrap: "wrap",
            "& .MuiButton-root": {
              fontSize: "0.875rem",
              padding: "6px 16px",
              minHeight: 40,
              width: { xs: "100%", sm: "auto" },
            },
          }}
        >
          <Button
            label={isPending ? "Saving..." : "Save Tab"}
            variantType="secondary"
            disabled={isPending}
            onClick={handleSave}
          />
          <Button
            label="Cancel"
            variantType="danger"
            onClick={onClose}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};