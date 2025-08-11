import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import { RefreshHandler } from "./RefreshHandler";
import ProtectedRoute from "./ProtectedRoute";
import { useUser } from "./contexts/UserContext";

const App = () => {
  const { userData, loading } = useUser();
  const isAuthenticated = !!userData;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        <RefreshHandler />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/"
            element={
              isAuthenticated ? (
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DashboardPage />
                </ProtectedRoute>
              ) : (
                <LoginPage />
              )
            }
          ></Route>
        </Routes>
      </div>
    </>
  );
};

export default App;
