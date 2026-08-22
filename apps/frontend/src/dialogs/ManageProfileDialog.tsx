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
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { InputField } from "../components/InputField/InputField";
import { SelectField } from "../components/SelectField/SelectField";
import { Button } from "../components/Button/Button";
import { IconLoader } from "../components/IconLoader/IconLoader";
import { MessageModal } from "../components/MessageModal/MessageModal";
import { RoleBadge } from "../components/RoleBadge/RoleBadge";
import { useAuth } from "../api/hooks/useAuth";
import { useUpdateUser } from "../api/hooks/useUpdateUser";
import { useDeleteUser } from "../api/hooks/useDeleteUser";

export type ManageProfileUser = {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  birthDate?: string | null;
  urlImg?: string | null;
};

export const ManageProfileDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  user?: ManageProfileUser | null;
  onSaved?: () => void;
}> = ({ open, onClose, user, onSaved }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { userId: authUserId, userName: authUserName, userImg: authUserImg } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState(0);
  const [profileImg, setProfileImg] = useState("");
  const [previewImg, setPreviewImg] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [isEditing, setIsEditing] = useState(false);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const isAdminTarget = user != null;
  const targetId = user?.id ?? authUserId ?? Number(localStorage.getItem("userId"));
  const isAdminRole = role === "ADMIN";

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const calcularEdad = (fecha: string) => {
    if (!fecha) return 0;
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  useEffect(() => {
    if (!open) return;

    if (user) {
      const formattedDate = formatDate(user.birthDate ?? null);
      setUsername(user.username);
      setEmail(user.email);
      setDateOfBirth(formattedDate);
      setProfileImg(user.urlImg ?? "");
      setPreviewImg(user.urlImg ?? "");
      setRole(user.role === "ADMIN" ? "ADMIN" : "USER");
      setAge(calcularEdad(formattedDate));
      setPassword("");
      setIsEditing(false);
      return;
    }

    const storedUser = localStorage.getItem("userName") ?? authUserName ?? "";
    const storedEmail = localStorage.getItem("email") ?? "";
    const storedBirthDate = localStorage.getItem("birthDate");
    const storedImg = localStorage.getItem("userImg") ?? authUserImg ?? "";
    const storedRole = (localStorage.getItem("userRole") ?? "USER") === "ADMIN" ? "ADMIN" : "USER";
    const formattedDate = formatDate(storedBirthDate);

    setUsername(storedUser);
    setEmail(storedEmail);
    setDateOfBirth(formattedDate);
    setProfileImg(storedImg);
    setPreviewImg(storedImg);
    setRole(storedRole);
    setAge(calcularEdad(formattedDate));
    setPassword("");
    setIsEditing(false);
  }, [open, user, authUserName, authUserImg]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | "warning">("success");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    if (profileImg && profileImg.startsWith("http")) {
      setPreviewImg(profileImg);
    }
  }, [profileImg]);

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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleDeleteUser = async () => {
    try {
      await deleteUserMutation.mutateAsync(Number(targetId));
      const isSelf = Number(targetId) === Number(authUserId ?? localStorage.getItem("userId"));

      if (isSelf) {
        showModal(
          "success",
          "Account Deleted",
          "Your account and all your published tabs have been deleted successfully."
        );
        localStorage.clear();
        setTimeout(() => {
          setModalOpen(false);
          onClose();
          window.location.href = "/";
        }, 1500);
        return;
      }

      showModal("success", "Account Deleted", "The user was deleted successfully.");
      onSaved?.();
      setTimeout(() => {
        setModalOpen(false);
        onClose();
      }, 800);
    } catch (err: any) {
      showModal(
        "error",
        "Delete Failed",
        err?.response?.data?.message || "Something went wrong"
      );
    }
  };

  const handleSave = async () => {
    try {
      await updateUserMutation.mutateAsync({
        id: Number(targetId),
        username,
        email,
        password: password || undefined,
        birthDate: dateOfBirth,
        urlImg: profileImg,
        role: isAdminTarget ? role : undefined,
      });

      const isSelf = Number(targetId) === Number(authUserId ?? localStorage.getItem("userId"));
      if (isSelf) {
        localStorage.setItem("userName", username);
        localStorage.setItem("email", email);
        localStorage.setItem("birthDate", dateOfBirth);
        localStorage.setItem("userImg", profileImg);
        if (isAdminTarget) {
          localStorage.setItem("userRole", role);
        }
      }

      showModal(
        "success",
        "Profile Updated",
        isSelf ? "Your profile has been updated successfully." : "The profile has been updated successfully.",
      );
      setPassword("");
      setIsEditing(false);
      onSaved?.();
    } catch (err: any) {
      showModal("error", "Update Failed", err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <IconLoader active={updateUserMutation.isPending || deleteUserMutation.isPending} />
      <MessageModal
        open={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        onConfirm={handleModalClose}
      />

      <MessageModal
        open={confirmDeleteOpen}
        type="warning"
        title="Delete Account?"
        message="This action will permanently delete this account and all published tabs. Are you sure you want to continue?"
        confirmText="Yes, delete"
        cancelText="Cancel"
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          handleDeleteUser();
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
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
            p: { xs: 0.5, sm: 1.5, md: 2 },
            backgroundColor: theme.palette.background.paper,
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: "100dvh", md: "90dvh" },
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
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
            <Avatar
              src={previewImg}
              alt={username}
              sx={{
                width: { xs: 88, md: 112 },
                height: { xs: 88, md: 112 },
                mb: 1,
                border: `3px solid ${isAdminRole ? "#FF9100" : "#2979FF"}`,
                boxShadow: isAdminRole
                  ? "0 0 10px 2px rgba(255,145,0,0.8)"
                  : "0 0 10px 2px rgba(41,121,255,0.8)",
                transition: "box-shadow 0.3s ease, transform 0.2s ease",
                "&:hover": {
                  boxShadow: isAdminRole
                    ? "0 0 14px 3px rgba(255,145,0,1)"
                    : "0 0 14px 3px rgba(41,121,255,1)",
                  transform: "scale(1.08)",
                },
              }}
            />

            <Box sx={{ mt: 1 }}>
              <RoleBadge role={role} />
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField
                label="Profile Image URL"
                value={profileImg}
                onChange={(e) => setProfileImg(e.target.value)}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputField
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  const nuevaFecha = e.target.value;
                  setDateOfBirth(nuevaFecha);
                  setAge(calcularEdad(nuevaFecha));
                }}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {isAdminTarget ? (
                <SelectField
                  label="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value === "ADMIN" ? "ADMIN" : "USER")}
                  options={[
                    { value: "USER", label: "User" },
                    { value: "ADMIN", label: "Admin" },
                  ]}
                  disabled={!isEditing}
                  fullWidth
                />
              ) : (
                <InputField
                  label="Age"
                  value={age ? `${age} years old` : ""}
                  onChange={() => {}}
                  fullWidth
                  disabled
                />
              )}
            </Grid>
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
                onClick={() => setConfirmDeleteOpen(true)}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              />
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
