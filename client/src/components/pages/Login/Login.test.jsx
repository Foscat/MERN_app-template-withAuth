/**
 * @module components.Login.test
 * @description Verifies failed login requests reach visible and surface feedback.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import Login from "./Login.jsx";
import { loginUser } from "../../../api/index.js";
vi.mock("../../../api/index.js", () => ({ loginUser: vi.fn() }));
vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({ establishSession: vi.fn() }),
}));
it("announces a rejected request and marks the submitting action with error feedback", async () => {
  loginUser.mockRejectedValue(
    Object.assign(new Error("Rejected"), { response: { status: 401 } }),
  );
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
  const button = screen.getByRole("button", { name: "Log In" });
  fireEvent.submit(button.closest("form"));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Invalid credentials. Please try again.",
  );
  expect(button).toHaveAttribute("data-surface-feedback", "error");
});
