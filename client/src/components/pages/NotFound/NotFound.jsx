/** @module pages.NotFound
 * @description Accessible recovery content for unknown URLs.
 */
import { Link } from "react-router-dom";
/** Render a genuine not-found page.
 * @returns {JSX.Element} Recovery page. */
export default function NotFound() {
  return (
    <section className="ly-wrapper ly-stack ui-card">
      <h1>Page not found</h1>
      <p>This address does not match a page in this application.</p>
      <Link
        className="ui-button interactive-surface"
        data-surface-level="2"
        data-surface-variant="primary"
        to="/"
      >
        Return home
      </Link>
    </section>
  );
}
