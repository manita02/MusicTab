import React from "react";
import ButtonMUI from "@mui/material/Button";
import type { ButtonProps as MUIButtonProps } from "@mui/material/Button";

type MusicButtonProps = MUIButtonProps & {
  variantType?: "primary" | "secondary" | "danger";
  label: string;
};

export const Button: React.FC<MusicButtonProps> = ({
  label,
  variantType = "primary",
  ...props
}) => {
  let color: MUIButtonProps["color"] = "primary";

  if (variantType === "secondary") color = "secondary";
  if (variantType === "danger") color = "warning";

  return (
    <ButtonMUI
      variant="contained"
      color={color}
      {...props}
      sx={{
        "&:hover": {
          fontWeight: "bold",
        },
      }}
    >
      {label}
    </ButtonMUI>
  );
};