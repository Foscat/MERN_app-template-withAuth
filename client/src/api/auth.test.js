/**
 * @module api.auth.test
 * @description Test module for client behavior verification.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginUser, registerUser } from "./auth";
import api from "./axiosClient";

vi.mock("./axiosClient", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("auth api helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loginUser posts to /users/login and returns response data", async () => {
    const payload = { email: "user@example.com", password: "test1234" };
    api.post.mockResolvedValueOnce({ data: { token: "access-token" } });

    await expect(loginUser(payload)).resolves.toEqual({ token: "access-token" });
    expect(api.post).toHaveBeenCalledWith("/users/login", payload);
  });

  it("registerUser posts to /users/register and returns response data", async () => {
    const payload = {
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      password: "test1234",
    };
    api.post.mockResolvedValueOnce({ data: { token: "access-token" } });

    await expect(registerUser(payload)).resolves.toEqual({ token: "access-token" });
    expect(api.post).toHaveBeenCalledWith("/users/register", payload);
  });
});
