import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/Theme";
import { User, LogOut, Menu } from "lucide-react";
import { logoutUser } from "../services/auth.service";

const Topbar = ({ toggleSidebar }) => {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ firstName: "", lastName: "" });

  useEffect(() => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user) {
      setUserData(user);
    }
  }, []);

  const handleLogout = () => {
    // Call logout function from auth service
    logoutUser();
    
    // Navigate to home page
    navigate("/");
  };

  return (
    <header className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f111a] sm:px-6">
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 ml-0 lg:ml-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm hidden sm:inline">Connected</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 transition-colors bg-gray-100 rounded-lg dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          aria-label="Toggle theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        
        <div className="hidden sm:flex items-center gap-2">
          <User className="w-5 h-5" />
          <span className="text-sm">
            {userData.firstName
              ? `${userData.firstName} ${userData.lastName}`
              : "User"}
          </span>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 p-2 transition-colors bg-gray-100 rounded-lg dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
