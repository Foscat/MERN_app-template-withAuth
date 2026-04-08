/**
 * @module components.ProtectedRoute.test
 * @description Test module covering ProtectedRoute authentication behavior.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { useUser } from "../context/UserContext";

vi.mock("../context/UserContext", () => ({
  useUser: vi.fn(),
}));

function renderProtectedRoute(props = {}) {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute {...props}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing while auth state is loading", () => {
    useUser.mockReturnValue({ user: null, loading: true });

    const { container } = renderProtectedRoute();
    expect(container).toBeEmptyDOMElement();
  });

  it("redirects unauthenticated users to login", () => {
    useUser.mockReturnValue({ user: null, loading: false });

    renderProtectedRoute();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects authenticated users without required role", () => {
    useUser.mockReturnValue({
      user: { email: "user@example.com", role: "user" },
      loading: false,
    });

    renderProtectedRoute({ allowedRoles: ["admin"] });
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("renders children for authorized users", () => {
    useUser.mockReturnValue({
      user: { email: "admin@example.com", role: "admin" },
      loading: false,
    });

    renderProtectedRoute({ allowedRoles: ["admin"] });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
