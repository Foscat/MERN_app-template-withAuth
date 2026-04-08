/**
 * @module components.AppHeader
 * @description Reusable UI component module.
 */
import { Navbar, Nav, Avatar, IconButton, Whisper, Tooltip } from "rsuite";
import SunIcon from "@rsuite/icons/legacy/SunO";
import MoonIcon from "@rsuite/icons/legacy/MoonO";
import UserIcon from "@rsuite/icons/legacy/User";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

export default function AppHeader({ title }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();

  return (
    <Navbar appearance="subtle" style={{ borderBottom: "1px solid #e5e5ea" }}>
      <Navbar.Brand style={{ fontWeight: 600, paddingLeft: 16 }}>
        {title}
      </Navbar.Brand>

      <Nav pullRight>
        <Nav.Item>
          <Whisper
            trigger="hover"
            placement="bottom"
            speaker={<Tooltip>Toggle Theme</Tooltip>}
          >
            <IconButton
              icon={theme === "light" ? <MoonIcon /> : <SunIcon />}
              circle
              size="sm"
              appearance="subtle"
              onClick={toggleTheme}
            />
          </Whisper>
        </Nav.Item>

        <Nav.Menu
          title={user ? `${user.email} (${user.role})` : "User"}
          icon={<UserIcon />}
          placement="bottomEnd"
        >
          <Nav.Item onClick={logout}>Logout</Nav.Item>
        </Nav.Menu>

        <Nav.Item>
          <Avatar circle size="sm" />
        </Nav.Item>
      </Nav>
    </Navbar>
  );
}
