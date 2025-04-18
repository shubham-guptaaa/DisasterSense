import React from "react";
import { Routes, Route } from "react-router-dom";
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

const App = () => {
  return (
    <ThemeProvider>
      <DisasterProvider>
        <AlertProvider>
          <div className="flex h-screen bg-white dark:bg-[#0f111a] text-gray-900 dark:text-white">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <Topbar />
              <main className="overflow-y-auto p-4">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/map" element={<GoogleMapView />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/simulation" element={<SimulationPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </AlertProvider>
      </DisasterProvider>
    </ThemeProvider>
  );
};

export default App;
