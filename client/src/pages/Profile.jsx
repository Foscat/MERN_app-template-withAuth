/**
 * @module pages.Profile
 * @description Authenticated profile overview route.
 */

import DashboardLayout from "../layouts/DashboardLayout";
import Icon from "../components/Icon";
import { useUser } from "../context/UserContext";

/**
 * Render the authenticated user's profile summary.
 *
 * @returns {JSX.Element} Profile route.
 */
export default function Profile() {
  const { user } = useUser();

  return (
    <DashboardLayout active="profile" title="My Profile">
      <section className="ly-grid app-profile-grid">
        <article className="ui-card bento-panel ly-stack app-profile-card">
          <div className="app-profile-avatar" aria-hidden="true">
            <Icon name="user" size={34} />
          </div>
          <div>
            <span className="bento-eyebrow">Signed-in identity</span>
            <h2>{user?.email || "Authenticated user"}</h2>
            <span className="ui-badge bento-status is-success">
              {user?.role || "member"}
            </span>
          </div>
        </article>
        <article className="ui-card bento-panel ly-stack">
          <span className="bento-eyebrow">Account details</span>
          <dl className="app-detail-list">
            <div>
              <dt>Email</dt>
              <dd>{user?.email || "Not available"}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{user?.role || "member"}</dd>
            </div>
            <div>
              <dt>Session</dt>
              <dd>Protected by JWT</dd>
            </div>
          </dl>
        </article>
      </section>
    </DashboardLayout>
  );
}
