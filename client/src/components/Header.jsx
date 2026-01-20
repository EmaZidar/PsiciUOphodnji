
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header-container">
      <div className="header-inner">
        <div className="header-left">
          <Link className="brand" to="/">Pawpal</Link>
        </div>

        {/*  */}

        <div className="header-right">
          <div className="auth-actions">
            <a href="/login" className="btn signin">Sign in</a>
            <a href="/register" className="btn primary">Sign up</a>
          </div>
        </div>
      </div>
    </header>
  );
}

