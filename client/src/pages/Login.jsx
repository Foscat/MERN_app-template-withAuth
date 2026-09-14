/**
 * @module pages.Login
 * @description Route-level page for user authentication and session start.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthForm from "../components/AuthForm";
import { loginUser } from "../api/auth";
import { useUser } from "../context/UserContext";

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
    } catch {
      setError("Invalid credentials. Please try again.");
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

      <p className="app-auth-switch">
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  );
}
