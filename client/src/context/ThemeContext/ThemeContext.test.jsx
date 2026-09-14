/**
 * @module context.ThemeContext.test
 * @description Appearance configuration and browser-default mode tests.
 */

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext.jsx";

/** Render the active mode exposed by the theme provider. */
function ModeProbe() {
  const { mode } = useTheme();
  return <output aria-label="active mode">{mode}</output>;
}

describe("ThemeProvider", () => {
  it("continues rendering when browser storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    try {
      render(
        <ThemeProvider>
          <ModeProbe />
        </ThemeProvider>,
      );
      expect(screen.getByLabelText("active mode")).toBeInTheDocument();
    } finally {
      vi.restoreAllMocks();
    }
  });
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-ui");
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-mode");
    document.body.style.removeProperty("--ly-profile-gap");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the browser color preference when no default mode is configured", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));

    render(
      <ThemeProvider config={{ style: "bento", theme: "service-blue-red" }}>
        <ModeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("active mode")).toHaveTextContent("light");
  });

  it("tracks browser preference changes while system mode remains active", () => {
    let colorSchemeListener;
    const colorSchemeQuery = {
      addEventListener(eventName, listener) {
        if (eventName === "change") {
          colorSchemeListener = listener;
        }
      },
      matches: false,
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(colorSchemeQuery));

    render(
      <ThemeProvider
        config={{
          defaultMode: "system",
          style: "bento",
          theme: "service-blue-red",
        }}
      >
        <ModeProbe />
      </ThemeProvider>,
    );

    expect(colorSchemeListener).toBeTypeOf("function");
    act(() => {
      colorSchemeQuery.matches = true;
      colorSchemeListener({ matches: true });
    });

    expect(screen.getByLabelText("active mode")).toHaveTextContent("dark");
  });

  it("applies configured style, theme, and default mode", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));

    render(
      <ThemeProvider
        config={{
          defaultMode: "dark",
          layoutGap: "1.5rem",
          style: "minimal-saas",
          theme: "arctic-indigo",
        }}
      >
        <ModeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("active mode")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute("data-ui", "minimal-saas");
    expect(document.documentElement).toHaveAttribute(
      "data-theme",
      "arctic-indigo",
    );
    expect(document.documentElement).toHaveAttribute("data-mode", "dark");
    expect(document.body.style.getPropertyValue("--ly-profile-gap")).toBe(
      "1.5rem",
    );
  });
});
