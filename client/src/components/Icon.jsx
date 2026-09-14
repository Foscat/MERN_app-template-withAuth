/**
 * @module components.Icon
 * @description Lightweight inline iconography for application navigation and status controls.
 */

const ICON_PATHS = {
  activity: <path d="M3 12h4l2.3-6 4.2 12 2.4-6H21" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  dashboard: (
    <path d="M4 4h6v6H4V4Zm10 0h6v9h-6V4ZM4 14h6v6H4v-6Zm10 3h6v3h-6v-3Z" />
  ),
  key: (
    <path d="M14.5 7.5a5 5 0 1 1-1.4 4.9L21 4.5 19.5 3 18 4.5 16.5 3 14 5.5l1.5 1.5-1 1Z" />
  ),
  layers: (
    <path d="m12 3 9 5-9 5-9-5 9-5Zm-7.5 9L12 16l7.5-4M4.5 16 12 20l7.5-4" />
  ),
  logout: <path d="M10 5H5v14h5m4-4 4-3-4-3m4 3H9" />,
  moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z" />,
  settings: (
    <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8 3.5-2-1 .2-2.2-2.1-2.1-2.2.2-1-2h-3l-1 2-2.2-.2-2.1 2.1.2 2.2-2 1v3l2 1-.2 2.2 2.1 2.1 2.2-.2 1 2h3l1-2 2.2.2 2.1-2.1-.2-2.2 2-1v-3Z" />
  ),
  shield: (
    <path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Zm-3 9 2 2 4-4" />
  ),
  sun: (
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
  ),
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />,
};

/**
 * Render a decorative SVG icon from the app's small semantic icon set.
 *
 * @param {Object} props - Icon properties.
 * @param {string} props.name - Icon name.
 * @param {number} [props.size=20] - Icon size in pixels.
 * @returns {JSX.Element} Decorative inline SVG.
 */
export default function Icon({ name, size = 20 }) {
  return (
    <svg
      aria-hidden="true"
      data-icon-role="light"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {ICON_PATHS[name] ?? ICON_PATHS.activity}
    </svg>
  );
}
