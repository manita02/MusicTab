import React, { useState } from "react";
import { Tooltip } from "@mui/material";
import type { ButtonProps as MUIButtonProps } from "@mui/material/Button";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Button } from "../Button/Button";
import { TabCaptureStudioDialog } from "../../dialogs/TabCaptureStudioDialog";
import { useAuth } from "../../api/hooks/useAuth";
import {
  canUseTabCaptureStudio,
  normalizeRole,
  tabCaptureStudioTooltip,
} from "../../auth/tabPermissions";

type CaptureTabPdfButtonProps = {
  variantType?: "primary" | "secondary" | "danger";
  sx?: MUIButtonProps["sx"];
};

export const CaptureTabPdfButton: React.FC<CaptureTabPdfButtonProps> = ({
  variantType = "secondary",
  sx,
}) => {
  const { isLoggedIn, userRole } = useAuth();
  const role = normalizeRole(userRole);
  const canUse = canUseTabCaptureStudio(isLoggedIn, role);
  const tooltip = tabCaptureStudioTooltip(isLoggedIn, role);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={tooltip} arrow>
        <span>
          <Button
            label="Capture tab PDF"
            variantType={variantType}
            startIcon={<PictureAsPdfIcon />}
            sx={sx}
            onClick={() => setOpen(true)}
            disabled={!canUse}
          />
        </span>
      </Tooltip>
      <TabCaptureStudioDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
