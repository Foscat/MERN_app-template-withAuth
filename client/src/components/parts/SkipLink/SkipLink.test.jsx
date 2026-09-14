/**
 * @module components.SkipLink.test
 * @description Ensures the accessibility helper follows the active preset.
 */
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import SkipLink from "./SkipLink.jsx";
import { useTheme } from "../../../context/ThemeContext/ThemeContext.jsx";

vi.mock("../../../context/ThemeContext/ThemeContext.jsx", () => ({
  useTheme: vi.fn(),
}));

it("selects the library skip-link helper when the configured style changes", () => {
  useTheme.mockReturnValue({ style: "cyberpunk" });
  const { rerender } = render(<SkipLink />);
  const link = screen.getByRole("link", { name: "Skip to main content" });
  expect(link).toHaveAttribute("href", "#main-content");
  expect(link).toHaveClass("cyber-skip-link");
  useTheme.mockReturnValue({ style: "bento" });
  rerender(<SkipLink />);
  expect(link).toHaveClass("bento-skip-link");
  expect(link).not.toHaveClass("cyber-skip-link");
});
