/**
 * @module components.NavBar
 * @description Reusable UI component module.
 */
import { Navbar, Nav } from "rsuite";
import { Link, useNavigate } from "react-router-dom";

/**
 * @component NavBar
 * @description A navigation bar component that displays links to home, dashboard, and login/logout based on the user's authentication state. Utilizes rsuite's Navbar and Nav components for layout and styling. The logout functionality clears the JWT token from localStorage and redirects to the login page.
 * @returns {JSX.Element} - The rendered navigation bar component with links to home, dashboard, login/logout based on authentication state. Utilizes rsuite's Navbar and Nav components for layout and styling.
 */
export default function NavBar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar appearance="subtle">
      <Navbar.Brand as={Link} to="/">
        MERN Template
      </Navbar.Brand>

      <Nav>
        <Nav.Item as={Link} to="/">
          Home
        </Nav.Item>
        {token && (
          <Nav.Item as={Link} to="/dashboard">
            Dashboard
          </Nav.Item>
        )}
      </Nav>

      <Nav pullRight>
        {!token ? (
          <Nav.Item as={Link} to="/login">
            Login
          </Nav.Item>
        ) : (
          <Nav.Item onClick={handleLogout}>Logout</Nav.Item>
        )}
      </Nav>
    </Navbar>
  );
}
