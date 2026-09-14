/** @module components.SessionManager.test
 * @description Session controls render loaded device metadata and revocation actions.
 */
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
vi.mock("../../../api/sessions/sessions.js", () => ({
  listSessions: async () => ({
    sessions: [{ _id: "device-one", createdAt: "2026-09-14T00:00:00Z" }],
    currentSessionId: "device-one",
  }),
  revokeSession: vi.fn(),
  logoutAll: vi.fn(),
}));
vi.mock("../../../context/UserContext/UserContext.jsx", () => ({
  useUser: () => ({ clearSession: vi.fn() }),
}));
it("labels the current device and offers explicit revocation", async () => {
  const { default: SessionManager } = await import("./SessionManager.jsx");
  render(<SessionManager />);
  expect(await screen.findByText("This device")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Revoke session" })).toBeEnabled();
});
