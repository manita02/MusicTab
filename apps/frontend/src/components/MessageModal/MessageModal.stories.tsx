import type { Meta, StoryObj } from "@storybook/react";
import { MessageModal } from "./MessageModal";

const meta: Meta<typeof MessageModal> = {
  title: "Components/MessageModal",
  component: MessageModal,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof MessageModal>;

export const Success: Story = {
  args: {
    open: true,
    type: "success",
    title: "SUCCESSFUL OPERATION",
    message: "The data was saved successfully.",
    confirmText: "ACCEPT",
  },
};

export const Warning: Story = {
  args: {
    open: true,
    type: "warning",
    title: "WARNING",
    message: "You are about to delete important data.",
    confirmText: "CONTINUE",
    cancelText: "CANCEL",
  },
};

export const Error: Story = {
  args: {
    open: true,
    type: "error",
    title: "CRITICAL ERROR",
    message: "The action could not be completed.",
    confirmText: "ACCEPT",
  },
};