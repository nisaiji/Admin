import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function NotRequireUser() {
  const user = localStorage.getItem("access_token");
  return !user ? <Outlet /> : <Navigate to="/" />;
}
