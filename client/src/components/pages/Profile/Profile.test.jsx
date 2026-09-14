/**
 * @module components.Profile.test
 * @description Focused regression coverage for the Profile component contract.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import Profile from "./Profile.jsx";
vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({
    user: { email: "alex@example.com", role: "editor" },
    logout: vi.fn(),
  }),
}));
vi.mock("../../../context/ThemeContext/ThemeContext.jsx", () => ({
  useTheme: () => ({ mode: "dark", style: "cyberpunk", toggleMode: vi.fn() }),
}));
it("shows the authenticated identity and active profile destination", () => {
  render(
    <MemoryRouter initialEntries={["/profile"]}>
      <Profile />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: "alex@example.com" }),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getAllByText("editor").length).toBeGreaterThan(0);
});
