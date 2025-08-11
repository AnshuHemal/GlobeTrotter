import React, { useEffect, useState } from "react";
import { Button, Card, Row, Col, Container, Spinner } from "react-bootstrap";
import { FaEdit } from "react-icons/fa"; // Edit icon for the button
import { useUser } from "../contexts/UserContext"; // Importing the UserContext
import toast from "react-hot-toast";

const UserProfile = () => {
  const { userData, loading, fetchCurrentUser, clearUserData } = useUser(); // Using the context
  const [preplannedTrips, setPreplannedTrips] = useState([]);
  const [previousTrips, setPreviousTrips] = useState([]);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5000/api";

  // Fetch preplanned and previous trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const preplannedResponse = await axios.get(`${API_URL}/trips/preplanned`, {
          withCredentials: true,
        });
        setPreplannedTrips(preplannedResponse.data);

        const previousResponse = await axios.get(`${API_URL}/trips/previous`, {
          withCredentials: true,
        });
        setPreviousTrips(previousResponse.data);
      } catch (err) {
        setError("Failed to load trips.");
        toast.error("Failed to load trips.");
      }
    };

    if (userData) {
      fetchTrips();
    }
  }, [userData]); // Runs only when userData changes

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

  if (!userData) {
    return <div className="text-center" style={{ paddingTop: "50px" }}><h4>No User Data Found</h4></div>;
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
            {preplannedTrips.length > 0 ? (
              preplannedTrips.map((trip, index) => (
                <Col md={6} lg={4} className="mb-4" key={index}>
                  <Card>
                    <Card.Body>
                      <Card.Title>{trip.title}</Card.Title>
                      <Card.Text>{trip.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <p>No preplanned trips available.</p>
              </Col>
            )}
          </Row>
        </div>

        {/* Previous Trips */}
        <div className="mt-5">
          <h4>Previous Trips</h4>
          <Row>
            {previousTrips.length > 0 ? (
              previousTrips.map((trip, index) => (
                <Col md={6} lg={4} className="mb-4" key={index}>
                  <Card>
                    <Card.Body>
                      <Card.Title>{trip.title}</Card.Title>
                      <Card.Text>{trip.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <p>No previous trips available.</p>
              </Col>
            )}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default UserProfile;
