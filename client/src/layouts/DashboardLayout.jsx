/**
 * @module layouts.DashboardLayout
 * @description Responsive authenticated shell composed with Layout Style CSS areas.
 */

import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";

/**
 * Render the authenticated workspace shell.
 *
 * @param {Object} props - Layout properties.
 * @param {React.ReactNode} props.children - Route content.
 * @param {string} [props.active="dashboard"] - Current sidebar key.
 * @param {string} props.title - Workspace heading.
 * @returns {JSX.Element} Dashboard application shell.
 */
export default function DashboardLayout({
  children,
  active = "dashboard",
  title,
}) {
  return (
    <main
      className="ly-wrapper ly-wrapper--wide app-dashboard-shell"
      data-ly-recipe="app-shell"
    >
      <AppSidebar active={active} />
      <AppHeader title={title} />
      <section className="ly-stack app-dashboard-content" data-ly-area="main">
        {children}
      </section>
      <footer className="app-dashboard-footer" data-ly-area="footer">
        <span>Service Blue + Red</span>
        <span aria-hidden="true">•</span>
        <span>Bento UI dark workspace</span>
      </footer>
    </main>
  );
}
