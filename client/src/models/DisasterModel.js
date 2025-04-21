/**
 * Disaster Model
 * Represents a disaster event with its properties
 */

// Disaster types
export const DISASTER_TYPES = {
  EARTHQUAKE: 'EARTHQUAKE',
  FLOOD: 'FLOOD',
  FIRE: 'FIRE',
  STORM: 'STORM',
  OTHER: 'OTHER',
};

// Disaster status
export const DISASTER_STATUS = {
  DETECTED: 'DETECTED',   // Initially detected
  MONITORING: 'MONITORING', // Under observation
  RESPONDING: 'RESPONDING', // Emergency response ongoing
  CONTAINED: 'CONTAINED',  // Under control
  RESOLVED: 'RESOLVED',   // No longer a threat
};

/**
 * Get appropriate color for disaster type
 * @param {string} type - Disaster type
 * @returns {string} - Hex color code
 */
export const getDisasterColor = (type) => {
  const colors = {
    [DISASTER_TYPES.EARTHQUAKE]: '#FF5252', // Red
    [DISASTER_TYPES.FLOOD]: '#2196F3',      // Blue
    [DISASTER_TYPES.FIRE]: '#FF9800',       // Orange
    [DISASTER_TYPES.STORM]: '#8E24AA',      // Purple
    [DISASTER_TYPES.OTHER]: '#757575',      // Gray
  };
  
  return colors[type] || colors.OTHER;
};

/**
 * Calculate disaster impact radius based on severity
 * @param {number} severity - Disaster severity (1-10)
 * @returns {number} - Radius in meters
 */
export const getDisasterRadius = (severity) => {
  // Scale: 1-3 (small), 4-6 (medium), 7-10 (large)
  if (severity >= 1 && severity <= 3) return 2000;  // 2km
  if (severity >= 4 && severity <= 6) return 5000;  // 5km
  return 10000; // 10km for severe disasters (7-10)
};

/**
 * Get descriptive text for a disaster based on its type and severity
 * @param {object} disaster - Disaster object
 * @returns {string} - Human-readable description
 */
export const getDisasterDescription = (disaster) => {
  if (disaster.description) return disaster.description;
  
  const type = disaster.type.toLowerCase();
  const severityText = getSeverityText(disaster.severity);
  
  const descriptions = {
    [DISASTER_TYPES.EARTHQUAKE.toLowerCase()]: `A ${severityText} earthquake has been detected in this area. ${getEvacuationAdvice(disaster)}`,
    [DISASTER_TYPES.FLOOD.toLowerCase()]: `${severityText} flooding has been reported in this region. ${getEvacuationAdvice(disaster)}`,
    [DISASTER_TYPES.FIRE.toLowerCase()]: `A ${severityText} fire is active in this area. ${getEvacuationAdvice(disaster)}`,
    [DISASTER_TYPES.STORM.toLowerCase()]: `A ${severityText} storm is affecting this region. ${getEvacuationAdvice(disaster)}`,
    [DISASTER_TYPES.OTHER.toLowerCase()]: `A ${severityText} disaster has been reported. ${getEvacuationAdvice(disaster)}`,
  };
  
  return descriptions[type] || descriptions[DISASTER_TYPES.OTHER.toLowerCase()];
};

/**
 * Get text representation of severity
 * @param {number} severity - Severity level (1-10)
 * @returns {string} - Descriptive text
 */
export const getSeverityText = (severity) => {
  if (severity >= 1 && severity <= 3) return 'minor';
  if (severity >= 4 && severity <= 6) return 'moderate';
  if (severity >= 7 && severity <= 8) return 'severe';
  return 'catastrophic';
};

/**
 * Get evacuation advice based on disaster status and severity
 * @param {object} disaster - Disaster object
 * @returns {string} - Evacuation advice
 */
export const getEvacuationAdvice = (disaster) => {
  if (disaster.status === DISASTER_STATUS.RESOLVED) {
    return 'The situation has been resolved, but remain cautious.';
  }
  
  if (disaster.status === DISASTER_STATUS.CONTAINED) {
    return 'The situation is under control, but avoid unnecessary travel in the affected area.';
  }
  
  if (disaster.severity >= 7) {
    return 'Immediate evacuation is strongly recommended.';
  }
  
  if (disaster.severity >= 4) {
    return 'Be prepared to evacuate if authorities recommend.';
  }
  
  return 'Stay informed about the situation.';
};

export default {
  DISASTER_TYPES,
  DISASTER_STATUS,
  getDisasterColor,
  getDisasterRadius,
  getDisasterDescription,
  getSeverityText,
  getEvacuationAdvice,
}; 