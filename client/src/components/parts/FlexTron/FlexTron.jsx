/**
 * @module components.FlexTron
 * @description Responsive hero composed entirely from public layout and semantic UI primitives.
 */

/**
 * Render a responsive split hero with optional media.
 *
 * @param {Object} props - Hero properties.
 * @param {string} props.title - Hero heading.
 * @param {string} [props.subtitle] - Supporting copy.
 * @param {React.ReactNode} props.children - Hero actions.
 * @param {string} [props.image] - Optional decorative image URL.
 * @param {boolean} [props.reverse=false] - Place media first at the library's wide breakpoint.
 * @param {number} [props.gap] - Optional Layout Style gap override in pixels.
 * @param {string} [props.minHeight="60vh"] - Minimum height supplied through the public cover token.
 * @returns {JSX.Element} Responsive hero section.
 */
export default function FlexTron({
  title,
  subtitle,
  children,
  image,
  reverse = false,
  gap,
  minHeight = "60vh",
}) {
  return (
    <section
      className="ui-card ly-cover"
      data-ly-recipe="split-hero"
      style={{
        "--ly-gap": typeof gap === "number" ? `${gap}px` : undefined,
        "--ly-cover-min": minHeight,
        "--ly-split-hero-wide-areas": reverse
          ? '"media content" "media actions"'
          : undefined,
      }}
    >
      <div className="ly-stack ly-items-start" data-ly-area="content">
        <span className="ui-badge" data-ui-variant="secondary">
          Production-ready foundation
        </span>
        <h1>{title}</h1>
        {subtitle ? (
          <p className="ui-help-text ly-readable">{subtitle}</p>
        ) : null}
      </div>

      {image ? (
        <figure className="ly-frame ly-frame-4x3" data-ly-area="media">
          <img src={image} alt="" />
        </figure>
      ) : (
        <div className="ly-stack" data-ly-area="media" aria-hidden="true">
          <div className="ui-card ly-stack ly-items-start">
            <span className="ui-label">Application core</span>
            <strong>Secure by default</strong>
            <span className="ui-badge" data-ui-variant="success">
              Healthy
            </span>
          </div>
          <div className="ly-grid">
            <div className="ui-card ly-stack">
              <small className="ui-help-text">UI layers</small>
              <strong>03</strong>
            </div>
            <div className="ui-card ly-stack">
              <small className="ui-help-text">Access</small>
              <strong>Protected</strong>
            </div>
          </div>
          <div className="ui-card ly-cluster ly-justify-between">
            <span>React</span>
            <span aria-hidden="true">&rarr;</span>
            <span>Express</span>
            <span aria-hidden="true">&rarr;</span>
            <span>MongoDB</span>
          </div>
        </div>
      )}
      <div className="ly-cluster" data-ly-area="actions">
        {children}
      </div>
    </section>
  );
}
