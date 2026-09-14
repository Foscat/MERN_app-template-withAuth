/**
 * @module components.TextCard
 * @description Reusable semantic card with library-owned measure, spacing, and paint.
 */

/**
 * Render a reusable semantic card.
 *
 * @param {Object} props - Card properties.
 * @param {string} [props.title] - Card heading.
 * @param {string} [props.subtitle] - Supporting copy.
 * @param {React.ReactNode} props.children - Card body.
 * @param {React.ReactNode} [props.icon] - Decorative or labeled icon content.
 * @param {number|string} [props.width=320] - Maximum measure supplied to Layout Style.
 * @param {boolean} [props.center=true] - Center the card in its parent.
 * @param {string} [props.className=""] - Additional public library classes.
 * @returns {JSX.Element} Semantic card.
 */
export default function TextCard({
  title,
  subtitle,
  children,
  icon,
  width = 320,
  center = true,
  className = "",
}) {
  const maxWidth = typeof width === "number" ? `${width}px` : width;
  const cardClassName = [
    "ui-card ly-stack ly-readable ly-w-full ly-items-start",
    center ? "ly-mx-auto" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={cardClassName}
      style={{ "--ly-wrapper-prose": maxWidth }}
    >
      {icon ? (
        <span className="ui-badge" data-ui-variant="secondary">
          {icon}
        </span>
      ) : null}
      {title ? <h2>{title}</h2> : null}
      {subtitle ? <p className="ui-help-text">{subtitle}</p> : null}
      <div className="ly-stack">{children}</div>
    </article>
  );
}
