/**
 * @module components.Register.test
 * @description Verifies failed register requests reach visible and surface feedback.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import Register from "./Register.jsx";
import { registerUser } from "../../../api/index.js";
vi.mock("../../../api/index.js", () => ({ registerUser: vi.fn() }));
vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({ establishSession: vi.fn() }),
}));
it("announces a rejected request and marks the submitting action with error feedback", async () => {
  registerUser.mockRejectedValue(new Error("Rejected"));
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );
  const button = screen.getByRole("button", { name: "Create Account" });
  fireEvent.submit(button.closest("form"));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Registration failed. Email may already be in use.",
  );
  expect(button).toHaveAttribute("data-surface-feedback", "error");
});
