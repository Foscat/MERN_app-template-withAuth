/**
 * @module api.axiosClient.test
 * @description Focused tests for API authorization and refresh retry decisions.
 */

import { afterEach, describe, expect, it } from "vitest";
import { attachAccessToken, shouldAttemptRefresh } from "./axiosClient.js";
import { clearAccessToken, setAccessToken } from "../tokenStore/tokenStore.js";

describe("axios client authentication", () => {
  it("shares a refresh operation and rejects completion after logout", async () => {
    const client = await import("./axiosClient.js");
    expect(typeof client.refreshSession).toBe("function");
    let finish;
    let calls = 0;
    const adapter = client.default.defaults.adapter;
    client.default.defaults.adapter = (config) => {
      calls++;
      return new Promise((resolve) => {
        finish = () =>
          resolve({
            data: { token: "late" },
            status: 200,
            headers: {},
            config,
          });
      });
    };
    try {
      const first = client.refreshSession();
      const second = client.refreshSession();
      while (!finish) await new Promise((resolve) => setTimeout(resolve, 0));
      clearAccessToken();
      finish();
      const results = await Promise.allSettled([first, second]);
      expect(calls).toBe(1);
      expect(results.every((result) => result.status === "rejected")).toBe(
        true,
      );
    } finally {
      client.default.defaults.adapter = adapter;
    }
  });
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
