/**
 * @module layouts.AuthLayout
 * @description Responsive semantic frame shared by authentication routes.
 */

import Icon from "../Icon/Icon.jsx";

/**
 * Render a centered authentication card with product context.
 *
 * @param {Object} props - Layout properties.
 * @param {React.ReactNode} props.children - Authentication form content.
 * @param {string} props.title - Form heading.
 * @returns {JSX.Element} Authentication route layout.
 */
export default function AuthLayout({ children, title }) {
  return (
    <main className="ly-wrapper ly-wrapper--workspace ly-section">
      <section data-ly-recipe="split-hero">
        <div
          className="ui-card ly-justify-center ly-stack"
          data-ly-area="content"
        >
          <span className="ui-badge" data-ui-variant="secondary">
            MERN Forge
          </span>
          <div className="ui-badge" data-ui-variant="primary">
            <Icon name="shield" size={34} />
          </div>
          <h1>Build securely from the first screen.</h1>
          <p className="ui-help-text ly-readable">
            A clear authentication foundation, responsive application shell, and
            semantic component system are already connected.
          </p>
          <ul className="ly-stack">
            <li className="ly-cluster">
              <Icon name="activity" size={16} />
              JWT access and refresh-token flow
            </li>
            <li className="ly-cluster">
              <Icon name="shield" size={16} />
              Protected routes with role support
            </li>
            <li className="ly-cluster">
              <Icon name="layers" size={16} />
              Semantic UI components with accessible states
            </li>
          </ul>
        </div>

        <article className="ui-card ly-stack" data-ly-area="media">
          <header className="ly-stack">
            <span className="ui-label">Secure access</span>
            <h2>{title}</h2>
            <p className="ui-help-text">
              Use your account credentials to continue.
            </p>
          </header>
          {children}
        </article>
      </section>
    </main>
  );
}
