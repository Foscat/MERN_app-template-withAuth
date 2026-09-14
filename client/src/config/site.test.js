/**
 * @module config.site.test
 * @description Focused tests for configured semantic stylesheet loading.
 */

import { describe, expect, it, vi } from "vitest";
import * as siteModule from "./site";

describe("site appearance config", () => {
  it("loads only the configured style preset", async () => {
    expect(siteModule.loadConfiguredStyle).toBeTypeOf("function");
    const loadBento = vi.fn().mockResolvedValue(undefined);
    const loadMinimalSaas = vi.fn().mockResolvedValue(undefined);

    await siteModule.loadConfiguredStyle(
      { style: "bento" },
      {
        bento: loadBento,
        "minimal-saas": loadMinimalSaas,
      },
    );

    expect(loadBento).toHaveBeenCalledTimes(1);
    expect(loadMinimalSaas).not.toHaveBeenCalled();
  });
});
