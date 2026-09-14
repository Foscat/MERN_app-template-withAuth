/**
 * @module components.AuthForm.test
 * @description Focused tests for complete and secure authentication form fields.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthForm from "./AuthForm";

describe("AuthForm", () => {
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
