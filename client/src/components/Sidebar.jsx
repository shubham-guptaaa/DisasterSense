import React from "react";
import { LayoutDashboard, Map, Bell, BarChart2, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import GoogleMapView from "../pages/GoogleMapView";

const navItems = [
  { name: "Dashboard", icon: <LayoutDashboard />, path: "/" },
  { name: "Live Map", icon: <Map />, path: "/map" },
  // { name: "Alerts", icon: <Bell />, path: "/alerts" },
  { name: "Analytics", icon: <BarChart2 />, path: "/analytics" },
  { name: "Settings", icon: <Settings />, path: "/settings" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white dark:bg-[#0c0e17] border-r border-gray-200 dark:border-gray-800 flex flex-col p-4">
      <div className="mb-8 text-xl font-bold text-center text-gray-900 dark:text-white">🌐 DisasterSense</div>
      <nav className="flex flex-col gap-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
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
  );
};

export default Sidebar;