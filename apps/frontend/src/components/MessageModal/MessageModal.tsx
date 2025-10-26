import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Alert,
  Divider,
  Box,
  useTheme,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { Button } from "../Button/Button";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface MessageModalProps {
  open: boolean;
  type?: "success" | "error" | "warning";
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  open,
  type = "success",
  title = "Operation completed",
  message = "The action was completed successfully.",
  confirmText = "Accept",
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();
  const borderColor =
    type === "success"
      ? theme.palette.success.main
      : type === "warning"
      ? theme.palette.warning.main
      : theme.palette.error.main;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && type === "error") {
      onCancel?.();
    }
  };

  React.useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, type]);

  const showCancel = type !== "error" && cancelText;

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={type === "error" ? undefined : onCancel}
      aria-describedby="alert-dialog-slide-description"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(0, 0, 0, 0.25)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          textAlign: "center",
          pb: 1,
        }}
      >
        {title}
        <Divider
          sx={{
            mt: 1,
            width: "60%",
            mx: "auto",
            borderWidth: 2,
            borderColor: borderColor,
            borderRadius: 2,
          }}
        />
      </DialogTitle>

      <DialogContent>
        <Box display="flex" justifyContent="center" mt={1}>
          <Alert
            severity={type}
            variant="filled"
            sx={{
              width: "100%",
              borderRadius: "12px",
              color: "white",
              "& .MuiAlert-icon": {
                color: "inherit",
              },
            }}
          >
            {message}
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        {type === "warning" ? (
          <>
            <Button
              variantType="primary"
              onClick={onConfirm}
              label={confirmText}
            />
            {showCancel && (
              <Button
                variantType="secondary"
                onClick={onCancel}
                label={cancelText}
              />
            )}
          </>
        ) : (
          <>
            {showCancel && (
              <Button
                variantType="secondary"
                onClick={onCancel}
                label={cancelText}
              />
            )}
            <Button
              variantType={type === "error" ? "danger" : "primary"}
              onClick={onConfirm}
              label={confirmText}
            />
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};