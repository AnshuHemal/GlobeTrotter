import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/worksyde.png";
import { RiChatSmileAiLine } from "react-icons/ri";
import { BsGlobe, BsBell, BsCircleFill, BsPeople, BsGeoAlt } from "react-icons/bs";
import { TfiHelp } from "react-icons/tfi";
import { LuCircleUser, LuSettings } from "react-icons/lu";
import { MdOutlineLightMode } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import tarz from "../assets/2.png";
import UserStatusIndicator from "./UserStatusIndicator";
import { useUser } from "../contexts/UserContext";

const Header2 = () => {
  const { userData, loading, fetchCurrentUser, clearUserData } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const dropdownRef = useRef(null);
  
  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };
  
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = "http://localhost:5000/api/auth";

  // Function to mask email address
  const maskEmail = (email) => {
    if (!email) return "user@example.com";
    
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    
    if (localPart.length <= 3) {
      return `${localPart}*****@${domain}`;
    }
    
    const visiblePart = localPart.substring(0, 3);
    return `${visiblePart}*****@${domain}`;
  };

  // Fetch profile photo when user data changes
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      // Only fetch if user is authenticated and has profile photo
      if (userData?.hasProfilePhoto && userData?._id) {
        try {
          const response = await axios.get(`${API_URL}/profile/photo/`, {
            withCredentials: true
          });
          
          if (response.data.success && response.data.photo) {
            // Convert base64 to blob URL
            const byteCharacters = atob(response.data.photo);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: response.data.contentType });
            const url = URL.createObjectURL(blob);
            setProfilePhotoUrl(url);
          }
        } catch (error) {
          console.error("Error fetching profile photo:", error);
          setProfilePhotoUrl(null);
        }
      } else {
        setProfilePhotoUrl(null);
      }
    };

    fetchProfilePhoto();
  }, [userData?.hasProfilePhoto, userData?._id, API_URL]);

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (profilePhotoUrl) {
        URL.revokeObjectURL(profilePhotoUrl);
      }
    };
  }, [profilePhotoUrl]);

  // Get profile photo URL
  const getProfilePhotoUrl = () => {
    return profilePhotoUrl || logo;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on the profile icon or its children
      const profileIcon = event.target.closest('[data-profile-icon]');
      if (profileIcon) {
        return; // Don't close if clicking on the profile icon
      }
      
      // Close dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Update last seen when user is active
  useEffect(() => {
    if (!userData || userData.onlineStatus !== "online") return;

    const updateLastSeen = async () => {
      try {
        await axios.post(
          `${API_URL}/update-last-seen/`,
          {},
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error updating last seen:", error);
      }
    };

    // Update every 2 minutes when user is online
    const interval = setInterval(updateLastSeen, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userData?.onlineStatus, API_URL]);

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/logout/`,
        {},
        { withCredentials: true }
      );

      if (response?.data?.success) {
        clearUserData();
        navigate("/");
        toast.success("Successfully Logged out..");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleOnlineStatusToggle = async (e) => {
    e.preventDefault();
    if (updatingStatus) return;

    const newStatus = e.target.checked ? "online" : "offline";
    setUpdatingStatus(true);

    try {
      const response = await axios.post(
        `${API_URL}/update-online-status/`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        // Update user data in context
        await fetchCurrentUser();
        
        // Dispatch custom event to notify other components about status change
        window.dispatchEvent(new CustomEvent('onlineStatusChanged', {
          detail: { status: newStatus }
        }));
        
        // Also update localStorage for cross-tab communication
        localStorage.setItem('onlineStatus', newStatus);
        
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      // Revert the checkbox
      e.target.checked = !e.target.checked;
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand me-auto" to={"/"}>
          <h4 style={{ color: "#007674", fontWeight: 600 }}>GlobeTrotter</h4>
        </Link>

        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
              <h4 style={{ color: "#007674", fontWeight: 600 }}>GlobeTrotter</h4>
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
              <li className="nav-item">
                <Link
                  className={`nav-link mx-lg-2${
                    location.pathname === "/"
                      ? " active"
                      : ""
                  }`}
                  to={"/"}
                >
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link mx-lg-2${
                    location.pathname.startsWith("/plan-trip")
                      ? " active"
                      : ""
                  }`}
                  to={"/plan-trip"}
                >
                  Plan a Trip
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className=" d-flex align-items-center gap-4 me-3">
          <TfiHelp className="icon-hover" size={20} />
          <BsBell className="icon-hover" size={20} />

          {/* Profile Image with Online Status - Only show if user is authenticated */}
          {userData && (
            <>
              {loading ? (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    height: 32,
                    width: 32,
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                  }}
                  data-profile-icon
                  onClick={(e) => toggleDropdown(e)}
                >
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div
                  className="position-relative"
                  style={{ cursor: "pointer" }}
                  data-profile-icon
                  onClick={(e) => toggleDropdown(e)}
                >
                  <img
                    src={getProfilePhotoUrl()}
                    alt="Profile"
                    className="rounded-circle"
                    height={32}
                    width={32}
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = logo; // Fallback to logo if image fails to load
                    }}
                  />
                  {/* Online Status Indicator */}
                  <BsCircleFill
                    className="position-absolute"
                    size={12}
                    style={{
                      bottom: 0,
                      right: 0,
                      color:
                        userData?.onlineStatus === "online"
                          ? "#28a745"
                          : "#6c757d",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      border: "2px solid white",
                    }}
                  />
                </div>
              )}
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div ref={dropdownRef} className="profile-dropdown shadow-sm">
                  <div className="profile-header d-flex align-items-center gap-3">
                    <img
                      src={getProfilePhotoUrl()}
                      className="rounded-circle"
                      height={40}
                      width={40}
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = logo;
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: "600" }}>
                        {loading ? "Loading..." : userData?.name || "User"}
                      </div>
                      <div className="text-muted" style={{ fontSize: "14px" }}>
                        {maskEmail(userData?.email)}
                      </div>
                      {/* Location Information */}
                      {(userData?.country || userData?.city) && (
                        <div className="text-muted" style={{ fontSize: "12px" }}>
                          <BsGeoAlt className="me-1" />
                          {userData?.city && userData?.country 
                            ? `${userData.city}, ${userData.country}`
                            : userData?.city || userData?.country || "Location not set"
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  <Link to={`/profile`} className="dropdown-item align-items-center" onClick={closeDropdown}>
                    <LuCircleUser
                      style={{ width: "20px", height: "18px" }}
                      className="me-2"
                    />{" "}
                    Your Profile
                  </Link>
                  
                  <div className="dropdown-item d-flex justify-content-between align-items-center">
                    <div>
                      <MdOutlineLightMode
                        style={{ width: "20px", height: "18px" }}
                        className="me-2"
                      />
                      Theme: Light
                    </div>
                    <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultChecked
                      />
                    </div>
                  </div>

                  <div className="dropdown-divider my-2" />
                  <a className="dropdown-item text-danger" onClick={(e) => {
                    handleLogout(e);
                    closeDropdown();
                  }}>
                    <FiLogOut
                      style={{ width: "20px", height: "18px" }}
                      className="me-2 logout-icon"
                    />
                    Log out
                  </a>
                </div>
              )}
            </>
          )}
        </div>

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

export default Header2;
