/**
 * @module layouts.AuthLayout
 * @description Layout wrapper for authentication screens and shared auth framing.
 */
import { Container, Content, FlexboxGrid, Panel } from "rsuite";

/**
 * @file AuthLayout.jsx
 * @component AuthLayout
 * @description A layout component for authentication pages (e.g., login, register). It centers the content on the page and provides a consistent header for the authentication forms.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the layout (e.g., login form).
 * @param {string} props.title - The title to display in the header of the panel.
 * @returns {JSX.Element} - The rendered authentication layout component.
 */
export default function AuthLayout({ children, title }) {
  return (
    <Container>
      <Content>
        <Row justify="center" align="middle" style={{ height: "100vh" }}>
          <Col colspan={8}>
            <Panel
              header={<h3 style={{ margin: 0 }}>{title}</h3>}
              bordered
              shaded
              style={{ padding: 20 }}
            >
              {children}
            </Panel>
          </Col>
        </Row>
      </Content>
    </Container>
  );
}
