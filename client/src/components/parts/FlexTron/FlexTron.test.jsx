/**
 * @module components.FlexTron.test
 * @description Focused regression coverage for the FlexTron component contract.
 */
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import FlexTron from "./FlexTron.jsx";
it("keeps content, media, and actions in recipe regions when wide media is reversed", () => {
  const { container } = render(
    <FlexTron title="Build something" image="/example.png" reverse gap={24}>
      <a href="/start">Start</a>
    </FlexTron>,
  );
  const hero = container.firstElementChild;
  expect(
    screen.getByRole("heading", { name: "Build something" }),
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: "Start" }).parentElement,
  ).toHaveAttribute("data-ly-area", "actions");
  expect(hero.querySelector('[data-ly-area="media"] img')).toHaveAttribute(
    "src",
    "/example.png",
  );
  expect(hero.style.getPropertyValue("--ly-split-hero-wide-areas")).toBe(
    '"media content" "media actions"',
  );
  expect(hero.style.getPropertyValue("--ly-gap")).toBe("24px");
});
