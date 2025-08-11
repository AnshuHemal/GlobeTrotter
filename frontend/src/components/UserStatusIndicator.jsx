import React from "react";
import { BsCircleFill } from "react-icons/bs";

const UserStatusIndicator = ({ status, size = 8, showText = false }) => {
  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "#28a745";
      case "offline":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="d-flex align-items-center">
      <BsCircleFill
        size={size}
        style={{ color: getStatusColor() }}
        className="me-1"
      />
      {showText && (
        <span style={{ fontSize: "12px", color: getStatusColor() }}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default UserStatusIndicator; 