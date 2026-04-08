/**
 * @module components.parts.DashboardLayout.index
 * @description Reusable presentational UI part component.
 */
// src/layouts/DashboardLayout.jsx
import { Container, Sidebar, Content } from "rsuite";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";

export default function DashboardLayout({
  children,
  active = "dashboard",
  title,
}) {
  return (
    <Container style={{ height: "100vh" }}>
      {/* Sidebar */}
      <Sidebar
        width={260}
        collapsible
      >
        <AppSidebar active={active} />
      </Sidebar>

      {/* Main Content */}
      <Container>
        <AppHeader title={title} />
        <Content style={{ padding: 20, overflow: "auto" }}>{children}</Content>
      </Container>
    </Container>
  );
}
