/** @module components.SeoMetadata.test
 * @description Navigation metadata must track the rendered route, including private indexing policy.
 */
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
it("sets the rendered route title and private robots policy", async () => {
  const { default: SeoMetadata } = await import("./SeoMetadata.jsx");
  render(
    <MemoryRouter initialEntries={["/settings"]}>
      <SeoMetadata />
    </MemoryRouter>,
  );
  await waitFor(() => expect(document.title).toBe("Settings | MERN Forge"));
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
});
