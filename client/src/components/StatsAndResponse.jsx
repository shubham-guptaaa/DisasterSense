import React from 'react';

const StatsAndResponse = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Stats Box */}
      <div className="bg-[#1a1c2c] rounded-xl p-4">
        <h4 className="font-semibold mb-2">Stats</h4>
        <p className="text-sm text-gray-400">Taking a graph</p>
        <div className="h-24 bg-gray-800 rounded mt-2" />
      </div>

      {/* Response Tracker */}
      <div className="bg-[#1a1c2c] rounded-xl p-4">
        <h4 className="font-semibold mb-2">Response Tracker</h4>
        <ul className="text-sm space-y-1">
          <li>✅ Earthquake response underway</li>
          <li>✅ Monitoring flood situation</li>
        </ul>
      </div>
    </div>
  );
};

export default StatsAndResponse;
