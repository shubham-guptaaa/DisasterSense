import React from "react";
import DisasterSummary from "../components/DisasterSummary";
import DisasterTable from "../components/DisasterTable";
import AlertPanel from "../components/AlertPanel";
import { Map, BarChart, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="container px-4 mx-auto">
      <h1 className="mb-6 text-xl font-bold sm:text-2xl">Disaster Monitoring Dashboard</h1>
      
      <div className="mb-6">
        <DisasterSummary />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold sm:text-xl">Active Disaster Events</h2>
          <div className="overflow-x-auto">
            <DisasterTable />
          </div>
        </div>
        
        <div>
          <AlertPanel />
          
          <div className="p-4 mt-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigateTo('/map')}
                className="flex items-center justify-center px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                <Map size={16} className="mr-2" />
                <span>View Map</span>
              </button>
              <button 
                onClick={() => navigateTo('/analytics')}
                className="flex items-center justify-center px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
              >
                <BarChart size={16} className="mr-2" />
                <span>Analytics</span>
              </button>
              <button 
                onClick={() => navigateTo('/simulation')}
                className="flex items-center justify-center px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600 col-span-2"
              >
                <Bell size={16} className="mr-2" />
                <span>Simulation</span>
              </button>
            </div>
          </div>
          
          <div className="p-4 mt-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base">Server Connection</span>
                <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base">Data Stream</span>
                <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base">Last Update</span>
                <span className="text-xs sm:text-sm">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;