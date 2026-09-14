/** @module components.ErrorBoundary
 * @description Last-resort rendering recovery without leaking error details to users.
 */
import { Component } from "react";
/** Catch descendant rendering errors and preserve a recovery path. */
export default class ErrorBoundary extends Component {
  state = { failed: false };
  /** Convert rendering errors to fallback state.
   * @returns {{failed: boolean}} Recovery state. */
  static getDerivedStateFromError() {
    return { failed: true };
  }
  /** Render children or an accessible recovery message.
   * @returns {React.ReactNode} Content. */
  render() {
    if (this.state.failed)
      return (
        <section className="ui-alert ly-stack" role="alert">
          <h1>The application encountered a problem</h1>
          <p>Reload this page to try again.</p>
          <button
            type="button"
            className="ui-button interactive-surface"
            data-surface-level="2"
            data-surface-variant="primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </section>
      );
    return this.props.children;
  }
}
