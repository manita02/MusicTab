import { render, screen, fireEvent, within } from "@testing-library/react";
import { Navbar } from "./Navbar";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../theme/theme";
import { MemoryRouter } from "react-router-dom";

describe("Navbar component", () => {
  const renderNavbar = (props = {}) => {
    const defaultProps = { isLoggedIn: false, userName: "" };
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <Navbar {...defaultProps} {...props} />
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  test("renders the logo correctly", () => {
    renderNavbar();
    const logo = screen.getByTestId("navbar-logo");
    expect(logo).toBeInTheDocument();
    expect(screen.getByText(/MusicTab/i)).toBeVisible();
  });

  test("shows user menu when logged in", () => {
    renderNavbar({ isLoggedIn: true, userName: "Pepe123" });
    const avatarButton = screen.getByLabelText(/Pepe123 menu/i);
    expect(avatarButton).toBeInTheDocument();

    fireEvent.click(avatarButton);
    const menu = screen.getByRole("menu");
    expect(within(menu).getByText(/Update User/i)).toBeVisible();
    expect(within(menu).getByText(/Log Out/i)).toBeVisible();
  });

  test("shows login options when not logged in", () => {
    renderNavbar({ isLoggedIn: false });
    const accountButton = screen.getByLabelText(/Account menu/i);
    expect(accountButton).toBeInTheDocument();

    fireEvent.click(accountButton);
    const menu = screen.getByRole("menu");
    expect(within(menu).getByText(/Sign Up/i)).toBeVisible();
    expect(within(menu).getByText(/Login/i)).toBeVisible();
  });

  test("opens and closes the navigation menu", () => {
    renderNavbar();
    const navButton = screen.getByLabelText(/Navigation menu/i);
    fireEvent.click(navButton);
    const mobileMenu = screen.getByTestId("mobile-menu");
    expect(within(mobileMenu).getByText(/HOME/i)).toBeVisible();
    expect(within(mobileMenu).getByText(/HOW IT WORKS/i)).toBeVisible();
    expect(within(mobileMenu).getByText(/TABS/i)).toBeVisible();
    fireEvent.click(navButton);
  });
});
