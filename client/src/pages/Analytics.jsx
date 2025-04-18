import React, { useState } from 'react';
import { BarChart, LineChart, PieChart, Calendar, Filter } from 'lucide-react';
import AnalyticsCharts from '../components/AnalyticsCharts';

const Analytics = () => {
  const [activeChart, setActiveChart] = useState('trend');
  
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Analytics & Trends</h1>
        <div className="flex gap-2 items-center">
          <div className="bg-[#1a1c2c] rounded-lg p-2 flex items-center gap-1">
            <Calendar size={16} />
            <span className="text-sm">Last 30 days</span>
          </div>
          <div className="bg-[#1a1c2c] rounded-lg p-2">
            <Filter size={16} />
          </div>
        </div>
      </div>
      
      {/* Chart Type Selector */}
      <div className="bg-[#1a1c2c] rounded-xl p-4">
        <div className="flex gap-4 mb-4">
          <button 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${activeChart === 'trend' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveChart('trend')}
          >
            <LineChart size={16} />
            <span>Trend Analysis</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${activeChart === 'distribution' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveChart('distribution')}
          >
            <PieChart size={16} />
            <span>Distribution</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${activeChart === 'comparison' ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setActiveChart('comparison')}
          >
            <BarChart size={16} />
            <span>Comparison</span>
          </button>
        </div>
        
        {/* Chart Display Area */}
        <div className="h-80 bg-gray-800 rounded-lg">
          <AnalyticsCharts chartType={activeChart} />
        </div>
      </div>
      
      {/* Rest of your Analytics page... */}
    </div>
  );
};

export default Analytics;