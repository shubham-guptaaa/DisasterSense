import React from "react";
import { useTheme } from "../contexts/Theme";
import { User } from "lucide-react";

const Topbar = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f111a]">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm">Connected</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 transition-colors bg-gray-100 rounded-lg dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <span className="text-sm">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
