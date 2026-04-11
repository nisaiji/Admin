import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  // Function to format breadcrumb labels
  const formatLabel = (label) => {
    return label
      .replace(/-/g, " ") // Replace dashes with spaces
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter
  };

  return (
    <nav data-testid="breadcrumbs" aria-label="breadcrumb" className="mb-2">
      <ol className="breadcrumb flex">
        <li className="breadcrumb-item">
          <Link
            to="/"
            className={`${isDarkMode ? "text-textPrimary" : "text-textGray"}`}
          >
            Dashboard
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to} className="breadcrumb-item flex items-center">
              <span
                className={`mx-2 ${
                  isDarkMode ? "text-textPrimary" : "text-textBlack"
                }`}
              >
                /
              </span>
              {isLast ? (
                <span className={`text-textBlue`}>{formatLabel(value)}</span>
              ) : (
                <Link
                  to={to}
                  className={`${
                    isDarkMode ? "text-textPrimary" : "text-textGray"
                  }`}
                >
                  {formatLabel(value)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
