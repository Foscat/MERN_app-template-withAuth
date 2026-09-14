/**
 * @module layouts.DashboardLayout
 * @description Responsive authenticated shell composed with Layout Style CSS areas.
 */

import AppSidebar from "../AppSidebar/AppSidebar.jsx";
import AppHeader from "../AppHeader/AppHeader.jsx";
import { useTheme } from "../../../context/ThemeContext/ThemeContext.jsx";

/**
 * Render the authenticated workspace shell.
 *
 * @param {Object} props - Layout properties.
 * @param {React.ReactNode} props.children - Route content.
 * @param {string} props.title - Workspace heading.
 * @returns {JSX.Element} Dashboard application shell.
 */
export default function DashboardLayout({
  children = null,
  title = "Workspace",
}) {
  const { mode, style, theme } = useTheme();

  return (
    <main
      className="ly-wrapper ly-wrapper--wide ly-section ly-section--compact"
      data-ly-recipe="app-shell"
    >
      <AppHeader title={title} />
      <AppSidebar />
      <section className="ly-stack" data-ly-area="main">
        {children}
      </section>
      <footer
        className="ui-help-text ly-cluster ly-justify-end"
        data-ly-area="footer"
      >
        <span>{theme || "Native theme"}</span>
        <span aria-hidden="true">&bull;</span>
        <span>
          {style} {mode} workspace
        </span>
      </footer>
    </main>
  );
}
