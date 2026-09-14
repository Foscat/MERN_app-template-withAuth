/**
 * @module components.NavBar.test
 * @description Route-aware navigation and shared icon-size coverage.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import NavBar from "./NavBar.jsx";

vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({ logout: vi.fn(), user: null }),
}));

describe("NavBar", () => {
  it("marks the rendered route current and normalizes navigation icons", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <NavBar />
      </MemoryRouter>,
    );

    const homeLink = screen.getByRole("link", { name: /^Home$/u });
    const loginLink = screen.getByRole("link", { name: /^Log in$/u });

    expect(homeLink).not.toHaveAttribute("aria-current");
    expect(homeLink).toHaveAttribute("data-surface-level", "1");
    expect(loginLink).toHaveAttribute("aria-current", "page");
    expect(loginLink).toHaveAttribute("data-surface-level", "3");
    expect(screen.getByRole("img", { name: "MERN Forge" })).toHaveAttribute(
      "src",
      "/images/app-icon-64.png",
    );

    const navigationIcons = [
      ...container.querySelectorAll("[data-navigation-icon]"),
    ];
    expect(navigationIcons).toHaveLength(3);
    expect(
      navigationIcons.every((icon) => icon.getAttribute("width") === "18"),
    ).toBe(true);
  });
});
