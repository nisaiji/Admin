import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Function to format breadcrumb labels
  const formatLabel = (label) => {
    return label
      .replace(/-/g, " ") // Replace dashes with spaces
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter
  };

  return (
    <nav aria-label="breadcrumb" className="mb-2">
      <ol className="breadcrumb flex">
        <li className="breadcrumb-item">
          <Link to="/" className="text-gray-500">
            Dashboard
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to} className="breadcrumb-item flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-blue-500">{formatLabel(value)}</span>
              ) : (
                <Link to={to} className="text-gray-500">
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
