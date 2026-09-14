/**
 * @module pages.Register
 * @description Route-level page for new account registration.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthForm from "../components/AuthForm";
import { registerUser } from "../api/auth";
import { useUser } from "../context/UserContext";

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

      <p className="app-auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
}
