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
import jwtDecode from "jwt-decode";

export default function Register() {
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
      const data = await registerUser(formValue);
      localStorage.setItem("token", data.token);
      const decoded = jwtDecode(data.token);
      setUser(decoded);
      navigate("/dashboard");
    } catch (err) {
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
      />

      <p style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
}
