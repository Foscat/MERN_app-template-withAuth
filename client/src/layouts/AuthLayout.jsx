/**
 * @module layouts.AuthLayout
 * @description Responsive Bento frame shared by authentication routes.
 */

import Icon from "../components/Icon";

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
    <main className="ly-wrapper ly-wrapper--workspace app-auth-page">
      <section className="app-auth-grid" data-ly-recipe="split-hero">
        <div
          className="ui-card bento-panel app-auth-intro ly-stack"
          data-ly-area="content"
        >
          <span className="ui-badge bento-status is-info">MERN Forge</span>
          <div className="app-auth-emblem">
            <Icon name="shield" size={34} />
          </div>
          <h1>Build securely from the first screen.</h1>
          <p className="app-lead">
            A clear authentication foundation, responsive application shell, and
            semantic component system are already connected.
          </p>
          <ul className="app-feature-list">
            <li>JWT access and refresh-token flow</li>
            <li>Protected routes with role support</li>
            <li>Bento UI components with accessible states</li>
          </ul>
        </div>

        <article
          className="ui-card bento-panel app-auth-card ly-stack"
          data-ly-area="media"
        >
          <header className="ly-stack">
            <span className="bento-eyebrow">Secure access</span>
            <h2>{title}</h2>
            <p className="app-muted">
              Use your account credentials to continue.
            </p>
          </header>
          {children}
        </article>
      </section>
    </main>
  );
}
