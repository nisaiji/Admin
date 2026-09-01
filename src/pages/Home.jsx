import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";

export default function Home() {
  const { role, isSessionCreated } = useSelector((state) => state.appAuth);
  const location = useLocation();
  const isOnboardingPath = location.pathname === "/onboard";
  const requiresOnboarding =
    role === "admin" && isSessionCreated === false;

  if (requiresOnboarding && !isOnboardingPath) {
    return <Navigate to="/onboard" replace />;
  }

  if (role === "admin" && isOnboardingPath && isSessionCreated === true) {
    return <Navigate to="/" replace />;
  }

  const showNav = !isOnboardingPath;

  return (
    <>
      {showNav && <Navbar />}
      <Outlet />
    </>
  );
}
