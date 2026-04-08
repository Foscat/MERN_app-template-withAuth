/**
 * @module components.parts.AuthLayout.index
 * @description Reusable presentational UI part component.
 */
// src/layouts/AuthLayout.jsx
import { Container, Content, FlexboxGrid, Panel } from "rsuite";

export default function AuthLayout({ children, title }) {
  return (
    <Container>
      <Content>
        <FlexboxGrid
          justify="center"
          align="middle"
          style={{ height: "100vh" }}
        >
          <FlexboxGrid.Item colspan={8}>
            <Panel
              header={<h3 style={{ margin: 0 }}>{title}</h3>}
              bordered
              shaded
              style={{ padding: 20 }}
            >
              {children}
            </Panel>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Content>
    </Container>
  );
}
