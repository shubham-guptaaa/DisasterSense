import React from "react";
import { LayoutDashboard, Map, Bell, BarChart2, Settings, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import GoogleMapView from "../pages/GoogleMapView";

const navItems = [
  { name: "Dashboard", icon: <LayoutDashboard />, path: "/" },
  { name: "Live Map", icon: <Map />, path: "/map" },
  // { name: "Alerts", icon: <Bell />, path: "/alerts" },
  { name: "Analytics", icon: <BarChart2 />, path: "/analytics" },
  { name: "Settings", icon: <Settings />, path: "/settings" },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#0c0e17] 
          border-r border-gray-200 dark:border-gray-800 flex flex-col p-4 transition-transform duration-300 ease-in-out
          lg:static lg:z-0
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="text-xl font-bold text-gray-900 dark:text-white">🌐 DisasterSense</div>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1a1c2c] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-[#1a1c2c] transition ${
                  isActive 
                    ? "bg-gray-100 dark:bg-[#1a1c2c] text-gray-900 dark:text-white" 
                    : "text-gray-600 dark:text-gray-400"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;