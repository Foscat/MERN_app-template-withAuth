/**
 * @module components.AuthForm
 * @description Accessible authentication form using native controls and semantic styling.
 */

/**
 * Render a controlled email and password form.
 *
 * @param {Object} props - Form properties.
 * @param {Object} props.formValue - Current field values.
 * @param {Function} props.setFormValue - Value updater.
 * @param {Function} props.onSubmit - Submit callback.
 * @param {string} props.buttonLabel - Primary action label.
 * @param {string} [props.error] - Error message to announce.
 * @param {boolean} [props.includeRegistrationFields=false] - Whether to collect name and username.
 * @param {"current-password"|"new-password"} [props.passwordAutoComplete="current-password"] - Password autocomplete purpose.
 * @returns {JSX.Element} Authentication form.
 */
export default function AuthForm({
  formValue,
  setFormValue,
  onSubmit,
  buttonLabel,
  error,
  includeRegistrationFields = false,
  passwordAutoComplete = "current-password",
}) {
  /**
   * Update one controlled input while preserving the remaining values.
   *
   * @param {Event} event - Input change event.
   * @returns {void}
   */
  const handleChange = (event) => {
    const { name, value } = event.currentTarget;
    setFormValue({ ...formValue, [name]: value });
  };

  /**
   * Prevent native navigation and delegate authentication to the route.
   *
   * @param {Event} event - Form submission event.
   * @returns {void}
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <form className="ly-stack app-form" onSubmit={handleSubmit}>
      {error ? (
        <div
          className="ui-alert bento-alert"
          data-surface-feedback="error"
          role="alert"
        >
          <strong className="ui-alert-title">We could not continue</strong>
          <span className="ui-alert-body">{error}</span>
        </div>
      ) : null}

      {includeRegistrationFields ? (
        <>
          <label className="ui-field bento-field">
            <span className="ui-label">Name</span>
            <input
              className="ui-input interactive-surface"
              autoComplete="name"
              maxLength="100"
              name="name"
              onChange={handleChange}
              required
              type="text"
              value={formValue.name || ""}
            />
          </label>

          <label className="ui-field bento-field">
            <span className="ui-label">Username</span>
            <input
              className="ui-input interactive-surface"
              autoComplete="username"
              maxLength="40"
              minLength="3"
              name="username"
              onChange={handleChange}
              pattern="[A-Za-z0-9._-]+"
              required
              type="text"
              value={formValue.username || ""}
            />
          </label>
        </>
      ) : null}

      <label className="ui-field bento-field">
        <span className="ui-label">Email address</span>
        <input
          className="ui-input interactive-surface"
          autoComplete="email"
          inputMode="email"
          name="email"
          onChange={handleChange}
          required
          type="email"
          value={formValue.email}
        />
      </label>

      <label className="ui-field bento-field">
        <span className="ui-label">Password</span>
        <input
          className="ui-input interactive-surface"
          autoComplete={passwordAutoComplete}
          minLength="12"
          name="password"
          onChange={handleChange}
          required
          type="password"
          value={formValue.password}
        />
      </label>

      <button
        className="ui-button interactive-surface variant-primary app-form__submit"
        data-ui-variant="primary"
        type="submit"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
