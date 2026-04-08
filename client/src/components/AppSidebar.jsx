/**
 * @module components.AppSidebar
 * @description Reusable UI component module.
 */
import { Sidenav, Nav } from "rsuite";
import DashboardIcon from "@rsuite/icons/legacy/Dashboard";
import UserIcon from "@rsuite/icons/legacy/User";
import CogIcon from "@rsuite/icons/legacy/Cog";
import ExitIcon from "@rsuite/icons/Exit";
import { useNavigate } from "react-router-dom";

export default function AppSidebar({ active }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Sidenav
      appearance="subtle"
      style={{
        height: "100%",
        borderRight: "1px solid #e5e5ea",
        paddingTop: 20,
      }}
    >
      <Sidenav.Body>
        <Nav activeKey={active}>
          <Nav.Item
            eventKey="dashboard"
            icon={<DashboardIcon />}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Nav.Item>

          <Nav.Item
            eventKey="profile"
            icon={<UserIcon />}
            onClick={() => navigate("/profile")}
          >
            Profile
          </Nav.Item>

          <Nav.Item
            eventKey="settings"
            icon={<CogIcon />}
            onClick={() => navigate("/settings")}
          >
            Settings
          </Nav.Item>

          <Nav.Item
            eventKey="logout"
            icon={<ExitIcon />}
            style={{ marginTop: 30 }}
            onClick={handleLogout}
          >
            Logout
          </Nav.Item>
        </Nav>
      </Sidenav.Body>
    </Sidenav>
  );
}
