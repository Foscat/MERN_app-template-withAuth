/**
 * @module components.parts.SectionLayout.index
 * @description Reusable presentational UI part component.
 */
export default function Section({
  children,
  size = "md",
  background,
  style = {},
}) {
  const paddingMap = {
    sm: "40px 20px",
    md: "60px 20px",
    lg: "90px 20px",
  };

  return (
    <section
      style={{
        padding: paddingMap[size],
        background,
        ...style,
      }}
    >
      {children}
    </section>
  );
}
