/**
 * @module components.parts.AppHeader.index
 * @description Reusable presentational UI part component.
 */
import { Navbar, Nav, Avatar, IconButton, Whisper, Tooltip } from "rsuite";
import SunIcon from "@rsuite/icons/legacy/Sun";
import MoonIcon from "@rsuite/icons/legacy/Moon";
import UserIcon from "@rsuite/icons/legacy/User";
import { useTheme } from "../context/ThemeContext";

export default function AppHeader({ title }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Navbar
      appearance="subtle"
      style={{ borderBottom: "1px solid #e5e5ea" }}
    >
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

        <Nav.Item icon={<UserIcon />}>
          <Avatar
            circle
            size="sm"
          />
        </Nav.Item>
      </Nav>
    </Navbar>
  );
}
