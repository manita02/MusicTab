import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { InputField } from "../components/InputField/InputField";
import { Button } from "../components/Button/Button";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { MessageModal } from "../components/MessageModal/MessageModal";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";


interface ManageProfileDialogProps {
  open: boolean;
  onClose: () => void;
  userData?: {
    username: string;
    email: string;
    dateOfBirth: string;
    age: number;
    profileImg?: string;
  };
}

export const ManageProfileDialog: React.FC<ManageProfileDialogProps> = ({
  open,
  onClose,
  userData,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [username, setUsername] = useState(userData?.username || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState(userData?.dateOfBirth || "");
  const [age, setAge] = useState(userData?.age || 0);
  const [profileImg, setProfileImg] = useState(userData?.profileImg || "");
  const [previewImg, setPreviewImg] = useState(profileImg);
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (profileImg && profileImg.startsWith("http")) {
        setPreviewImg(profileImg);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [profileImg]);

  useEffect(() => {
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const calculatedAge = today.getFullYear() - birthDate.getFullYear();
      setAge(calculatedAge);
    }
  }, [dateOfBirth]);

  const handleEditToggle = () => setIsEditing((prev) => !prev);

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

  const handleModalClose = () => setModalOpen(false);

  const handleDeleteUser = () => {
    showModal("warning", "Delete Account", "Are you sure you want to delete your account?");
  };

  const handleSave = () => {
    showModal("success", "Profile Updated", "Your profile has been updated successfully.");
    setIsEditing(false);
  };

  return (
    <>
      <IconLoader active={false} />
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
        maxWidth="sm"
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
            position: "relative",
        }}
        >
        Manage Profile
        <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.text.secondary,
            "&:hover": {
                color: theme.palette.primary.main,
                transform: "scale(1.1)",
                transition: "all 0.2s ease",
            },
            }}
        >
            <CloseIcon />
        </IconButton>
        </DialogTitle>


        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Avatar
              src={previewImg}
              alt={username}
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                border: `3px solid ${theme.palette.primary.main}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            />
          </Box>

          <Grid container spacing={2} direction="column">
            <InputField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              disabled={!isEditing}
            />
            <InputField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              disabled={!isEditing}
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              disabled={!isEditing}
            />
            <InputField
              label="Profile Image URL"
              value={profileImg}
              onChange={(e) => setProfileImg(e.target.value)}
              fullWidth
              disabled={!isEditing}
            />
            <InputField
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              fullWidth
              disabled={!isEditing}
            />
            <InputField label="Age" value={age.toString()} fullWidth disabled />
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
          {isEditing ? (
            <>
              <Button
                label="Save Changes"
                variantType="secondary"
                onClick={handleSave}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              />
              <Button
                label="Cancel"
                variantType="danger"
                onClick={handleEditToggle}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              />
            </>
          ) : (
            <>
              <Button
                label="Edit Profile"
                variantType="secondary"
                onClick={handleEditToggle}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              />
              <Button
                label="Delete Account"
                variantType="danger"
                onClick={handleDeleteUser}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              />
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};