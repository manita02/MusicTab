import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "./Navbar";

describe("Navbar component", () => {
  const renderNavbar = (props = {}) => {
    const defaultProps = { isLoggedIn: false, username: "" };
    render(<Navbar {...defaultProps} {...props} />);
  };

  test("renders the logo correctly", () => {
    renderNavbar();
    const logo = screen.getByText(/MusicTab/i);
    expect(logo).toBeInTheDocument();
  });

  test("shows user menu when logged in", () => {
    renderNavbar({ isLoggedIn: true, username: "Pepe123" });

    const avatar = screen.getByRole("button", { name: /user/i });
    expect(avatar).toBeInTheDocument();

    fireEvent.mouseOver(avatar);
  });

  test("shows login options when not logged in", () => {
    renderNavbar({ isLoggedIn: false });

    const accountButton = screen.getByRole("button", { name: /account/i });
    expect(accountButton).toBeInTheDocument();

    fireEvent.mouseOver(accountButton);
  });

  test("opens and closes the navigation menu", () => {
    renderNavbar();

    const menuButton = screen.getByLabelText(/account/i);
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);
  });
});
