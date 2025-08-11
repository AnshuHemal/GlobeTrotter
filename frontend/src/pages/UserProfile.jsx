import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Container, Spinner } from "react-bootstrap";
import { FaEdit } from "react-icons/fa"; // Edit icon for the button
import axios from "axios";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [preplannedTrips, setPreplannedTrips] = useState([]);
  const [previousTrips, setPreviousTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const userResponse = await axios.get(`${API_URL}/user/profile`, { withCredentials: true });
        setUserData(userResponse.data);
      } catch (err) {
        setError("Failed to load user profile.");
      }
    };

    // Fetch preplanned trips
    const fetchPreplannedTrips = async () => {
      try {
        const tripsResponse = await axios.get(`${API_URL}/trips/preplanned`, { withCredentials: true });
        setPreplannedTrips(tripsResponse.data);
      } catch (err) {
        setError("Failed to load preplanned trips.");
      }
    };

    // Fetch previous trips
    const fetchPreviousTrips = async () => {
      try {
        const tripsResponse = await axios.get(`${API_URL}/trips/previous`, { withCredentials: true });
        setPreviousTrips(tripsResponse.data);
      } catch (err) {
        setError("Failed to load previous trips.");
      }
    };

    // Call the fetch functions
    fetchUserProfile();
    fetchPreplannedTrips();
    fetchPreviousTrips();

    // Set loading to false once all data is fetched
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center" style={{ paddingTop: "50px" }}><h4>{error}</h4></div>;
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar navbar-light" style={{ backgroundColor: "#007674" }}>
        <a className="navbar-brand" href="#" style={{ color: "#fff", fontSize: "24px" }}>
          Globe Trotter
        </a>
      </nav>

      {/* User Profile */}
      <Container className="my-5">
        <Row>
          {/* Profile Info */}
          <Col md={4} className="d-flex justify-content-center">
            <img
              src={userData.profile_picture || "https://via.placeholder.com/150"} // Use the profile image from API
              alt="Profile"
              className="rounded-circle"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
          </Col>
          <Col md={8}>
            <h3>{userData.name}</h3>
            <p>{userData.bio}</p>
            <p>Email: {userData.email}</p>
            <Button variant="outline-primary" style={{ fontSize: "14px" }}>
              <FaEdit /> Edit Profile
            </Button>
          </Col>
        </Row>

        {/* Preplanned Trips */}
        <div className="mt-5">
          <h4>Preplanned Trips</h4>
          <Row>
            {preplannedTrips.map((trip, index) => (
              <Col md={6} lg={4} className="mb-4" key={index}>
                <Card>
                  <Card.Body>
                    <Card.Title>{trip.title}</Card.Title>
                    <Card.Text>{trip.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Previous Trips */}
        <div className="mt-5">
          <h4>Previous Trips</h4>
          <Row>
            {previousTrips.map((trip, index) => (
              <Col md={6} lg={4} className="mb-4" key={index}>
                <Card>
                  <Card.Body>
                    <Card.Title>{trip.title}</Card.Title>
                    <Card.Text>{trip.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default UserProfile;
