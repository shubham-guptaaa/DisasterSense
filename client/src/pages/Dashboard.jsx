import React from "react";
import DisasterSummary from "../components/DisasterSummary";
import DisasterTable from "../components/DisasterTable";
import AlertPanel from "../components/AlertPanel";

const Dashboard = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Disaster Monitoring Dashboard</h1>
      
      <div className="mb-6">
        <DisasterSummary />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Active Disaster Events</h2>
          <DisasterTable />
        </div>
        
        <div>
          <AlertPanel />
          
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                View Map
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                Analytics
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded">
                Alert Settings
              </button>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded">
                Simulation
              </button>
            </div>
          </div>
          
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Server Connection</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900 dark:text-green-200">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Data Stream</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Update</span>
                <span className="text-sm">
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