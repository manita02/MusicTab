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