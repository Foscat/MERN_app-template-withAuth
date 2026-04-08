/**
 * @module components.pages.Register.index
 * @description Legacy page component module.
 */
// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthForm from "../components/AuthForm";
import { registerUser } from "../../../api/API";

export default function Register() {
  const navigate = useNavigate();

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
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Email may already be in use.", { err });
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
