/** @module components.SeoMetadata
 * @description Keeps browser navigation metadata aligned with the build-rendered document.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import site from "../../../../../shared/site.json";
import routes from "../../../../../shared/routes.json";
import { metadataFor, renderHead } from "../../../../../shared/seo/seo.mjs";
/** Synchronize route-owned head nodes.
 * @returns {null} No visual output. */
export default function SeoMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const metadata = metadataFor(
      site,
      routes.find((route) => route.path === pathname) || {
        title: "Page not found",
      },
    );
    const template = document.createElement("template");
    template.innerHTML = renderHead(metadata);
    document.head
      .querySelectorAll(
        'title, meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]',
      )
      .forEach((node) => node.remove());
    document.head.append(template.content);
    document.documentElement.lang = metadata.language;
  }, [pathname]);
  return null;
}
