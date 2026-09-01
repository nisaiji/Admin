// src/pages/NotFound.jsx
import React from "react";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.text}>Page Not Found</p>
      <a href="/" style={styles.link}>
        Go to Home
      </a>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "#fff",
  },
  code: {
    fontSize: "80px",
    fontWeight: "bold",
  },
  text: {
    fontSize: "18px",
    marginBottom: "20px",
  },
  link: {
    color: "#38bdf8",
    textDecoration: "none",
    fontWeight: "600",
  },
};
