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
    if (!title.trim() || !genre || !instrument) {
      showModal("warning", "Incomplete Form", "Please complete all required fields before saving.");
      return;
    }

    const updatedTab = {
      id: tabData.id,
      title,
      genreId: Number(genre),
      instrumentId: Number(instrument),
      urlPdf: pdfUrl,
      urlYoutube: youtubeUrl,
      urlImg: imageUrl,
      userId: tabData.userId,
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
    maxWidth: 400,
    height: 225,
    borderRadius: 2,
    boxShadow: 3,
    border: `1px solid ${theme.palette.divider}`,
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
        PaperProps={{ sx: { borderRadius: 3, p: { xs: 1, sm: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: "center", color: theme.palette.primary.main, pb: 1 }}>
          Edit Tab
        </DialogTitle>

        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          <Grid container spacing={3} direction="column">
            <InputField label="Title *" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
            <SelectField
              label="Instrument *"
              value={instrument}
              onChange={e => setInstrument(e.target.value)}
              options={loadingInstruments ? [] : instruments.map(i => ({ value: i.id.toString(), label: i.name }))}
              fullWidth
            />
            <SelectField
              label="Genre *"
              value={genre}
              onChange={e => setGenre(e.target.value)}
              options={loadingGenres ? [] : genres.map(g => ({ value: g.id.toString(), label: g.name }))}
              fullWidth
            />
            <InputField label="PDF URL" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} fullWidth />
            <InputField label="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} fullWidth />

            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              {debouncedImageUrl && imageValid ? (
                <Box component="img" src={debouncedImageUrl} alt="Preview"
                  sx={{ width: "100%", maxWidth: 400, height: 225, borderRadius: 2, boxShadow: 3, objectFit: "cover", border: `1px solid ${theme.palette.divider}` }}
                  onError={() => setImageValid(false)}
                />
              ) : (
                <Box sx={previewBoxStyles}><Typography>No image</Typography></Box>
              )}
            </Box>

            <InputField label="YouTube URL" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} fullWidth />
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              {embedUrl ? (
                <Box component="iframe" src={embedUrl} title="YouTube preview" allowFullScreen
                  sx={{ width: "100%", maxWidth: 400, aspectRatio: "16/9", borderRadius: 2, boxShadow: 3, border: `1px solid ${theme.palette.divider}` }}
                />
              ) : (
                <Box sx={previewBoxStyles}><Typography>No video</Typography></Box>
              )}
            </Box>
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
