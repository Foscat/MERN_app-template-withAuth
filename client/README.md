# MERN Forge Client

React 18 and Vite frontend for the authenticated MERN starter.

## Semantic UI contract

The client intentionally separates styling responsibilities:

- `layout-style-css@3.2.0` owns responsive structure and page composition.
- `ui-style-kit-css@2.4.0` owns Bento UI visual paint with the `service-blue-red` theme.
- `interactive-surface-css@1.7.0` owns hover, focus, pressed, selected, busy, feedback, and disabled states.
- `src/index.css` contains only application-specific composition and content constraints.

The canonical stylesheet order in `src/main.jsx` is:

```js
import "ui-style-kit-css/visual/bento.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
import "./index.css";
```

The document uses `data-ui="bento"`, `data-theme="service-blue-red"`, `data-mode="dark"`, and `data-ly-layout="bento"`. Users may switch display mode from the authenticated workspace; dark remains the default.

## Commands

```bash
npm run dev
npm run build
npm run test:unit
npm run lint
npm run format:check
```

Run browser snapshot verification only after focused checks and the production build pass.
