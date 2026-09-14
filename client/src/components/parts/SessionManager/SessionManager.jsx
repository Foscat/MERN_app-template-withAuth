/** @module components.SessionManager
 * @description Accessible, library-styled controls for independent device sessions.
 */
import { useEffect, useState } from "react";
import {
  listSessions,
  revokeSession,
  logoutAll,
} from "../../../api/sessions/sessions.js";
import { useUser } from "../../../context/UserContext/UserContext.jsx";
/** Render safe session metadata and explicit revocation actions.
 * @returns {JSX.Element} Session controls. */
export default function SessionManager() {
  const [data, setData] = useState({ sessions: [] });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(true);
  const { clearSession } = useUser();
  useEffect(() => {
    let active = true;
    listSessions()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError("Sessions could not be loaded. Reload to retry.");
      })
      .finally(() => {
        if (active) setPending(false);
      });
    return () => {
      active = false;
    };
  }, []);
  /** Revoke one or all devices and update local state only after confirmation.
   * @param {string|null} id Target or all.
   * @returns {Promise<void>} Completion. */
  async function revoke(id) {
    setPending(true);
    setError("");
    try {
      if (id) await revokeSession(id);
      else await logoutAll();
      if (!id || id === data.currentSessionId) clearSession();
      else setData(await listSessions());
    } catch {
      setError("Revocation could not be confirmed. Please retry.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="ui-card ly-stack" aria-busy={pending}>
      <h2>Device sessions</h2>
      {error ? (
        <p className="ui-alert" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="ly-stack">
        {data.sessions.map((session) => (
          <li key={session._id} className="ly-cluster ly-justify-between">
            <span>
              {session._id === data.currentSessionId
                ? "This device"
                : "Other device"}
            </span>
            <time dateTime={session.createdAt}>
              {new Date(session.createdAt).toLocaleString()}
            </time>
            <button
              type="button"
              className="ui-button interactive-surface"
              data-surface-level="2"
              data-surface-variant="secondary"
              disabled={pending}
              onClick={() => void revoke(session._id)}
            >
              Revoke session
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="ui-button interactive-surface"
        data-surface-level="3"
        data-surface-variant="primary"
        disabled={pending}
        onClick={() => void revoke(null)}
      >
        Log out all devices
      </button>
    </section>
  );
}
