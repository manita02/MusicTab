import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    label: "SAVE",
    variantType: "primary",
  },
};

export const Secondary: Story = {
  args: {
    label: "SIGN UP",
    variantType: "secondary",
  },
};

export const Danger: Story = {
  args: {
    label: "DELETE",
    variantType: "danger",
  },
};