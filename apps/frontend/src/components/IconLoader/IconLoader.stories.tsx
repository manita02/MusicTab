import type { Meta, StoryObj } from "@storybook/react";
import { IconLoader } from "./IconLoader";

const meta: Meta<typeof IconLoader> = {
  title: "Components/IconLoader",
  component: IconLoader,
};

export default meta;
type Story = StoryObj<typeof IconLoader>;

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Inactive: Story = {
  args: {
    active: false,
  },
};
