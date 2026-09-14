/**
 * @module components.Home.test
 * @description Focused regression coverage for the Home component contract.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import Home from "./Home.jsx";
it("offers a primary workspace action and a secondary registration action", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
  const workspace = screen.getByRole("link", { name: "Open workspace" });
  const registration = screen.getByRole("link", { name: "Create account" });
  expect(workspace).toHaveAttribute("href", "/dashboard");
  expect(workspace).toHaveAttribute("data-surface-level", "3");
  expect(registration).toHaveAttribute("href", "/register");
  expect(registration).toHaveAttribute("data-surface-level", "2");
});
