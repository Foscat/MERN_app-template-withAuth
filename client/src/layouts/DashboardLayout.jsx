/**
 * @module layouts.DashboardLayout
 * @description Layout component for authenticated dashboard pages and navigation.
 */
import { Container, Sidebar, Content } from "rsuite";
import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";

/**
 * @file DashboardLayout.jsx
 * @component DashboardLayout
 * @description A layout component for the dashboard pages. It includes a sidebar, header, and content area.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the layout.
 * @param {string} [props.active="dashboard"] - The active sidebar item.
 * @param {string} props.title - The title to display in the header.
 * @returns {JSX.Element} - The rendered dashboard layout component.
 */
export default function DashboardLayout({ children, active = "dashboard", title }) {
  return (
    <Container style={{ height: "100vh" }}>
      <Sidebar width={260} collapsible>
        <AppSidebar active={active} />
      </Sidebar>

      <Container>
        <AppHeader title={title} />
        <Content style={{ padding: 20, overflow: "auto" }}>{children}</Content>
      </Container>
    </Container>
  );
}
