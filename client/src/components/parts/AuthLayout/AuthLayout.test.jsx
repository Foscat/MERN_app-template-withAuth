/**
 * @module components.AuthLayout.test
 * @description Focused regression coverage for the AuthLayout component contract.
 */
import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import AuthLayout from "./AuthLayout.jsx";
it("keeps the form and heading together inside the authentication region", () => {
  render(
    <AuthLayout title="Account access">
      <form aria-label="Credentials">
        <input aria-label="Email" />
      </form>
    </AuthLayout>,
  );
  const main = screen.getByRole("main");
  expect(
    within(main).getByRole("heading", { name: "Account access" }),
  ).toBeVisible();
  expect(
    within(main).getByRole("form", { name: "Credentials" }),
  ).toContainElement(screen.getByLabelText("Email"));
});
