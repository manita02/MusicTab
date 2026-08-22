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
import { useUpdateTab } from "../api/hooks/useUpdateTab";

interface EditTabDialogProps {
  open: boolean;
  onClose: () => void;
  tabData: any;
  onSave: (data: any) => void;
}

export const EditTabDialog: React.FC<EditTabDialogProps> = ({
  open,
  onClose,
  tabData,
  onSave,
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
  const [debouncedImageUrl, setDebouncedImageUrl] = useState("");
  const [imageValid, setImageValid] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const { data: genres = [], isLoading: loadingGenres } = useGenres();
  const { data: instruments = [], isLoading: loadingInstruments } = useInstruments();

  const { mutate: updateTab, isPending: isUpdating } = useUpdateTab();
  const isLoading = loadingGenres || loadingInstruments || isUpdating;

  // Cargar los datos iniciales al abrir el dialog
  useEffect(() => {
    if (tabData) {
      setTitle(tabData.title || "");
      setArtist(tabData.artist || "");
      setGenre(tabData.genreId?.toString() || "");
      setInstrument(tabData.instrumentId?.toString() || "");
      setYoutubeUrl(tabData.urlYoutube || "");
      setImageUrl(tabData.urlImg || "");
      setPdfUrl(tabData.urlPdf || "");
      setDebouncedImageUrl(tabData.urlImg || "");
      setImageValid(true);
    }
  }, [tabData, open]);

  const handleModalClose = () => {
    setModalOpen(false);
    if (modalType === "success") onClose();
  };

  const showModal = (type: "success" | "error" | "warning", title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !artist.trim() || !genre || !instrument) {
      showModal("warning", "Incomplete Form", "Please complete all required fields before saving.");
      return;
    }

    const updatedTab = {
      id: tabData.id,
      title,
      artist: artist.trim(),
      genreId: Number(genre),
      instrumentId: Number(instrument),
      urlPdf: pdfUrl,
      urlYoutube: youtubeUrl,
      urlImg: imageUrl,
    };

    updateTab(updatedTab, {
      onSuccess: (data) => {
        showModal("success", "Tab Updated", "The tab has been successfully updated!");
        onSave(data);
      },
      onError: (error) => {
        const backendMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "An unexpected error occurred while updating the tab.";

        showModal("error", "Error Updating Tab", backendMsg);
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
    maxWidth: 220,
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
    maxWidth: 220,
    aspectRatio: "3 / 4",
    mx: "auto",
    borderRadius: 2,
    boxShadow: 3,
    objectFit: "cover",
    objectPosition: "center",
    border: `1px solid ${theme.palette.divider}`,
    display: "block",
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
        confirmText={modalType === "warning" ? "Continue" : "OK"}
        cancelText={modalType === "warning" ? "Cancel" : undefined}
        onConfirm={handleModalClose}
        onCancel={handleModalClose}
      />

      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, md: 3 },
            p: { xs: 0.5, sm: 1.5, md: 2 },
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: "100dvh", md: "90dvh" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: "center", color: theme.palette.primary.main, pb: 1 }}>
          Edit Tab
        </DialogTitle>

        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField label="Title *" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField label="Artist *" value={artist} onChange={e => setArtist(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SelectField
                label="Instrument *"
                value={instrument}
                onChange={e => setInstrument(e.target.value)}
                options={loadingInstruments ? [] : instruments.map(i => ({ value: i.id.toString(), label: i.name }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SelectField
                label="Genre *"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                options={loadingGenres ? [] : genres.map(g => ({ value: g.id.toString(), label: g.name }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputField label="PDF URL" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputField label="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <InputField label="YouTube URL" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {debouncedImageUrl && imageValid ? (
                <Box component="img" src={debouncedImageUrl} alt="Preview"
                  sx={coverPreviewSx}
                  onError={() => setImageValid(false)}
                />
              ) : (
                <Box sx={previewBoxStyles}><Typography>No image</Typography></Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {embedUrl ? (
                <Box component="iframe" src={embedUrl} title="YouTube preview" allowFullScreen
                  sx={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 2, boxShadow: 3, border: `1px solid ${theme.palette.divider}`, display: "block" }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: 2,
                    boxShadow: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "#fff",
                  }}
                >
                  <Typography>No video</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", py: 2, gap: 2, flexWrap: "wrap" }}>
          {<Button label={isUpdating ? "Saving..." : "Save Changes"} variantType="secondary" disabled={isUpdating} onClick={handleSave} sx={{ width: { xs: "100%", sm: "auto" } }} />}
          <Button label="Cancel" variantType="danger" onClick={onClose} sx={{ width: { xs: "100%", sm: "auto" } }} />
        </DialogActions>
      </Dialog>
    </>
  );
};
