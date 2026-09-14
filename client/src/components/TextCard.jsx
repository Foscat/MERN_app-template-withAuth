/**
 * @module components.TextCard
 * @description Presentational Bento card for title and body content.
 */

/**
 * Render a reusable semantic card.
 *
 * @param {Object} props - Card properties.
 * @param {string} [props.title] - Card heading.
 * @param {string} [props.subtitle] - Supporting copy.
 * @param {React.ReactNode} props.children - Card body.
 * @param {React.ReactNode} [props.icon] - Decorative or labeled icon content.
 * @param {number|string} [props.width=320] - Preferred maximum width.
 * @param {boolean} [props.center=true] - Center the card in its parent.
 * @returns {JSX.Element} Semantic card.
 */
export default function TextCard({
  title,
  subtitle,
  children,
  icon,
  width = 320,
  center = true,
}) {
  const maxWidth = typeof width === "number" ? `${width}px` : width;

  return (
    <article
      className={`ui-card bento-panel ly-stack app-card${center ? " app-card--center" : ""}`}
      style={{ "--app-card-max": maxWidth }}
    >
      {icon ? <div className="app-card__icon">{icon}</div> : null}
      {title ? <h2>{title}</h2> : null}
      {subtitle ? <p className="app-muted">{subtitle}</p> : null}
      <div className="ly-stack app-card__body">{children}</div>
    </article>
  );
}
