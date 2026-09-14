/**
 * @module components.Icon.test
 * @description Focused regression coverage for the Icon component contract.
 */
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import Icon from "./Icon.jsx";
it("falls back to a decorative activity glyph for an unknown icon", () => {
  const { container, rerender } = render(
    <Icon name="unknown" navigation size={18} />,
  );
  const icon = container.querySelector("svg");
  const fallbackPath = icon.querySelector("path").getAttribute("d");
  expect(icon).toHaveAttribute("aria-hidden", "true");
  expect(icon).toHaveAttribute("width", "18");
  expect(icon).toHaveAttribute("data-navigation-icon", "true");
  rerender(<Icon name="activity" />);
  expect(container.querySelector("path")).toHaveAttribute("d", fallbackPath);
});
