/**
 * @module components.TextCard.test
 * @description Focused regression coverage for the TextCard component contract.
 */
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import TextCard from "./TextCard.jsx";
it("preserves card content and routes its optional width through the layout contract", () => {
  render(
    <TextCard title="Account" subtitle="Your workspace" width={480}>
      <a href="/profile">View profile</a>
    </TextCard>,
  );
  expect(screen.getByRole("heading", { name: "Account" })).toBeVisible();
  expect(screen.getByText("Your workspace")).toBeVisible();
  expect(screen.getByRole("link", { name: "View profile" })).toHaveAttribute(
    "href",
    "/profile",
  );
  expect(
    screen.getByRole("article").style.getPropertyValue("--ly-wrapper-prose"),
  ).toBe("480px");
});
