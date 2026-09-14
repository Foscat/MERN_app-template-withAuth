/** @module api.sessions.test
 * @description Session APIs preserve owned identifiers and expose no credential payloads.
 */
import { expect, it, vi } from "vitest";
vi.mock("../axiosClient/axiosClient.js", () => ({
  default: {
    get: vi.fn(async () => ({ data: { sessions: [] } })),
    delete: vi.fn(async () => ({ data: {} })),
    post: vi.fn(async () => ({ data: {} })),
  },
}));
it("encodes a session identifier as a single URL segment", async () => {
  const { revokeSession } = await import("./sessions.js");
  const { default: api } = await import("../axiosClient/axiosClient.js");
  await revokeSession("device/one");
  expect(api.delete).toHaveBeenCalledWith("/users/sessions/device%2Fone");
});
