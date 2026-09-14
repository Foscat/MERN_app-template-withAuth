/**
 * @module components.Settings.test
 * @description Focused regression coverage for the Settings component contract.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import Settings from "./Settings.jsx";
import { ThemeProvider } from "../../../context/ThemeContext/ThemeContext.jsx";
vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({ user: { email: "member@example.com" }, logout: vi.fn() }),
}));
it("keeps the mode switch, action label, and persistent state in sync", () => {
  localStorage.clear();
  render(
    <ThemeProvider config={{ style: "cyberpunk", defaultMode: "dark" }}>
      <MemoryRouter initialEntries={["/settings"]}>
        <Settings />
      </MemoryRouter>
    </ThemeProvider>,
  );
  const control = screen.getByRole("switch");
  expect(control).toHaveAccessibleName("Dark interface");
  expect(control).toHaveTextContent("On");
  expect(control).toBeChecked();
  expect(control).toHaveClass("is-active");
  fireEvent.click(control);
  expect(control).not.toBeChecked();
  expect(control).not.toHaveClass("is-active");
  expect(control).toHaveTextContent("Off");
  expect(screen.getByText("Currently disabled")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Switch to dark mode" }),
  ).toHaveAttribute("aria-pressed", "false");
  localStorage.clear();
});
