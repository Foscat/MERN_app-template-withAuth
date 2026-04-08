/**
 * @module pages.Profile
 * @description Route-level page for viewing and editing profile information.
 */
import DashboardLayout from "../layouts/DashboardLayout";

export default function Profile() {
  return (
    <DashboardLayout active="profile" title="My Profile">
      <p>Profile content goes here.</p>
    </DashboardLayout>
  );
}
