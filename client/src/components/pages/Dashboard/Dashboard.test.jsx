/**
 * @module components.Dashboard.test
 * @description Focused regression coverage for the Dashboard component contract.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import Dashboard from "./Dashboard.jsx";
vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({ user: { email: "member@example.com" }, logout: vi.fn() }),
}));
vi.mock("../../../context/ThemeContext/ThemeContext.jsx", () => ({
  useTheme: () => ({ mode: "dark", style: "cyberpunk", toggleMode: vi.fn() }),
}));
it("renders the overview within the protected workspace shell", () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Dashboard />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  expect(
    screen.getByRole("region", { name: "System status" }),
  ).toHaveTextContent("Auth flow");
  expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
