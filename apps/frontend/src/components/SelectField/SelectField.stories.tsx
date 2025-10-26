import type { Meta, StoryObj } from "@storybook/react";
import { SelectField } from "./SelectField";
import React, { useState } from "react";

const meta: Meta<typeof SelectField> = {
  title: "Components/SelectField",
  component: SelectField,
};

export default meta;
type Story = StoryObj<typeof SelectField>;

const options = [
  { value: "rock", label: "Rock" },
  { value: "jazz", label: "Jazz" },
  { value: "pop", label: "Pop" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <SelectField
        label="Musical Genre"
        value={value}
        onChange={(e) => setValue(e.target.value as string)}
        options={options}
      />
    );
  },
};

export const ErrorState: Story = {
  render: () => (
    <SelectField
      label="Genre"
      value=""
      onChange={() => {}}
      options={options}
      error
      helperText="You must select an option"
    />
  ),
};