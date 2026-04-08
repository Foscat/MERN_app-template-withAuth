/**
 * @module components.TextCard
 * @description Presentational card component for title and body text content.
 */
import { Panel, FlexboxGrid } from "rsuite";

/**
 * @function TextCard
 * @description A reusable card component for displaying text content with optional title, subtitle, and icon. Utilizes rsuite's Panel and FlexboxGrid components for layout and styling.
 * @param {Object} param0 - The props object.
 * @param {string} param0.title - The title of the card.
 * @param {string} param0.subtitle - The subtitle of the card.
 * @param {React.ReactNode} param0.children - The content of the card.
 * @param {React.ReactNode} param0.icon - The icon to display in the card.
 * @param {number} param0.width - The width of the card.
 * @param {boolean} param0.center - Whether to center the card.
 * @returns {JSX.Element} - The rendered card component.
 */
export default function TextCard({
  title,
  subtitle,
  children,
  icon,
  width = 320,
  center = true,
}) {
  return (
    <FlexboxGrid justify={center ? "center" : "start"} style={{ marginBottom: 20 }}>
      <FlexboxGrid.Item colspan="auto">
        <Panel
          bordered
          shaded
          style={{
            width,
            padding: 20,
            borderRadius: 12,
          }}
        >
          {icon && <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>}

          {title && (
            <h3 style={{ margin: "0 0 8px 0", fontWeight: 600 }}>{title}</h3>
          )}

          {subtitle && (
            <p style={{ margin: "0 0 12px 0", opacity: 0.7 }}>{subtitle}</p>
          )}

          <div>{children}</div>
        </Panel>
      </FlexboxGrid.Item>
    </FlexboxGrid>
  );
}
