import Header from "../components/Header";
import React, { useState } from "react";
import animation from "../assets/travel.mp4";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import Google from "../assets/google.webp";
import Microsoft from "../assets/microsoft.webp";
import Apple from "../assets/apple.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Field cannot be Empty..");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/login/`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        navigate("/");
        toast.success("Successfully Logged In..");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again later." + err);
      }
    }
  };

  return (
    <>
      <Header />

      <div
        className="container-fluid d-flex align-items-center justify-content-center section-container"
        style={{ backgroundColor: "#fff", padding: "10px" }}
      >
        <div
          className="row shadow-lg rounded bg-white p-3 w-100"
          style={{ maxWidth: "1200px" }}
        >
          <div className="col-lg-6 col-12 d-flex flex-column justify-content-center overflow-x-hidden align-items-center text-center mb-4 mb-lg-0">
  <video 
    src={animation} 
    loop 
    autoPlay 
    style={{ width: "100%", height: "auto", objectFit: "contain" }} 
  ></video>
</div>


          <div
            className="col-lg-6 col-12 p-3 d-flex flex-column"
            style={{
              maxHeight: "600px",
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <h3
              className="mb-3 display-6 about-one-heading-text text-start"
            >
              Hey,
            </h3>
            <h3
              className="mb-4 display-6 about-one-heading-text text-start"
            >
              Welcome Back!
            </h3>

            <div className="row justify-content-center mb-3">
              {[Google, Apple, Microsoft].map((img, index) => (
                <div key={index} className="col-4 col-sm-3 mb-2">
                  <div className="card h-100" style={{ cursor: "pointer" }}>
                    <div className="card-body text-center p-2">
                      <img
                        src={img}
                        alt="social"
                        className="img-fluid"
                        style={{ maxHeight: "40px" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center my-2">
              <span className="text-dark">OR</span>
            </div>

            <form onSubmit={handleLogin}>
              <div className="modern-input mb-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder=" "
                />
                <label className="input-label">Email Address</label>
              </div>

              <div className="modern-input mb-4 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder=" "
                />
                <label className="input-label">Password</label>
                <span
                  onClick={handleShowPassword}
                  className="password-toggle position-absolute top-50 end-0 translate-middle-y me-2"
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </span>
              </div>

              <div className="d-flex justify-content-end align-items-center mb-3">
                <Link
                  to={"/forgot-password"}
                  className="text-decoration-none"
                  style={{ color: "#007674", fontSize: "16px" }}
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="login-button w-100 mx-auto d-block border-0 mb-3"
                style={{fontSize: '16px'}}
              >
                Let me In
              </button>

              <div
                className="text-center mt-3 display-6"
                style={{ fontSize: "16px", fontWeight: "600" }}
              >
                Don't have an account?{" "}
                <Link
                  to={"/signup"}
                  className="text-decoration-none ms-1"
                  style={{
                    fontSize: "16px",
                    color: "#007674",
                  }}
                >
                  Sign Up here!
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
