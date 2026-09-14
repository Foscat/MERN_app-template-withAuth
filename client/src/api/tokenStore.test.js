/**
 * @module api.tokenStore.test
 * @description Focused tests for non-persistent access-token state.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";

describe("access token store", () => {
  afterEach(() => {
    clearAccessToken();
    vi.restoreAllMocks();
  });

  it("keeps access tokens in module memory without browser persistence", () => {
    const storageSpy = vi.spyOn(Storage.prototype, "setItem");

    setAccessToken("short-lived-token");

    expect(getAccessToken()).toBe("short-lived-token");
    expect(storageSpy).not.toHaveBeenCalled();

    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
