/**
 * @module components.AppSidebar.test
 * @description Focused render coverage for the authenticated navigation sidebar.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({ logout: vi.fn() }),
}));

describe("AppSidebar", () => {
  it("renders every workspace destination and the logout action", async () => {
    const { default: AppSidebar } = await import("./AppSidebar.jsx");

    const { container } = render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AppSidebar />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("navigation", { name: "Workspace navigation" }),
    ).toBeInTheDocument();
    const overviewLink = screen.getByRole("link", { name: /Overview/u });
    const profileLink = screen.getByRole("link", { name: /Profile/u });

    expect(overviewLink).toHaveAttribute("aria-current", "page");
    expect(overviewLink).toHaveAttribute("data-surface-level", "3");
    expect(profileLink).toHaveAttribute("data-surface-level", "1");
    expect(screen.getByRole("link", { name: /Settings/u })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Log out/u }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "MERN Forge" })).toHaveAttribute(
      "src",
      "/images/app-icon-64.png",
    );

    const navigationIcons = [...container.querySelectorAll("nav svg")];
    expect(navigationIcons).toHaveLength(3);
    expect(
      navigationIcons.every((icon) => icon.getAttribute("width") === "18"),
    ).toBe(true);
  });
});
