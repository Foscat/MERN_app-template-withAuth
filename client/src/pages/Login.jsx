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
import jwtDecode from "jwt-decode";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [formValue, setFormValue] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    try {
      const data = await loginUser(formValue);
      localStorage.setItem("token", data.token);
      const decoded = jwtDecode(data.token);
      setUser(decoded);
      navigate("/dashboard");
    } catch (err) {
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

      <p style={{ marginTop: 16 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  );
}
