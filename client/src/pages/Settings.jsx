/**
 * @module pages.Settings
 * @description Route-level page for account and application settings.
 */
import DashboardLayout from "../layouts/DashboardLayout";

export default function Settings() {
  return (
    <DashboardLayout active="settings" title="Settings">
      <p>Settings page content.</p>
    </DashboardLayout>
  );
}
