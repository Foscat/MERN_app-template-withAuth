/**
 * @module components.AppHeader.test
 * @description Focused regression coverage for the AppHeader component contract.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import AppHeader from "./AppHeader.jsx";
import { ThemeProvider } from "../../../context/ThemeContext/ThemeContext.jsx";
vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({
    user: { email: "member@example.com", role: "member" },
    logout: vi.fn(),
  }),
}));
it("updates the visible mode action and pressed state after activation", () => {
  localStorage.clear();
  render(
    <ThemeProvider config={{ style: "cyberpunk", defaultMode: "dark" }}>
      <AppHeader title="Workspace" />
    </ThemeProvider>,
  );
  const toggle = screen.getByRole("button", { name: "Switch to light mode" });
  expect(toggle).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(toggle);
  expect(
    screen.getByRole("button", { name: "Switch to dark mode" }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByText("member@example.com")).toBeVisible();
  localStorage.clear();
});
