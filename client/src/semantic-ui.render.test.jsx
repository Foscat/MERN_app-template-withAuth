/**
 * @module semantic-ui.render.test
 * @description Rendered contract coverage for preset-independent semantic components.
 */

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import {
  AppHeader,
  AppSidebar,
  AuthForm,
  FlexTron,
  NavBar,
  TextCard,
  AuthLayout,
} from "./components/parts/index.js";
import {
  Dashboard,
  Home,
  Profile,
  Settings,
} from "./components/pages/index.js";

vi.mock("./context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({
    logout: vi.fn(),
    user: { email: "member@example.com", role: "member" },
  }),
}));

vi.mock("./context/ThemeContext/ThemeContext.jsx", () => ({
  useTheme: () => ({
    mode: "dark",
    style: "cyberpunk",
    theme: "service-blue-red",
    toggleMode: vi.fn(),
  }),
}));

const PRESET_CLASS_PATTERN =
  /^(?:bau|bento|blueprint|brutal|clay|cyber|deco|luxe|max|neo|noir|organic|paper|retro|rg|saas|tactile|terminal|utility|y2k)-/u;

/**
 * Render every reusable component family in one router boundary.
 *
 * @returns {HTMLElement} Rendered container.
 */
function renderSemanticSurface() {
  const { container } = render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <NavBar />
      <FlexTron title="Semantic hero">Hero action</FlexTron>
      <TextCard title="Semantic card">Card content</TextCard>
      <Home />
      <AuthLayout title="Access">Authentication content</AuthLayout>
      <AuthForm
        buttonLabel="Continue"
        error="Example error"
        formValue={{ email: "", password: "" }}
        onSubmit={vi.fn()}
        setFormValue={vi.fn()}
      />
      <AppSidebar active="dashboard" />
      <AppHeader title="Workspace" />
      <Dashboard />
      <Profile />
      <Settings />
    </MemoryRouter>,
  );

  return container;
}

describe("rendered semantic UI", () => {
  it("gives every interactive surface an explicit semantic variant and depth", () => {
    const container = renderSemanticSurface();
    const interactiveSurfaces = [
      ...container.querySelectorAll(".interactive-surface"),
    ];
    const invalidSurfaces = interactiveSurfaces.filter((surface) => {
      const level = surface.getAttribute("data-surface-level");
      const variant = surface.getAttribute("data-surface-variant");

      return !["1", "2", "3"].includes(level) || !variant;
    });
    const renderedLevels = new Set(
      interactiveSurfaces.map((surface) =>
        surface.getAttribute("data-surface-level"),
      ),
    );

    expect(interactiveSurfaces.length).toBeGreaterThan(0);
    expect(invalidSurfaces).toEqual([]);
    expect(renderedLevels).toEqual(new Set(["1", "2", "3"]));
  });

  it("exposes persistent and outcome state through Interactive Surface hooks", () => {
    const container = renderSemanticSurface();
    const feedbackSurfaces = [
      ...container.querySelectorAll(
        '.interactive-surface[data-surface-feedback="error"]',
      ),
    ];
    const modeButtons = [
      ...container.querySelectorAll(
        'button[aria-label="Switch to light mode"]',
      ),
    ];
    const modeSwitches = [
      ...container.querySelectorAll('[role="switch"][aria-checked="true"]'),
    ];

    expect(feedbackSurfaces.length).toBeGreaterThan(0);
    expect(
      feedbackSurfaces.every(
        (surface) =>
          surface.getAttribute("data-surface-level") === "3" &&
          surface.getAttribute("data-surface-variant") === "primary",
      ),
    ).toBe(true);
    expect(modeButtons.length).toBeGreaterThan(0);
    expect(
      modeButtons.every(
        (button) => button.getAttribute("aria-pressed") === "true",
      ),
    ).toBe(true);
    expect(modeSwitches.length).toBeGreaterThan(0);
    expect(
      modeSwitches.every((control) => control.classList.contains("is-active")),
    ).toBe(true);
  });

  it("uses only preset-independent component hooks across the application", () => {
    const container = renderSemanticSurface();
    const classTokens = [...container.querySelectorAll("[class]")].flatMap(
      (element) => [...element.classList],
    );
    const presetClasses = [
      ...new Set(
        classTokens.filter((className) => PRESET_CLASS_PATTERN.test(className)),
      ),
    ].sort();
    const applicationClasses = [
      ...new Set(
        classTokens.filter((className) => className.startsWith("app-")),
      ),
    ].sort();

    expect(presetClasses).toEqual([]);
    expect(applicationClasses).toEqual([]);
    for (const selector of [
      ".ui-alert",
      ".ui-badge",
      ".ui-button",
      ".ui-card",
      ".ui-field",
      ".ui-icon-button",
      ".ui-input",
      ".ui-label",
      ".ui-nav",
      ".ui-nav-link",
      ".ui-switch",
      ".ui-toolbar",
    ]) {
      expect(container.querySelector(selector), selector).not.toBeNull();
    }

    const semanticStatusBadges = [...container.querySelectorAll(".ui-badge")];
    expect(semanticStatusBadges.length).toBeGreaterThan(0);
    expect(
      semanticStatusBadges.every((badge) =>
        badge.hasAttribute("data-ui-variant"),
      ),
    ).toBe(true);
  });
});
