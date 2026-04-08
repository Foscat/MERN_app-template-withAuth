/**
 * @module components.parts.PageHeader.index
 * @description Reusable presentational UI part component.
 */
import React from "react";
import "./styles.css";

// TODO: Convert to RSuite
const PageHeader = ({ title, jobTitle, subTitle, timespan }) => {
  return (
    <header className="page-header glass-card fade-in">
      <h1 className="page-header-title">{title}</h1>

      {(jobTitle || timespan) && (
        <h2 className="page-header-subtitle">{`${jobTitle} ${timespan}`}</h2>
      )}

      {subTitle && <p>{subTitle}</p>}
    </header>
  );
};

export default PageHeader;
