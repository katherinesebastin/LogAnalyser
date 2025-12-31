import React from 'react';

// In a real build, this might be an env variable
export const API_BASE_URL = 'http://localhost:5000/api';

export const COLORS = {
  primary: '#3b82f6', // blue-500
  success: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444',  // red-500
  info: '#0ea5e9',    // sky-500
  dark: '#1e293b',    // slate-800
  light: '#f8fafc',   // slate-50
};

export const LOG_LEVEL_COLORS: Record<string, string> = {
  INFO: 'text-green-400',
  DEBUG: 'text-blue-400',
  WARNING: 'text-yellow-400',
  ERROR: 'text-red-400',
  FAULT: 'text-red-600 font-bold',
  CRITICAL: 'text-red-600 font-bold',
};
