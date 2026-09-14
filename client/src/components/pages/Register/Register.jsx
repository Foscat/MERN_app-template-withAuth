/**
 * @module pages.Register
 * @description Route-level page for new account registration.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../../parts/index.js";
import { AuthForm } from "../../parts/index.js";
import { registerUser } from "../../../api/index.js";
import { useUser } from "../../../context/UserContext/UserContext.jsx";

/**
 * Render account registration and establish the new client session.
 *
 * @returns {JSX.Element} Registration route.
 */
export default function Register() {
  const navigate = useNavigate();
  const { establishSession } = useUser();

  const [formValue, setFormValue] = useState({
    email: "",
    name: "",
    password: "",
    username: "",
  });

  const [error, setError] = useState("");

  /**
   * Register the submitted credentials and enter the dashboard.
   *
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    setError("");

    try {
      const data = await registerUser(formValue);
      establishSession(data);
      navigate("/dashboard");
    } catch {
      setError("Registration failed. Email may already be in use.");
    }
  };

  return (
    <AuthLayout title="Register">
      <AuthForm
        formValue={formValue}
        setFormValue={setFormValue}
        onSubmit={handleSubmit}
        buttonLabel="Create Account"
        error={error}
        includeRegistrationFields
        passwordAutoComplete="new-password"
      />

      <p className="ui-help-text ly-cluster ly-justify-center">
        Already have an account?{" "}
        <Link
          className="ui-nav-link interactive-surface variant-subtle"
          data-surface-level="1"
          data-surface-variant="subtle"
          to="/login"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
