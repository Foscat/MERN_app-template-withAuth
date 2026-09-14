/** @module pages.NotFound.test
 * @description Unknown routes provide an accessible recovery link instead of duplicating Home.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
it("renders a not-found heading and a home recovery link", async () => {
  const { default: NotFound } = await import("./NotFound.jsx");
  render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: "Page not found" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
    "href",
    "/",
  );
});
