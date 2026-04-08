/**
 * @module components.parts.TextCard.index
 * @description Reusable presentational UI part component.
 */
import { Panel, FlexboxGrid } from "rsuite";

export default function TextCard({
  title,
  subtitle,
  children,
  icon,
  width = 320,
  center = true,
}) {
  return (
    <FlexboxGrid
      justify={center ? "center" : "start"}
      style={{ marginBottom: 20 }}
    >
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
