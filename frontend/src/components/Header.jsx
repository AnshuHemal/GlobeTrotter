import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/worksyde.png";

const Header = ({ activeTab = "home" }) => {
  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand me-auto" href="#">
          <img src={logo} alt="Worksyde Logo" height={40} />
        </a>

        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
              <img src={logo} alt="Worksyde Logo" height={40} />
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-center flex-grow-1 pe-3">
              <li className="nav-item" >
                <Link
                  className={`nav-link mx-lg-2 ${activeTab === "home" ? "active" : ""}`}
                  aria-current={activeTab === "home" ? "page" : undefined}
                  to={"/"}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link mx-lg-2 ${activeTab === "find-work" ? "active" : ""}`} to={"/login"}>
                  Find Work
                </Link>
              </li>
              <li className="nav-item">
                <a className={`nav-link mx-lg-2 ${activeTab === "find-talent" ? "active" : ""}`} href="#">
                  Find Talent
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link mx-lg-2 ${activeTab === "categories" ? "active" : ""}`} href="#">
                  Categories
                </a>
              </li>
              <li className="nav-item">
                <Link className={`nav-link mx-lg-2 ${activeTab === "about" ? "active" : ""}`} to={"/about"}>
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link mx-lg-2 ${activeTab === "contact" ? "active" : ""}`} to={"/contact"}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Link to="/login" className="login-button me-3">
          Log In
        </Link>
        <Link to="/signup" className="post-button">
          Sign Up
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
