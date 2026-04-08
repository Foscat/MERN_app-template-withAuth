/**
 * @module components.parts.LogIn.index
 * @description Reusable presentational UI part component.
 */
// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../AuthLayout";
import AuthForm from "../AuthForm";
import { loginUser } from "../../../api/API";

export default function Login() {
  const navigate = useNavigate();

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
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.", { err });
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
