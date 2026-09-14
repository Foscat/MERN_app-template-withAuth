/**
 * @module components.DashboardLayout.test
 * @description Focused regression coverage for the DashboardLayout component contract.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import DashboardLayout from "./DashboardLayout.jsx";
vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({ user: { email: "member@example.com" }, logout: vi.fn() }),
}));
vi.mock("../../../context/ThemeContext/ThemeContext.jsx", () => ({
  useTheme: () => ({
    mode: "dark",
    style: "cyberpunk",
    theme: "service-blue-red",
    toggleMode: vi.fn(),
  }),
}));
it("exposes header, navigation, and route content in mobile reading order", () => {
  render(
    <MemoryRouter>
      <DashboardLayout title="Workspace">
        <p>Route content</p>
      </DashboardLayout>
    </MemoryRouter>,
  );
  const main = screen.getByRole("main");
  expect(main).toHaveAttribute("data-ly-recipe", "app-shell");
  expect([...main.children].map((child) => child.dataset.lyArea)).toEqual([
    "header",
    "sidebar",
    "main",
    "footer",
  ]);
  expect(
    screen.getByRole("navigation", { name: "Workspace navigation" }),
  ).toBeVisible();
  expect(screen.getByText("Route content")).toBeVisible();
});
