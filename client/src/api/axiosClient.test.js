/**
 * @module api.axiosClient.test
 * @description Focused tests for API authorization and refresh retry decisions.
 */

import { afterEach, describe, expect, it } from "vitest";
import { attachAccessToken, shouldAttemptRefresh } from "./axiosClient";
import { clearAccessToken, setAccessToken } from "./tokenStore";

describe("axios client authentication", () => {
  afterEach(() => {
    clearAccessToken();
  });

  it("attaches the in-memory token without persistent storage", () => {
    setAccessToken("short-lived-token");
    const config = attachAccessToken({ headers: {} });

    expect(config.headers.Authorization).toBe("Bearer short-lived-token");
  });

  it("retries protected requests once but never recurses on auth endpoints", () => {
    expect(
      shouldAttemptRefresh({
        config: { url: "/users/current" },
        response: { status: 401 },
      }),
    ).toBe(true);
    expect(
      shouldAttemptRefresh({
        config: { url: "/users/current", _retry: true },
        response: { status: 401 },
      }),
    ).toBe(false);

    for (const url of [
      "/users/login",
      "/users/register",
      "/users/refresh",
      "/users/logout",
    ]) {
      expect(
        shouldAttemptRefresh({
          config: { url },
          response: { status: 401 },
        }),
      ).toBe(false);
    }
  });
});
