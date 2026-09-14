/**
 * @module App
 * @description Top-level application routing shell.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import routes from "../../../shared/routes.json";
import * as Pages from "../components/pages/index.js";
import {
  NavBar,
  ProtectedRoute,
  SkipLink,
  SeoMetadata,
} from "../components/parts/index.js";
import { useTheme } from "../context/ThemeContext/ThemeContext.jsx";

/**
 * Render the application router inside the selected semantic design system.
 *
 * @param {Object} [props] Router dependencies.
 * @param {React.ComponentType} [props.Router] Browser router or build-time static router.
 * @param {Object} [props.routerProps] Router-specific settings.
 * @returns {JSX.Element} Application shell and route content.
 */
function App({ Router = BrowserRouter, routerProps = {} }) {
  const { layoutGap, mode, style, theme } = useTheme();

  return (
    <Router {...routerProps}>
      <SeoMetadata />
      <div
        className="ly-root ly-page"
        data-ui={style}
        data-theme={theme || undefined}
        data-mode={mode}
        data-ly-layout={style}
        style={{ "--ly-profile-gap": layoutGap }}
      >
        <SkipLink />
        <NavBar />

        <div id="main-content" className="ly-main" tabIndex="-1">
          <Routes>
            {routes.map((route) => {
              const Page = Pages[route.component];
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.access === "private" ? (
                      <ProtectedRoute>
                        <Page />
                      </ProtectedRoute>
                    ) : (
                      <Page />
                    )
                  }
                />
              );
            })}
            <Route path="*" element={<Pages.NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
