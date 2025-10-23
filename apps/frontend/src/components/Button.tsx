import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'red',
        color: '#fff',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        ...props.style,
      }}
    >
      {children}
    </button>
  );
};