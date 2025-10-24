import React from "react";
import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn ${variant}`}
      disabled={disabled}
      {...props}
    >
      {label}
    </button>
  );
};
