// Import core React library
import ReactDOM from "react-dom/client"; // React DOM client for rendering the React application

// Import Redux's Provider component for state management
import { Provider } from "react-redux"; // Used to provide the Redux store to the application

// Import BrowserRouter from React Router for managing routing with hash-based URLs
import { BrowserRouter } from "react-router-dom";

// Import the main App component
import App from "./App.jsx"; // The root component of the application

// Import global CSS styles
import "./index.css"; // Styles applied across the entire application

// Import the Redux store
import store from "./store/store.js"; // Centralized store for managing application state
import React from "react";

// Initialize and render the React application
ReactDOM.createRoot(document.getElementById("root")).render(
  /**
   * Wrap the application with HashRouter for routing functionality.
   * - Ensures that the app's routing works with hash-based URLs (useful for environments like GitHub Pages).
   */
  <BrowserRouter>
    <Provider store={store}>
      {/* Render the root App component */}
      <App />
    </Provider>
  </BrowserRouter>
);
