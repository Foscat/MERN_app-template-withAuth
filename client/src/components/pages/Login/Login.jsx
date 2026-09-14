/**
 * @module pages.Login
 * @description Route-level page for user authentication and session start.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../../parts/index.js";
import { AuthForm } from "../../parts/index.js";
import { loginUser } from "../../../api/index.js";
import { useUser } from "../../../context/UserContext/UserContext.jsx";

/**
 * Render login state and establish an authenticated client session.
 *
 * @returns {JSX.Element} Login route.
 */
export default function Login() {
  const navigate = useNavigate();
  const { establishSession } = useUser();

  const [formValue, setFormValue] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  /**
   * Authenticate the submitted credentials and enter the dashboard.
   *
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    setError("");

    try {
      const data = await loginUser(formValue);
      establishSession(data);
      navigate("/dashboard");
    } catch (failure) {
      setError(
        failure.response?.status === 401
          ? "Invalid credentials. Please try again."
          : "Sign-in could not be completed. Check your connection and try again.",
      );
    }
  };

  return (
    <AuthLayout title="Login">
      <AuthForm
        formValue={formValue}
        setFormValue={setFormValue}
        onSubmit={handleSubmit}
        buttonLabel="Log In"
        error={error}
      />

      <p className="ui-help-text ly-cluster ly-justify-center">
        Don&apos;t have an account?{" "}
        <Link
          className="ui-nav-link interactive-surface variant-subtle"
          data-surface-level="1"
          data-surface-variant="subtle"
          to="/register"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
