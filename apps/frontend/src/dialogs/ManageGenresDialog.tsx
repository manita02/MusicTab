import React, { useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../components/Button/Button";
import { InputField } from "../components/InputField/InputField";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { MessageModal } from "../components/MessageModal/MessageModal";
import {
  useCreateGenre,
  useDeleteGenre,
  useGenres,
  useUpdateGenre,
} from "../api/hooks/useCatalog";

type ModalState = {
  open: boolean;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
};

interface ManageGenresDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (genre: { id: number; name: string }) => void;
  onDeleted?: (id: number) => void;
}

export const ManageGenresDialog: React.FC<ManageGenresDialogProps> = ({
  open,
  onClose,
  onCreated,
  onDeleted,
}) => {
  const theme = useTheme();
  const { data: genres = [], isLoading: loadingGenres } = useGenres();
  const { mutate: createGenre, isPending: creating } = useCreateGenre();
  const { mutate: updateGenre, isPending: updating } = useUpdateGenre();
  const { mutate: deleteGenre, isPending: deleting } = useDeleteGenre();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const isBusy = loadingGenres || creating || updating || deleting;

  const sortedGenres = useMemo(
    () => [...genres].sort((a, b) => a.name.localeCompare(b.name)),
    [genres],
  );

  const showError = (message: string) => {
    setModal({ open: true, type: "error", title: "Could not update genres", message });
  };

  const backendMessage = (error: { response?: { data?: { message?: string; error?: string } }; message?: string }) =>
    error.response?.data?.message || error.response?.data?.error || error.message || "An unexpected error occurred.";

  const handleAdd = (event?: React.FormEvent) => {
    event?.preventDefault();
    const name = newName.trim();
    if (!name) {
      setModal({
        open: true,
        type: "warning",
        title: "Name required",
        message: "Enter a genre name before adding.",
      });
      return;
    }

    createGenre(
      { name },
      {
        onSuccess: (created) => {
          setNewName("");
          onCreated?.(created);
        },
        onError: (error) => showError(backendMessage(error)),
      },
    );
  };

  const startEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = (id: number) => {
    const name = editingName.trim();
    if (!name) {
      setModal({
        open: true,
        type: "warning",
        title: "Name required",
        message: "Genre name cannot be empty.",
      });
      return;
    }

    updateGenre(
      { id, name },
      {
        onSuccess: () => cancelEdit(),
        onError: (error) => showError(backendMessage(error)),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    setPendingDelete(null);
    deleteGenre(id, {
      onSuccess: () => onDeleted?.(id),
      onError: (error) => showError(backendMessage(error)),
    });
  };

  const handleClose = () => {
    cancelEdit();
    setNewName("");
    onClose();
  };

  return (
    <>
      <IconLoader active={isBusy} />

      <MessageModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText="OK"
        onConfirm={() => setModal((current) => ({ ...current, open: false }))}
      />

      <MessageModal
        open={pendingDelete != null}
        type="warning"
        title="Delete genre"
        message={
          pendingDelete
            ? `Delete "${pendingDelete.name}"? This cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        disableEnforceFocus
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0,
            backgroundColor: theme.palette.background.paper,
            m: { xs: 2, sm: 2 },
            maxHeight: "80dvh",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            textAlign: "center",
            color: theme.palette.primary.main,
            pt: 1.5,
            pb: 0.5,
            px: 2,
            fontSize: "1.1rem",
          }}
        >
          Manage genres
        </DialogTitle>

        <DialogContent sx={{ px: 2, py: 1.5 }}>
          <Box
            component="form"
            onSubmit={handleAdd}
            sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1.5 }}
          >
            <InputField
              label="New genre"
              hideLabel
              placeholder="New genre"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              size="small"
              fullWidth
            />
            <Button
              type="submit"
              label="Add"
              variantType="secondary"
              size="small"
              disabled={creating}
              sx={{ minHeight: 40, mt: "2px", flexShrink: 0 }}
            />
          </Box>

          {sortedGenres.length === 0 && !loadingGenres ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              No genres yet. Add one above.
            </Typography>
          ) : (
            <List dense disablePadding sx={{ maxHeight: 320, overflowY: "auto" }}>
              {sortedGenres.map((genre) => {
                const isEditing = editingId === genre.id;
                return (
                  <ListItem
                    key={genre.id}
                    disableGutters
                    sx={{
                      py: 0.25,
                      gap: 0.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      "&:last-of-type": { borderBottom: "none" },
                    }}
                    secondaryAction={
                      isEditing ? (
                        <Box>
                          <Tooltip title="Save" arrow>
                            <IconButton
                              size="small"
                              aria-label={`Save ${genre.name}`}
                              onClick={() => handleSaveEdit(genre.id)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel" arrow>
                            <IconButton size="small" aria-label="Cancel edit" onClick={cancelEdit}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box>
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              size="small"
                              aria-label={`Edit ${genre.name}`}
                              onClick={() => startEdit(genre.id, genre.name)}
                              sx={{
                                color: theme.palette.warning.main,
                                "&:hover": { backgroundColor: "rgba(255,144,19,0.1)" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              size="small"
                              aria-label={`Delete ${genre.name}`}
                              onClick={() => setPendingDelete({ id: genre.id, name: genre.name })}
                              sx={{
                                color: theme.palette.error.main,
                                "&:hover": { backgroundColor: "rgba(255,0,0,0.08)" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )
                    }
                  >
                    {isEditing ? (
                      <Box
                        component="form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveEdit(genre.id);
                        }}
                        sx={{ pr: 8, width: "100%" }}
                      >
                        <InputField
                          label="Genre name"
                          hideLabel
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </Box>
                    ) : (
                      <Typography sx={{ pr: 8, fontSize: "0.9rem" }}>{genre.name}</Typography>
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 1.5, pt: 0.5, px: 2 }}>
          <Button label="Close" variantType="danger" size="small" onClick={handleClose} />
        </DialogActions>
      </Dialog>
    </>
  );
};
