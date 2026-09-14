# Configure search and sharing metadata

The template ships with indexing **disabled**. This prevents an unfinished starter from being deliberately submitted for indexing. It is not access control: protect private information with authentication and authorization.

## 1. Describe the application honestly

Edit `shared/site.json`. This file is public and is included in browser bundles. Never place credentials, internal service URLs, or private customer information here.

| Field             | What to supply                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `name`            | The public product or organization name.                                                                       |
| `tagline`         | A short, useful explanation shown in navigation.                                                               |
| `origin`          | The final HTTPS origin, such as `https://www.your-domain.com`, without a trailing slash, path, or credentials. |
| `language`        | The document language, such as `en` or `en-US`. This alone does not implement translated pages.                |
| `titleTemplate`   | A readable pattern containing `%s`, such as `%s \| Harbor Repairs`.                                            |
| `description`     | An accurate summary of the home page and the value the application offers.                                     |
| `socialImage`     | A public image path or HTTPS URL. Replace the starter image with your own.                                     |
| `socialImageAlt`  | A meaningful textual description of that image.                                                                |
| `indexingEnabled` | Set `true` only after completing the publishing checklist below.                                               |

Example title: `Bicycle repair appointments | Harbor Repairs`.

Example description: `Book bicycle repairs in Portland. Compare tune-up services, see workshop hours, and request an appointment with Harbor Repairs.` Only use locations, services, and claims that the page actually supports.

Do not repeat keywords, invent customer reviews, or fill descriptions with unrelated search terms. Google primarily derives snippets from page content and may use or rewrite your description. There is no guaranteed snippet length or ranking improvement from a metadata field alone. See [Google's description guidance](https://developers.google.com/search/docs/appearance/snippet) and [title guidance](https://developers.google.com/search/docs/appearance/title-link).

## 2. Describe each public route

Edit `shared/routes.json`. A route identifies its component, path, navigation label, access classification, and optional metadata. The page component must be exported from the pages barrel.

```json
{
  "path": "/services",
  "component": "Services",
  "title": "Bicycle repair services",
  "description": "Explore the repair and maintenance services available at Harbor Repairs, including what each appointment covers.",
  "label": "Services",
  "icon": "home",
  "access": "public",
  "indexable": true,
  "primary": true
}
```

Use a distinct, useful title and description for every indexable page. Match the page's visible heading, content, and purpose. Add ordinary links between related pages; metadata cannot compensate for empty or misleading content.

`access: "private"` requires an authenticated client route and is always non-indexable. `access: "guest"` is for login/registration pages and is also non-indexable. New scaffolded pages are public but **not indexable** until deliberately configured. Backend authorization remains mandatory regardless of route configuration.

Optional `socialImage` and `socialImageAlt` override the site defaults for a page. Social previews should remain legible when cropped; include essential information in visible page text, not solely in the image.

## 3. Understand the generated output

Run `npm run build`. The build renders public page content and metadata into HTML before a browser executes JavaScript. Authenticated routes receive metadata-equipped SPA shells, without personal data. Browser navigation updates the same metadata policy.

The build generates canonical links, Open Graph and Twitter metadata, `robots.txt`, and `sitemap.xml`. The sitemap includes only deliberately indexable public routes. Tracking query parameters do not become canonical URLs. Unknown URLs return HTTP 404, not a duplicate home page.

Public content, routes, metadata, or brand changes require a rebuild and redeployment. Database-driven pages are not automatically enumerated or published by this baseline; explicitly extend the build with an authorized public data source if your product needs that capability.

Do not block pages in `robots.txt` when you expect crawlers to read their `noindex` directive. Do not block CSS or JavaScript needed to understand public content. See [Google's noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

Structured data should describe real content. The baseline does not invent Organization, LocalBusiness, Product, review, or rating claims. Add a relevant schema only when the page contains the corresponding verified information, and validate its escaped JSON before publishing.

## 4. Publish deliberately

1. Replace starter branding, copy, icons, and sharing images.
2. Confirm the final HTTPS origin and redirect alternate hostnames at your reverse proxy/CDN.
3. Review every route's access and indexing settings. Keep staging builds at `indexingEnabled: false`; use authentication for confidential previews.
4. Enable indexing, rebuild, and run `npm run test:seo`.
5. Check **View Source** for the actual page content, title, description, canonical, and sharing metadata. Test direct links with JavaScript disabled as well as client navigation.
6. Confirm unknown pages and missing assets return 404; private pages must not appear in the sitemap.
7. Verify ownership in Google Search Console, submit the production sitemap, and use URL Inspection on representative public pages.
8. Check mobile usability, accessibility, loading performance, and social previews. Recheck after route or domain changes.

Search engines decide whether and how to index a page. A valid sitemap and metadata improve clarity and discoverability; they do not guarantee indexing, rich results, or rankings.
