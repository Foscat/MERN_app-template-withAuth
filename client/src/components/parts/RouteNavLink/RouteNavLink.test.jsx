/**
 * @module components.RouteNavLink.test
 * @description Focused regression coverage for the RouteNavLink component contract.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import RouteNavLink from "./RouteNavLink.jsx";
it("moves current-route emphasis when the user changes destination", () => {
  render(
    <MemoryRouter initialEntries={["/profile"]}>
      <RouteNavLink to="/profile">Profile</RouteNavLink>
      <RouteNavLink to="/settings">Settings</RouteNavLink>
    </MemoryRouter>,
  );
  const profile = screen.getByRole("link", { name: "Profile" });
  const settings = screen.getByRole("link", { name: "Settings" });
  expect(profile).toHaveAttribute("aria-current", "page");
  expect(settings).toHaveAttribute("data-surface-level", "1");
  fireEvent.click(settings);
  expect(settings).toHaveAttribute("aria-current", "page");
  expect(settings).toHaveAttribute("data-surface-level", "3");
  expect(profile).not.toHaveAttribute("aria-current");
  expect(profile).toHaveAttribute("data-surface-level", "1");
});
