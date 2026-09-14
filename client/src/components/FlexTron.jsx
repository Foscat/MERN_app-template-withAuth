/**
 * @module components.FlexTron
 * @description Responsive hero composition built from Layout Style primitives.
 */

/**
 * Render a responsive split hero with optional media.
 *
 * @param {Object} props - Hero properties.
 * @param {string} props.title - Hero heading.
 * @param {string} [props.subtitle] - Supporting copy.
 * @param {React.ReactNode} props.children - Hero actions or detail content.
 * @param {string} [props.image] - Optional image URL.
 * @param {boolean} [props.reverse=false] - Place media before copy at wide sizes.
 * @param {number} [props.gap=40] - Preferred gap in pixels.
 * @param {string} [props.minHeight="60vh"] - Minimum hero block size.
 * @returns {JSX.Element} Responsive hero section.
 */
export default function FlexTron({
  title,
  subtitle,
  children,
  image,
  reverse = false,
  gap = 40,
  minHeight = "60vh",
}) {
  return (
    <section
      className={`ui-card bento-panel app-hero${reverse ? " app-hero--reverse" : ""}`}
      data-ly-recipe="split-hero"
      style={{ "--app-hero-gap": `${gap}px`, "--app-hero-min": minHeight }}
    >
      <div className="ly-stack app-hero__content" data-ly-area="content">
        <span className="ui-badge bento-status is-info">
          Production-ready foundation
        </span>
        <h1>{title}</h1>
        {subtitle ? <p className="app-lead">{subtitle}</p> : null}
        <div className="ly-cluster" data-ly-area="actions">
          {children}
        </div>
      </div>

      {image ? (
        <figure className="ly-frame app-hero__media" data-ly-area="media">
          <img src={image} alt="" />
        </figure>
      ) : (
        <div
          className="app-hero-visual"
          data-ly-area="media"
          aria-hidden="true"
        >
          <div className="ui-card bento-panel app-hero-visual__primary">
            <span className="bento-eyebrow">Application core</span>
            <strong>Secure by default</strong>
            <span className="bento-status is-success">Healthy</span>
          </div>
          <div className="ui-card bento-panel app-hero-visual__stat">
            <small>UI layers</small>
            <strong>03</strong>
          </div>
          <div className="ui-card bento-panel app-hero-visual__stat app-hero-visual__stat--accent">
            <small>Mode</small>
            <strong>Dark</strong>
          </div>
          <div className="ui-card bento-panel app-hero-visual__flow">
            <span>React</span>
            <i />
            <span>Express</span>
            <i />
            <span>MongoDB</span>
          </div>
        </div>
      )}
    </section>
  );
}
