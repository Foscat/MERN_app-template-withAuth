/**
 * @module components.AppIcon
 * @description Reusable application icon sourced from the canonical favicon artwork.
 */
import site from "../../../../../shared/site.json";

/**
 * Render the branded MERN Forge application icon.
 *
 * @param {Object} props - Icon properties.
 * @param {number} [props.size=36] - Rendered square size in CSS pixels.
 * @returns {JSX.Element} Application icon image.
 */
export default function AppIcon({ size = 36 }) {
  return (
    <img
      alt={site.name}
      draggable="false"
      height={size}
      src="/images/app-icon-64.png"
      width={size}
    />
  );
}
