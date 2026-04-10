import React, { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";

export default function Home() {
  const { role, isSessionCreated } = useSelector((state) => state.appAuth);
  const location = useLocation();

  console.log(role,isSessionCreated,location.pathname);
  if (
    role === "admin" &&
    isSessionCreated === false &&
    location.pathname !== "/onboard"
  ) {
    return <Navigate to="/onboard" />;
  }

  const showNav = location.pathname !== "/onboard";
  console.log(showNav);

  return (
    <>
      {showNav && <Navbar />}
      <Outlet />
    </>
  );
}
