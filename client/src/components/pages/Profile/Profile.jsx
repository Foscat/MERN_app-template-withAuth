/**
 * @module pages.Profile
 * @description Authenticated profile overview route.
 */

import { DashboardLayout } from "../../parts/index.js";
import { Icon } from "../../parts/index.js";
import { useUser } from "../../../context/UserContext/UserContext.jsx";

/**
 * Render the authenticated user's profile summary.
 *
 * @returns {JSX.Element} Profile route.
 */
export default function Profile() {
  const { user } = useUser();

  return (
    <DashboardLayout title="My Profile">
      <section className="ly-grid">
        <article className="ui-card ly-stack ly-items-start">
          <div
            className="ui-badge"
            data-ui-variant="primary"
            aria-hidden="true"
          >
            <Icon name="user" size={34} />
          </div>
          <div>
            <span className="ui-label">Signed-in identity</span>
            <h2>{user?.email || "Authenticated user"}</h2>
            <span className="ui-badge" data-ui-variant="success">
              {user?.role || "member"}
            </span>
          </div>
        </article>
        <article className="ui-card ly-stack">
          <span className="ui-label">Account details</span>
          <dl className="ly-stack">
            <div className="ly-cluster ly-justify-between">
              <dt className="ui-help-text">Email</dt>
              <dd>{user?.email || "Not available"}</dd>
            </div>
            <div className="ly-cluster ly-justify-between">
              <dt className="ui-help-text">Role</dt>
              <dd>{user?.role || "member"}</dd>
            </div>
            <div className="ly-cluster ly-justify-between">
              <dt className="ui-help-text">Session</dt>
              <dd>Protected by JWT</dd>
            </div>
          </dl>
        </article>
      </section>
    </DashboardLayout>
  );
}
