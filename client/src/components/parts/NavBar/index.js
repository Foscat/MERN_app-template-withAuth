/**
 * @module components.parts.NavBar.index
 * @description Reusable presentational UI part component.
 */
import { Navbar, Nav } from "rsuite";
import { Link } from "react-router-dom";

export default function NavBar() {
  const token = localStorage.getItem("token");

  return (
    <Navbar appearance="subtle">
      <Navbar.Brand
        as={Link}
        to="/"
      >
        MERN Template
      </Navbar.Brand>

      <Nav>
        <Nav.Item
          as={Link}
          to="/"
        >
          Home
        </Nav.Item>
        {token && (
          <Nav.Item
            as={Link}
            to="/dashboard"
          >
            Dashboard
          </Nav.Item>
        )}
      </Nav>

      <Nav pullRight>
        {!token ? (
          <Nav.Item
            as={Link}
            to="/login"
          >
            Login
          </Nav.Item>
        ) : (
          <Nav.Item
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
          >
            Logout
          </Nav.Item>
        )}
      </Nav>
    </Navbar>
  );
}
