import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ThemeProvider } from "./contexts/Theme";
import { DisasterProvider } from "./contexts/DisasterContext";
import { AlertProvider } from "./contexts/AlertContext";
import "./App.css";
import GoogleMapView from "./pages/GoogleMapView";
import Analytics from "./pages/Analytics";
import SimulationPage from "./pages/SimulationPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { verifyToken } from "./services/auth.service";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Check token validity on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
      
      if (token && storedAuth) {
        try {
          // Verify token with backend
          const isValid = await verifyToken();
          setIsAuthenticated(isValid);
        } catch (error) {
          console.error('Token verification error:', error);
          setIsAuthenticated(false);
        }
      } else {
        // Clear any stale auth data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Listen for storage changes (e.g., when another tab logs out)
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Close sidebar when screen resizes above lg breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  return (
    <ThemeProvider>
      <DisasterProvider>
        <AlertProvider>
          {isAuthenticated ? (
            <div className="flex flex-col h-screen bg-white dark:bg-[#0f111a] text-gray-900 dark:text-white">
              <Topbar toggleSidebar={toggleSidebar} />
              <div className="flex flex-1 h-[calc(100vh-56px)] overflow-hidden">
                <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-y-auto p-4 w-full">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/map" element={
                      <ProtectedRoute>
                        <GoogleMapView />
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    } />
                    <Route path="/simulation" element={
                      <ProtectedRoute>
                        <SimulationPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
                  </Routes>
                </main>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </AlertProvider>
      </DisasterProvider>
    </ThemeProvider>
  );
};

export default App;
