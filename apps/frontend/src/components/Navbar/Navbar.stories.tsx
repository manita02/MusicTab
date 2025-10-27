import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "./Navbar";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../theme/theme";

const meta: Meta<typeof Navbar> = {
  title: "Components/Navbar",
  component: Navbar,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Navbar>;

export const LoggedOut: Story = {
  args: {
    isLoggedIn: false,
  },
};

export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
    userName: "Pepe123",
    userAvatar: "https://i.pravatar.cc/150?img=50", 
  },
};