/**
 * @module pages.Home
 * @description Public product overview for the MERN application starter.
 */

import { Link } from "react-router-dom";
import { FlexTron } from "../../parts/index.js";
import { Icon } from "../../parts/index.js";
import { TextCard } from "../../parts/index.js";

/**
 * Render the public application overview.
 *
 * @returns {JSX.Element} Home route.
 */
export default function Home() {
  return (
    <main className="ly-wrapper ly-wrapper--workspace ly-stack ly-section">
      <FlexTron
        minHeight="30rem"
        title="A secure MERN starting point, shaped for real product work."
        subtitle="React 18, Vite, JWT authentication, protected routes, and a cohesive semantic CSS system - ready for your domain instead of another round of setup."
      >
        <Link
          className="ui-button interactive-surface variant-primary"
          data-surface-level="3"
          data-surface-variant="primary"
          data-ui-variant="primary"
          to="/dashboard"
        >
          Open workspace
          <Icon name="arrow" size={18} />
        </Link>
        <Link
          className="ui-button interactive-surface variant-subtle"
          data-surface-level="2"
          data-surface-variant="secondary"
          data-ui-variant="secondary"
          to="/register"
        >
          Create account
        </Link>
      </FlexTron>

      <section className="ly-mosaic" aria-label="Template capabilities">
        <TextCard
          center={false}
          className="ly-span-6"
          icon={<Icon name="shield" size={28} />}
          subtitle="Access and refresh-token handling with protected client routes."
          title="Authentication"
          width="100%"
        >
          <span className="ui-badge" data-ui-variant="success">
            Connected
          </span>
        </TextCard>
        <TextCard
          center={false}
          className="ly-span-3"
          icon={<Icon name="layers" size={28} />}
          subtitle="Structure, visual paint, and interaction states have clear ownership."
          title="Semantic UI stack"
          width="100%"
        >
          <span className="ui-badge" data-ui-variant="secondary">
            Three libraries
          </span>
        </TextCard>
        <TextCard
          center={false}
          className="ly-span-3"
          icon={<Icon name="activity" size={28} />}
          subtitle="Responsive semantic layouts adapt from compact phones to wide workspaces."
          title="Product-ready shell"
          width="100%"
        >
          <span className="ui-badge" data-ui-variant="primary">
            Intrinsic layout
          </span>
        </TextCard>
      </section>
    </main>
  );
}
