/**
 * @module context.UserContext.test
 * @description Focused tests for refresh-cookie session restoration and logout.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api/axiosClient";
import { clearAccessToken, getAccessToken } from "../api/tokenStore";
import { UserProvider, useUser } from "./UserContext";

vi.mock("../api/axiosClient", () => ({
  default: { post: vi.fn() },
}));

/** Render observable authentication state and actions for provider tests. */
function SessionProbe() {
  const { loading, logout, user } = useUser();

  return (
    <div>
      <span>{loading ? "loading" : user?.email || "anonymous"}</span>
      <button type="button" onClick={() => void logout()}>
        Log out
      </button>
    </div>
  );
}

describe("UserProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearAccessToken();
  });

  it("restores a session through the protected refresh cookie", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        token: "rotated-access-token",
        user: { id: "user-1", email: "user@example.com", role: "user" },
      },
    });

    render(
      <StrictMode>
        <UserProvider>
          <SessionProbe />
        </UserProvider>
      </StrictMode>,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(await screen.findByText("user@example.com")).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith("/users/refresh");
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBe("rotated-access-token");
  });

  it("clears memory and state when logout completes", async () => {
    api.post
      .mockResolvedValueOnce({
        data: {
          token: "rotated-access-token",
          user: { id: "user-1", email: "user@example.com", role: "user" },
        },
      })
      .mockResolvedValueOnce({ data: { message: "Logged out" } });

    render(
      <UserProvider>
        <SessionProbe />
      </UserProvider>,
    );
    await screen.findByText("user@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() =>
      expect(screen.getByText("anonymous")).toBeInTheDocument(),
    );
    expect(api.post).toHaveBeenLastCalledWith("/users/logout");
    expect(getAccessToken()).toBeNull();
  });
});
