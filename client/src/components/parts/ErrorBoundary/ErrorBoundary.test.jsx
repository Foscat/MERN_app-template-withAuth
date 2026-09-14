/** @module components.ErrorBoundary.test
 * @description Rendering failures leave an accessible recovery action.
 */
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
/** Trigger a descendant render failure.
 * @returns {never} Always throws.
 */
function Broken() {
  throw new Error("fixture failure");
}
it("replaces a failed subtree with a reload action", async () => {
  const { default: ErrorBoundary } = await import("./ErrorBoundary.jsx");
  const diagnostic = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Reload");
  } finally {
    diagnostic.mockRestore();
  }
});
