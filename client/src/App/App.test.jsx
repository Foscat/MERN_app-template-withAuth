/**
 * @module App.test
 * @description Verifies the router and public component barrels compose into a working shell.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import App from "./App.jsx";
vi.mock("../context/ThemeContext/ThemeContext.jsx", () => ({
  useTheme: () => ({
    mode: "dark",
    style: "cyberpunk",
    layoutGap: "1rem",
    theme: "service-blue-red",
  }),
}));
vi.mock("../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({ user: null, loading: false }),
}));
it("opens the login page from navigation and transfers the current indicator", () => {
  window.history.replaceState({}, "", "/");
  render(<App />);
  fireEvent.click(screen.getByRole("link", { name: "Log in" }));
  expect(screen.getByRole("heading", { name: "Login" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
    "aria-current",
  );
  expect(
    screen.getByRole("link", { name: "Skip to main content" }),
  ).toHaveAttribute("href", "#main-content");
  window.history.replaceState({}, "", "/");
});
