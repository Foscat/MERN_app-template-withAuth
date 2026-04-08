/**
 * @module components.parts.FlexTron.index
 * @description Reusable presentational UI part component.
 */
import { FlexboxGrid } from "rsuite";

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
    <FlexboxGrid
      justify="space-around"
      align="middle"
      style={{ padding: "40px 20px", minHeight }}
    >
      {/* Text */}
      <FlexboxGrid.Item
        colspan={10}
        order={reverse ? 2 : 1}
        style={{ paddingRight: gap }}
      >
        <h2 style={{ marginBottom: 16 }}>{title}</h2>

        {subtitle && (
          <p style={{ marginBottom: 20, opacity: 0.8, fontSize: "1.1rem" }}>
            {subtitle}
          </p>
        )}

        {children}
      </FlexboxGrid.Item>

      {/* Image */}
      {image && (
        <FlexboxGrid.Item
          colspan={10}
          order={reverse ? 1 : 2}
        >
          <img
            src={image}
            alt={title}
            style={{ width: "100%", borderRadius: 12, objectFit: "cover" }}
          />
        </FlexboxGrid.Item>
      )}
    </FlexboxGrid>
  );
}
