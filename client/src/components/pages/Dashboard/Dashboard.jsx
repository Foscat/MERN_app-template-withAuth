/**
 * @module pages.Dashboard
 * @description Authenticated semantic dashboard overview.
 */

import { DashboardLayout } from "../../parts/index.js";
import { Icon } from "../../parts/index.js";

const DASHBOARD_METRICS = [
  {
    label: "Auth flow",
    value: "Ready",
    detail: "Access + refresh tokens",
    variant: "success",
  },
  {
    label: "UI system",
    value: "3 layers",
    detail: "Structure, paint, states",
    variant: "secondary",
  },
  {
    label: "Runtime",
    value: "React 18",
    detail: "Vite application client",
    variant: "primary",
  },
];

/**
 * Render the starter dashboard and implementation status cards.
 *
 * @returns {JSX.Element} Dashboard route.
 */
export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <section className="ui-card ly-stack">
        <span className="ui-label">Workspace overview</span>
        <h2>Your application foundation is online.</h2>
        <p>
          Replace these starter modules with product data while keeping the
          responsive shell and semantic component contracts intact.
        </p>
      </section>

      <section className="ly-grid" aria-label="System status">
        {DASHBOARD_METRICS.map((metric) => (
          <article className="ui-card ly-stack" key={metric.label}>
            <div className="ly-cluster ly-justify-between">
              <span className="ui-badge" data-ui-variant={metric.variant}>
                {metric.label}
              </span>
              <Icon name="activity" size={18} />
            </div>
            <strong>{metric.value}</strong>
            <small className="ui-help-text">{metric.detail}</small>
          </article>
        ))}
      </section>

      <section className="ui-card ly-stack">
        <header className="ly-cluster ly-justify-between">
          <div>
            <span className="ui-label">Next steps</span>
            <h2>Shape the starter around your product</h2>
          </div>
          <span className="ui-badge" data-ui-variant="warning">
            Template content
          </span>
        </header>
        <div className="ly-stack">
          <div className="ly-cluster">
            <span>01</span>
            <p>Connect domain models and route authorization.</p>
          </div>
          <div className="ly-cluster">
            <span>02</span>
            <p>Replace overview cards with live application metrics.</p>
          </div>
          <div className="ly-cluster">
            <span>03</span>
            <p>Add focused tests for each product behavior.</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
