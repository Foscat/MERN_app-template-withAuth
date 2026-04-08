/**
 * @module components.FlexTron
 * @description Reusable UI component module.
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
  const textOrder = reverse ? 2 : 1;
  const imageOrder = reverse ? 1 : 2;

  return (
    <FlexboxGrid
      justify="space-around"
      align="middle"
      style={{ padding: "40px 20px", minHeight }}
    >
      <FlexboxGrid.Item colspan={10} order={textOrder} style={{ paddingRight: gap }}>
        <h2 style={{ marginBottom: 16 }}>{title}</h2>

        {subtitle && (
          <p style={{ marginBottom: 20, opacity: 0.8, fontSize: "1.1rem" }}>
            {subtitle}
          </p>
        )}

        {children}
      </FlexboxGrid.Item>

      {image && (
        <FlexboxGrid.Item colspan={10} order={imageOrder}>
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
