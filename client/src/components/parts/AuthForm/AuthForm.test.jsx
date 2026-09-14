/**
 * @module components.AuthForm.test
 * @description Focused tests for complete and secure authentication form fields.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthForm from "./AuthForm.jsx";

describe("AuthForm", () => {
  it("uses a valid modern HTML username pattern", () => {
    render(
      <AuthForm
        formValue={{ email: "", password: "" }}
        setFormValue={() => {}}
        onSubmit={() => {}}
        buttonLabel="Register"
        includeRegistrationFields
      />,
    );
    const pattern = new RegExp(
      screen.getByLabelText("Username").getAttribute("pattern"),
      "v",
    );
    expect(pattern.test("valid-user.name_1")).toBe(true);
  });
  it("blocks duplicate submissions while the request is pending", async () => {
    let finish;
    const onSubmit = vi.fn(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { container } = render(
      <AuthForm
        formValue={{ email: "test@example.test", password: "test-passphrase" }}
        setFormValue={() => {}}
        onSubmit={onSubmit}
        buttonLabel="Sign in"
      />,
    );
    fireEvent.submit(container.querySelector("form"));
    fireEvent.submit(container.querySelector("form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button")).toBeDisabled();
    await act(async () => finish());
    expect(screen.getByRole("button")).not.toBeDisabled();
  });
  it("renders required identity fields for registration and enforces password length", () => {
    const setFormValue = vi.fn();
    render(
      <AuthForm
        buttonLabel="Create Account"
        formValue={{
          email: "",
          name: "",
          password: "",
          username: "",
        }}
        includeRegistrationFields
        onSubmit={vi.fn()}
        passwordAutoComplete="new-password"
        setFormValue={setFormValue}
      />,
    );

    expect(screen.getByLabelText("Name")).toBeRequired();
    expect(screen.getByLabelText("Username")).toBeRequired();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "minlength",
      "12",
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { name: "name", value: "Avery Example" },
    });
    expect(setFormValue).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Avery Example" }),
    );
  });
});
