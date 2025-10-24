import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import React from 'react';

const CenterDecorator: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    {children}
  </div>
);

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story) => (
      <CenterDecorator>
        <Story />
      </CenterDecorator>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { label: 'Save', variant: 'primary' },
};

export const Secondary: Story = {
  args: { label: 'Sign Up', variant: 'secondary' },
};

export const Danger: Story = {
  args: { label: 'Delete', variant: 'danger' },
};

export const DisabledPrimary: Story = {
  args: {
    label: "Save",
    variant: "primary",
    disabled: true,
  },
};

export const DisabledSecondary: Story = {
  args: {
    label: "Sign Up",
    variant: "secondary",
    disabled: true,
  },
};

export const DisabledDanger: Story = {
  args: {
    label: "Delete",
    variant: "danger",
    disabled: true,
  },
};