import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import Dashboard from "./pages/Dashboard";
import JobPrefrences from "./pages/JobPrefrences";
import JobListings from "./pages/JobListings";
import UserPrefJobListing from "./pages/UserPrefJobListing";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { start_service_notification } from "./lib/notification";

function App() {

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();


      if (!data.user || error) {
        return;
      }

      const userId = data.user.id;
      const publicUrl = import.meta.env.VITE_SUPABASE_URL as string
      const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

      if (!publicUrl || !publicKey) {
        throw new Error('Missing supabase env variables')
      }

      const res = await start_service_notification(publicUrl, publicKey, userId);

      if (res) {
        console.log("Service started")
      } else {
        console.log("Service not started")
      }


    };
    checkAuth();
  }, [])

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-listings"
              element={
                <ProtectedRoute>
                  <JobListings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-preferences"
              element={
                <ProtectedRoute>
                  <JobPrefrences />
                </ProtectedRoute>
              }
            />
            <Route
            path="/user-job-pref"
            element={
              <ProtectedRoute>
                <UserPrefJobListing></UserPrefJobListing>
              </ProtectedRoute>
            }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
