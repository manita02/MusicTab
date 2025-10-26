import type { Meta, StoryObj } from "@storybook/react";
import { InputField } from "./InputField";
import React, { useState } from "react";

const meta: Meta<typeof InputField> = {
  title: "Components/InputField",
  component: InputField,
};

export default meta;
type Story = StoryObj<typeof InputField>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <InputField
        label="Name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your name"
      />
    );
  },
};

export const ErrorState: Story = {
  render: () => (
    <InputField
      label="Email"
      value=""
      onChange={() => {}}
      error
      helperText="Field is required"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <InputField
      label="Username"
      value="Pepe123"
      onChange={() => {}}
      disabled
    />
  ),
};