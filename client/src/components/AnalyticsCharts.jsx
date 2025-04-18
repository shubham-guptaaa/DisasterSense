import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

const trendData = [
  { name: 'Jan', earthquakes: 4, floods: 2, wildfires: 1, storms: 3 },
  { name: 'Feb', earthquakes: 3, floods: 1, wildfires: 0, storms: 5 },
  { name: 'Mar', earthquakes: 5, floods: 3, wildfires: 2, storms: 2 },
  { name: 'Apr', earthquakes: 7, floods: 4, wildfires: 3, storms: 1 },
  { name: 'May', earthquakes: 4, floods: 6, wildfires: 5, storms: 0 },
  { name: 'Jun', earthquakes: 6, floods: 8, wildfires: 8, storms: 2 },
  { name: 'Jul', earthquakes: 8, floods: 7, wildfires: 10, storms: 4 },
];

const distributionData = [
  { name: 'Earthquakes', value: 24, color: '#FF5252' },
  { name: 'Floods', value: 18, color: '#4FC3F7' },
  { name: 'Wildfires', value: 12, color: '#FF9800' },
  { name: 'Storms', value: 9, color: '#7C4DFF' },
];

const comparisonData = [
  { name: 'California', earthquakes: 14, floods: 3, wildfires: 8, storms: 2 },
  { name: 'Texas', earthquakes: 2, floods: 7, wildfires: 3, storms: 4 },
  { name: 'Florida', earthquakes: 0, floods: 5, wildfires: 1, storms: 6 },
  { name: 'New York', earthquakes: 3, floods: 2, wildfires: 0, storms: 3 },
];

const AnalyticsCharts = ({ chartType }) => {
  const renderChart = () => {
    switch(chartType) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="earthquakes" stroke="#FF5252" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="floods" stroke="#4FC3F7" />
              <Line type="monotone" dataKey="wildfires" stroke="#FF9800" />
              <Line type="monotone" dataKey="storms" stroke="#7C4DFF" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="earthquakes" fill="#FF5252" />
              <Bar dataKey="floods" fill="#4FC3F7" />
              <Bar dataKey="wildfires" fill="#FF9800" />
              <Bar dataKey="storms" fill="#7C4DFF" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <div className="flex justify-center items-center h-full text-gray-400">
            Select a chart type to view data
          </div>
        );
    }
  };

  return (
    <div className="h-full">
      {renderChart()}
    </div>
  );
};

export default AnalyticsCharts;