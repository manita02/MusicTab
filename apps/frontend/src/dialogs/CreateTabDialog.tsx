import React, { useState } from "react";
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

interface CreateTabDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const CreateTabDialog: React.FC<CreateTabDialogProps> = ({
  open,
  onClose,
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

  const handleSave = () => {
    onSave({ title, genre, instrument, youtubeUrl, imageUrl, pdfUrl });
    onClose();
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: { xs: 1, sm: 2 },
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          textAlign: "center",
          color: theme.palette.primary.main,
          pb: 1,
        }}
      >
        Create New Tab
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3} direction="column">
          <InputField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter song title"
            fullWidth
          />
          <SelectField
            label="Instrument"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            options={[
              { value: "guitar", label: "Guitar" },
              { value: "piano", label: "Piano" },
              { value: "bass", label: "Bass" },
              { value: "drums", label: "Drums" },
            ]}
            fullWidth
          />
          <SelectField
            label="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            options={[
              { value: "rock", label: "Rock" },
              { value: "pop", label: "Pop" },
              { value: "jazz", label: "Jazz" },
              { value: "metal", label: "Metal" },
            ]}
            fullWidth
          />

          <InputField
            label="PDF URL"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="https://example.com/tab.pdf"
            fullWidth
          />

          <InputField
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            fullWidth
          />

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            {imageUrl ? (
              <Box
                component="img"
                src={imageUrl}
                alt="Preview"
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  height: 225,
                  borderRadius: 2,
                  boxShadow: 3,
                  objectFit: "cover",
                  border: `1px solid ${theme.palette.divider}`,
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : (
              <Box sx={previewBoxStyles}>
                <Typography>No image</Typography>
              </Box>
            )}
          </Box>

          <InputField
            label="YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            fullWidth
          />

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            {embedUrl ? (
              <Box
                component="iframe"
                src={embedUrl}
                title="YouTube preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  aspectRatio: "16/9",
                  borderRadius: 2,
                  boxShadow: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            ) : (
              <Box sx={previewBoxStyles}>
                <Typography>No video</Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          py: 2,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Button
          label="Save Tab"
          variantType="secondary"
          onClick={handleSave}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        />
        <Button
          label="Cancel"
          variantType="danger"
          onClick={onClose}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        />
      </DialogActions>
    </Dialog>
  );
};