/**
 * Application Configuration
 * 
 * IMPORTANT: Update these values to match your network setup
 * Change the IP addresses to your machine's IP address on the network
 * 
 * To find your IP address:
 * - Windows: Open Command Prompt and run: ipconfig
 * - Mac/Linux: Open Terminal and run: ifconfig or ip addr
 * - Look for IPv4 Address (e.g., 192.168.1.8)
 */

// Main Backend API (Port 8001) - User & Vehicle Management
export const API_BASE_URL = 'http://192.168.1.8:8001';

// YOLO Service API (Port 8003) - Plate Detection & Parking Status
export const YOLO_BASE_URL = 'http://192.168.1.8:8003';

// WebSocket URL for live plate detection
export const WS_BASE_URL = 'ws://192.168.1.8:8003';

/**
 * API Endpoints
 * These are relative paths that will be appended to the base URLs
 */
export const API_ENDPOINTS = {
  // User Management
  getUser: (uid: string) => `${API_BASE_URL}/user/${uid}`,
  register: `${API_BASE_URL}/register`,
  pendingApprovals: (page = 1, limit = 10) => 
    `${API_BASE_URL}/pending-approvals?page=${page}&limit=${limit}`,
  approveUser: (id: string) => `${API_BASE_URL}/approve/${id}`,
  rejectUser: (id: string) => `${API_BASE_URL}/reject/${id}`,
  
  // Vehicle Management
  registerVehicle: (uid: string) => `${API_BASE_URL}/register-vehicle/${uid}`,
  unapprovedVehicles: `${API_BASE_URL}/unapproved-vehicles`,
  approveVehicle: (id: string) => `${API_BASE_URL}/approve-vehicle/${id}`,
  rejectVehicle: (id: string) => `${API_BASE_URL}/reject-vehicle/${id}`,
  
  // YOLO Service - Parking Status (based on unique plates in DB)
  parkingStatus: `${YOLO_BASE_URL}/parking-status`,
  parkingStatusWS: `${WS_BASE_URL}/ws/parking-status`,
  userHistory: (uid: string) => `${YOLO_BASE_URL}/user-history?uid=${uid}`,
  
  // WebSocket
  plateDetection: `${WS_BASE_URL}/ws/plates`,
};

/**
 * Development Helper
 * Logs the current configuration to help with debugging
 */
export const logConfig = () => {
  console.log('=== Zenpark Configuration ===');
  console.log('API Base URL:', API_BASE_URL);
  console.log('YOLO Base URL:', YOLO_BASE_URL);
  console.log('WebSocket URL:', WS_BASE_URL);
  console.log('============================');
};

export default {
  API_BASE_URL,
  YOLO_BASE_URL,
  WS_BASE_URL,
  API_ENDPOINTS,
  logConfig,
};
