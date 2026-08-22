import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

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
  isSearch?: boolean;
  onSearch?: () => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
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
  isSearch = false,
  onSearch,
  onPaste,
  onDrop,
  onBlur,
}) => {
  const preventDropOver = onDrop
    ? (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();
      }
    : undefined;

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
      onPaste={onPaste}
      onDrop={onDrop}
      onDragOver={preventDropOver}
      onBlur={onBlur}
      slotProps={{
        htmlInput: {
          onPaste,
          onDrop,
          onDragOver: preventDropOver,
        },
      }}
      InputProps={{
        endAdornment: isSearch && onSearch ? (
          <InputAdornment position="end">
            <IconButton onClick={onSearch} edge="end">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
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
