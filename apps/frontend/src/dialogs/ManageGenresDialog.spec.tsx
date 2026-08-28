import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManageGenresDialog } from "./ManageGenresDialog";
import { theme } from "../theme/theme";

const createGenre = vi.fn();
const updateGenre = vi.fn();
const deleteGenre = vi.fn();

vi.mock("../api/hooks/useCatalog", () => ({
  useGenres: () => ({
    data: [
      { id: 2, name: "Rock" },
      { id: 1, name: "Jazz" },
    ],
    isLoading: false,
  }),
  useCreateGenre: () => ({ mutate: createGenre, isPending: false }),
  useUpdateGenre: () => ({ mutate: updateGenre, isPending: false }),
  useDeleteGenre: () => ({ mutate: deleteGenre, isPending: false }),
}));

function renderDialog(onCreated = vi.fn()) {
  return render(
    <ThemeProvider theme={theme}>
      <ManageGenresDialog open onClose={() => {}} onCreated={onCreated} />
    </ThemeProvider>,
  );
}

describe("ManageGenresDialog", () => {
  beforeEach(() => {
    createGenre.mockReset();
    updateGenre.mockReset();
    deleteGenre.mockReset();
  });

  it("lists genres sorted by name", () => {
    renderDialog();
    expect(screen.getByText("Manage genres")).toBeInTheDocument();
    const names = screen.getAllByText(/Jazz|Rock/).map((el) => el.textContent);
    expect(names.indexOf("Jazz")).toBeLessThan(names.indexOf("Rock"));
  });

  it("adds a genre from the form", () => {
    const onCreated = vi.fn();
    renderDialog(onCreated);

    fireEvent.change(screen.getByLabelText("New genre"), { target: { value: "Cumbia" } });
    fireEvent.click(screen.getByRole("button", { name: /^Add$/i }));

    expect(createGenre).toHaveBeenCalledWith({ name: "Cumbia" }, expect.any(Object));
  });

  it("asks for confirmation before deleting", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Delete Jazz" }));
    expect(screen.getByText(/Delete "Jazz"/)).toBeInTheDocument();
    expect(deleteGenre).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
    expect(deleteGenre).toHaveBeenCalledWith(1, expect.any(Object));
  });
});
