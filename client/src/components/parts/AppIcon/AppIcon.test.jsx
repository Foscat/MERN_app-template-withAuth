/**
 * @module components.AppIcon.test
 * @description Focused regression coverage for the AppIcon component contract.
 */
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import AppIcon from "./AppIcon.jsx";
it("renders the shared brand artwork with a stable accessible name and size", () => {
  render(<AppIcon size={48} />);
  const icon = screen.getByRole("img", { name: "MERN Forge" });
  expect(icon).toHaveAttribute("src", "/images/app-icon-64.png");
  expect(icon).toHaveAttribute("width", "48");
  expect(icon).toHaveAttribute("height", "48");
});
