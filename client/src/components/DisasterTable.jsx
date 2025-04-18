import React, { useState } from 'react';
import { useDisasters } from '../contexts/DisasterContext';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const DisasterTable = () => {
  const { disasters, loading, error, filterDisasters, resetFilters, activeFilters } = useDisasters();
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort disasters
  const sortedDisasters = [...disasters].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle nested fields for sorting
    if (sortField === 'location.coordinates[1]') {
      aValue = a.location?.coordinates?.[1] || 0;
      bValue = b.location?.coordinates?.[1] || 0;
    } else if (sortField === 'location.coordinates[0]') {
      aValue = a.location?.coordinates?.[0] || 0;
      bValue = b.location?.coordinates?.[0] || 0;
    }

    // Handle dates for sorting
    if (sortField === 'createdAt' || sortField === 'startTime') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get severity class
  const getSeverityClass = (severity) => {
    if (severity >= 1 && severity <= 3) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (severity >= 4 && severity <= 6) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    } else {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'DETECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'MONITORING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'RESPONDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CONTAINED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    filterDisasters({ [name]: value });
  };

  if (loading) {
    return <div className="text-center py-4">Loading disaster data...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="type" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={activeFilters.type}
              onChange={handleFilterChange}
              className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All Types</option>
              <option value="EARTHQUAKE">Earthquake</option>
              <option value="FLOOD">Flood</option>
              <option value="FIRE">Fire</option>
              <option value="STORM">Storm</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="severity" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Severity
            </label>
            <select
              id="severity"
              name="severity"
              value={activeFilters.severity}
              onChange={handleFilterChange}
              className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All Severities</option>
              <option value="1">1+</option>
              <option value="3">3+</option>
              <option value="5">5+</option>
              <option value="7">7+</option>
              <option value="9">9+</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={activeFilters.status}
              onChange={handleFilterChange}
              className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All Statuses</option>
              <option value="DETECTED">Detected</option>
              <option value="MONITORING">Monitoring</option>
              <option value="RESPONDING">Responding</option>
              <option value="CONTAINED">Contained</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div className="ml-auto">
            <label className="block text-xs font-medium text-transparent dark:text-transparent mb-1">
              Reset
            </label>
            <button
              onClick={resetFilters}
              className="block py-1 px-3 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('type')}
              >
                Type
                {sortField === 'type' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('severity')}
              >
                Severity
                {sortField === 'severity' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('location.coordinates[1]')}
              >
                Location
                {sortField === 'location.coordinates[1]' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
                {sortField === 'status' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                Created At
                {sortField === 'createdAt' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {sortedDisasters.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No disasters found with the current filters
                </td>
              </tr>
            ) : (
              sortedDisasters.map((disaster) => (
                <tr key={disaster._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    {disaster.type}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityClass(disaster.severity)}`}>
                      {disaster.severity}/10
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {disaster.location?.coordinates ? (
                      <>
                        {disaster.location.coordinates[1].toFixed(4)}, {disaster.location.coordinates[0].toFixed(4)}
                      </>
                    ) : (
                      'Unknown'
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(disaster.status)}`}>
                      {disaster.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(disaster.createdAt)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
        Showing {sortedDisasters.length} of {disasters.length} disasters
      </div>
    </div>
  );
};

export default DisasterTable; 