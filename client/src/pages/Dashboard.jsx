/**
 * @module pages.Dashboard
 * @description Authenticated Bento dashboard overview.
 */

import DashboardLayout from "../layouts/DashboardLayout";
import Icon from "../components/Icon";

const DASHBOARD_METRICS = [
  {
    label: "Auth flow",
    value: "Ready",
    detail: "Access + refresh tokens",
    status: "is-success",
  },
  {
    label: "UI system",
    value: "3 layers",
    detail: "Structure, paint, states",
    status: "is-info",
  },
  {
    label: "Runtime",
    value: "React 18",
    detail: "Vite application client",
    status: "is-violet",
  },
];

/**
 * Render the starter dashboard and implementation status cards.
 *
 * @returns {JSX.Element} Dashboard route.
 */
export default function Dashboard() {
  return (
    <DashboardLayout active="dashboard" title="Dashboard">
      <section className="ui-card bento-panel bento-system app-dashboard-hero ly-stack">
        <span className="bento-eyebrow">Workspace overview</span>
        <h2>Your application foundation is online.</h2>
        <p>
          Replace these starter modules with product data while keeping the
          responsive shell and semantic component contracts intact.
        </p>
      </section>

      <section className="ly-grid app-metric-grid" aria-label="System status">
        {DASHBOARD_METRICS.map((metric) => (
          <article
            className="ui-card bento-panel ly-stack app-metric"
            key={metric.label}
          >
            <div className="ly-cluster app-metric__heading">
              <span className={`ui-badge bento-status ${metric.status}`}>
                {metric.label}
              </span>
              <Icon name="activity" size={18} />
            </div>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </article>
        ))}
      </section>

      <section className="ui-card bento-panel ly-stack app-activity-panel">
        <header className="ly-cluster app-panel-heading">
          <div>
            <span className="bento-eyebrow">Next steps</span>
            <h2>Shape the starter around your product</h2>
          </div>
          <span className="ui-badge bento-status is-warning">
            Template content
          </span>
        </header>
        <div className="ly-stack app-checklist">
          <div>
            <span>01</span>
            <p>Connect domain models and route authorization.</p>
          </div>
          <div>
            <span>02</span>
            <p>Replace overview cards with live application metrics.</p>
          </div>
          <div>
            <span>03</span>
            <p>Add focused tests for each product behavior.</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
