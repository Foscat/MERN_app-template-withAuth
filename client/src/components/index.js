/**
 * @module components
 * @description Public component entry point; parts and pages retain their own named barrels.
 */
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
} from "./parts/index.js";
export {
  Dashboard,
  Home,
  Login,
  Profile,
  Register,
  Settings,
} from "./pages/index.js";
