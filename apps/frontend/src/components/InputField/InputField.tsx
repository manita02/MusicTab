import React from "react";
import { TextField } from "@mui/material";

export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  type?: string;
  fullWidth?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  error = false,
  helperText = "",
  disabled = false,
  type = "text",
  fullWidth = true,
}) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      disabled={disabled}
      type={type}
      fullWidth={fullWidth}
      variant="outlined"
      sx={{
        "& .MuiInputBase-root": {
          borderRadius: "12px",
        },
        "& .MuiInputLabel-root": {
          fontWeight: 500,
        },
      }}
    />
  );
};