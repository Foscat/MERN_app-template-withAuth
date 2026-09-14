/**
 * @module components.SkipLink
 * @description Accessible bypass navigation using the configured preset's public helper.
 */
import { presets } from "ui-style-kit-css/manifest.json";
import { useTheme } from "../../../context/ThemeContext/ThemeContext.jsx";

/**
 * Render the UI kit's focus-revealed skip link.
 *
 * The kit exposes this accessibility helper only through its preset prefix;
 * resolving the prefix from the manifest keeps it aligned with site configuration.
 *
 * @returns {JSX.Element} Keyboard bypass link to the route content.
 */
export default function SkipLink() {
  const { style } = useTheme();
  const preset = presets.find((entry) => entry.id === style);

  return (
    <a
      className={preset ? `${preset.prefix}-skip-link` : "ui-nav-link"}
      href="#main-content"
    >
      Skip to main content
    </a>
  );
}
