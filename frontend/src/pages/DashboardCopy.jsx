import React, { useEffect, useState } from "react";
import FreelancersDashboard from "./Freelancers/FreelancersDashboard";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    axios
      .get(`${API_URL}/current-user/`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Modernized layout wrapper, content unchanged */}
        {!user ? (
          <div className="text-center mt-5">
            <p>Fetching User details...</p>
          </div>
        ) : user.role == "client" ? (
          navigate("/ws/client/dashboard") || null
        ) : user.role == "freelancer" ? (
          navigate("/ws/find-work") || null
        ) : user.role == "admin" ? (
          navigate("/ws/admin/overview") || null
        ) : (
          <div>Fetching User details...</div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
