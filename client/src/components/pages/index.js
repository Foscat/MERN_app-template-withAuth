/**
 * @module components.pages
 * @description Public named exports for application route screens. Keep internal sibling imports direct to avoid cycles.
 */

import Dashboard from "./Dashboard/Dashboard.jsx";
import Home from "./Home/Home.jsx";
import Login from "./Login/Login.jsx";
import Profile from "./Profile/Profile.jsx";
import Register from "./Register/Register.jsx";
import Settings from "./Settings/Settings.jsx";

export { Dashboard, Home, Login, Profile, Register, Settings };

import NotFound from "./NotFound/NotFound.jsx";
export { NotFound };
