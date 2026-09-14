# MERN Forge Client

React 18 and Vite frontend for the authenticated MERN starter.

## Semantic UI contract

The client intentionally separates styling responsibilities:

- `layout-style-css@3.2.0` owns responsive structure and page composition.
- `ui-style-kit-css@2.4.0` owns configurable semantic visual paint and color themes.
- `interactive-surface-css@1.7.0` owns hover, focus, pressed, selected, busy, feedback, and disabled states.

There is no application stylesheet. Components compose the libraries' public
selectors, layout recipes, and documented custom properties instead of overriding
their paint, geometry, or interaction states locally.

The canonical asynchronous stylesheet order in `src/main.jsx` is:

```js
await loadConfiguredStyle(siteConfig);
await import("ui-style-kit-css/interactive-surface-theme.css");
await import("interactive-surface-css/state-core.css");
await import("layout-style-css");
```

## Appearance configuration

`src/config/site.js` is the single edit point for the site's semantic appearance:

```js
const siteConfig = Object.freeze({
  defaultMode: "system",
  layoutGap: "var(--ly-space-4)",
  style: "cyberpunk",
  theme: "service-blue-red",
});
```

- `style` sets `data-ui` and `data-ly-layout` to a UI Style Kit preset.
- `theme` sets the shared `data-theme`; use `null` for the style's native palette.
- `layoutGap` sets Layout Style's `--ly-profile-gap` master spacing token. Use a valid CSS length or a Layout Style token such as `var(--ly-space-4)`.
- `defaultMode` accepts `"light"`, `"dark"`, or `"system"`. Omitting it also uses the browser preference.
- A mode explicitly selected by the user is persisted and takes precedence over the configured default.

The configured visual preset is lazy-loaded from a supported preset registry, so changing `style` requires no second stylesheet edit and does not add every preset to the initial CSS payload.

Application components use the preset-independent `.ui-*` semantic selectors and
`data-ui-variant` values published by UI Style Kit. Do not hardcode preset-prefixed
component classes such as `cyber-*`, `bento-*`, or `clay-*`; the root `data-ui` value
is the visual-style switch. The accessibility skip link is the one exception:
the kit exposes only a prefixed helper, so `SkipLink` resolves its prefix from the
package manifest using the same site configuration.

Every interactive surface declares `data-surface-level` and
`data-surface-variant`. Level 1 is used for ordinary inputs and navigation, level
2 for secondary actions and appearance controls, and level 3 for primary actions
and current-page navigation. Native disabled, busy, pressed, checked, and current
states drive library feedback; failed form submissions use
`data-surface-feedback="error"` on the submit control. Static cards remain static.

## Component organization

Each component lives in its own named directory alongside its test:

```text
src/components/
  index.js
  parts/
    index.js
    NavBar/
      NavBar.jsx
      NavBar.test.jsx
    TextCard/
      TextCard.jsx
      TextCard.test.jsx
  pages/
    index.js
    Home/
      Home.jsx
      Home.test.jsx
```

Each group imports the default components and exposes named public exports:

```js
import NavBar from "./NavBar/NavBar.jsx";
import TextCard from "./TextCard/TextCard.jsx";

export { NavBar, TextCard };
```

Consumers import from the appropriate parent `index.js`. Internal siblings use
direct file imports to avoid importing their own barrel and creating dependency
cycles. The top-level component barrel also exposes both groups. Application and
context modules follow the same source/test colocation convention. Do not add
empty placeholder component folders or loose component files; the structure
contract test checks the directories, companion tests, and named exports.

API modules follow the same convention: `api/auth/auth.js` and
`api/auth/auth.test.js`, with equivalent folders for `axiosClient` and `tokenStore`.
Consumers use named exports from `api/index.js`, including `api`, `loginUser`,
`registerUser`, and the token helpers. API internals import sibling source files
directly, preserving one shared HTTP client and one in-memory token store without
barrel cycles. The API structure test also checks that the exported token and
request helpers share the same state.

## Commands

```bash
npm run dev
npm run build
npm run test:unit
npm run lint
npm run format:check
```

Run browser snapshot verification only after focused checks and the production build pass.
