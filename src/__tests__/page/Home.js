import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Home from "../../pages/Home";

jest.mock("../../components/Navbar", () => () => <div>Navbar</div>);

function renderHome({
  path,
  role,
  isSessionCreated,
  includeOnboardRoute = true,
}) {
  const store = configureStore({
    reducer: {
      appAuth: () => ({ role, isSessionCreated }),
      appConfig: () => ({}),
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<div>Dashboard</div>} />
            {includeOnboardRoute ? (
              <Route path="onboard" element={<div>Onboard</div>} />
            ) : null}
          </Route>
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("Home onboarding redirects", () => {
  test("redirects admins without a session from home to onboarding", async () => {
    renderHome({
      path: "/",
      role: "admin",
      isSessionCreated: false,
    });

    expect(await screen.findByText("Onboard")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Navbar")).not.toBeInTheDocument();
  });

  test("keeps admins without a session on onboarding", async () => {
    renderHome({
      path: "/onboard",
      role: "admin",
      isSessionCreated: false,
    });

    expect(await screen.findByText("Onboard")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Navbar")).not.toBeInTheDocument();
  });

  test("redirects admins with a session away from onboarding to home", async () => {
    renderHome({
      path: "/onboard",
      role: "admin",
      isSessionCreated: true,
    });

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Navbar")).toBeInTheDocument();
    expect(screen.queryByText("Onboard")).not.toBeInTheDocument();
  });

  test("does not expose onboarding to non-admin routes", async () => {
    renderHome({
      path: "/onboard",
      role: "teacher",
      isSessionCreated: false,
      includeOnboardRoute: false,
    });

    expect(await screen.findByText("Not Found")).toBeInTheDocument();
    expect(screen.queryByText("Onboard")).not.toBeInTheDocument();
  });
});
