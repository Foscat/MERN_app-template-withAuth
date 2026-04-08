/**
 * @module pages.Dashboard
 * @description Route-level page for the authenticated dashboard overview.
 */
import DashboardLayout from "../layouts/DashboardLayout";
import { Panel, Placeholder } from "rsuite";

export default function Dashboard() {
  return (
    <DashboardLayout active="dashboard" title="Dashboard">
      <Panel bordered shaded style={{ marginBottom: 20 }}>
        <h3>Welcome!</h3>
        <p>Your dashboard is ready. Replace this with your own widgets.</p>
      </Panel>

      <Placeholder.Paragraph rows={5} />
    </DashboardLayout>
  );
}
