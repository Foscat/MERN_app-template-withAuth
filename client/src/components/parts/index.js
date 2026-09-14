/**
 * @module components.parts
 * @description Public named exports for reusable components and layouts. Keep internal sibling imports direct to avoid cycles.
 */

import AppHeader from "./AppHeader/AppHeader.jsx";
import AppIcon from "./AppIcon/AppIcon.jsx";
import AppSidebar from "./AppSidebar/AppSidebar.jsx";
import AuthForm from "./AuthForm/AuthForm.jsx";
import AuthLayout from "./AuthLayout/AuthLayout.jsx";
import DashboardLayout from "./DashboardLayout/DashboardLayout.jsx";
import FlexTron from "./FlexTron/FlexTron.jsx";
import Icon from "./Icon/Icon.jsx";
import NavBar from "./NavBar/NavBar.jsx";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute.jsx";
import RouteNavLink from "./RouteNavLink/RouteNavLink.jsx";
import SkipLink from "./SkipLink/SkipLink.jsx";
import TextCard from "./TextCard/TextCard.jsx";

export {
  AppHeader,
  AppIcon,
  AppSidebar,
  AuthForm,
  AuthLayout,
  DashboardLayout,
  FlexTron,
  Icon,
  NavBar,
  ProtectedRoute,
  RouteNavLink,
  SkipLink,
  TextCard,
};

import SeoMetadata from "./SeoMetadata/SeoMetadata.jsx";
export { SeoMetadata };
import ErrorBoundary from "./ErrorBoundary/ErrorBoundary.jsx";
import SessionManager from "./SessionManager/SessionManager.jsx";
export { ErrorBoundary, SessionManager };
