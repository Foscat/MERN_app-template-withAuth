/**
 * @module pages.Home
 * @description Public product overview for the MERN application starter.
 */

import { Link } from "react-router-dom";
import FlexTron from "../components/FlexTron";
import Icon from "../components/Icon";
import TextCard from "../components/TextCard";

/**
 * Render the public application overview.
 *
 * @returns {JSX.Element} Home route.
 */
export default function Home() {
  return (
    <main className="ly-wrapper ly-wrapper--workspace ly-stack app-page">
      <FlexTron
        minHeight="30rem"
        title="A secure MERN starting point, shaped for real product work."
        subtitle="React 18, Vite, JWT authentication, protected routes, and a cohesive semantic CSS system - ready for your domain instead of another round of setup."
      >
        <Link
          className="ui-button interactive-surface variant-primary"
          data-ui-variant="primary"
          to="/dashboard"
        >
          Open workspace
          <Icon name="arrow" size={18} />
        </Link>
        <Link
          className="ui-button interactive-surface variant-subtle"
          data-ui-variant="secondary"
          to="/register"
        >
          Create account
        </Link>
      </FlexTron>

      <section
        className="ly-mosaic app-bento-grid"
        aria-label="Template capabilities"
      >
        <TextCard
          center={false}
          icon={<Icon name="shield" size={28} />}
          subtitle="Access and refresh-token handling with protected client routes."
          title="Authentication"
          width="100%"
        >
          <span className="ui-badge bento-status is-success">Connected</span>
        </TextCard>
        <TextCard
          center={false}
          icon={<Icon name="layers" size={28} />}
          subtitle="Structure, visual paint, and interaction states have clear ownership."
          title="Semantic UI stack"
          width="100%"
        >
          <span className="ui-badge bento-status is-info">Three libraries</span>
        </TextCard>
        <TextCard
          center={false}
          icon={<Icon name="activity" size={28} />}
          subtitle="Responsive Bento layouts adapt from compact phones to wide workspaces."
          title="Product-ready shell"
          width="100%"
        >
          <span className="ui-badge bento-status is-violet">
            Intrinsic layout
          </span>
        </TextCard>
      </section>
    </main>
  );
}
