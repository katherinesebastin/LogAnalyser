# macOS Log Analyzer - Backend

A Python backend for analyzing macOS system logs using the Unified Logging System. This tool provides a RESTful API to query various log types from macOS 10.12+ (Sierra and later).

## 🎯 Project Overview

This is the **backend** component of a macOS Log Analyzer. It provides a Flask-based REST API that queries macOS Unified Logging System and returns structured log data in JSON format. The frontend (web interface) is handled by a separate team member.

### Architecture

- **Backend**: Python/Flask (this repository) - REST API
- **Frontend**: Web interface (separate repository) - User interface

## ⚠️ System Requirements

### **macOS 10.12+ (Sierra or later) is REQUIRED**

This tool **only supports macOS 10.12+**. It will **NOT work** on older macOS versions.

### Why macOS 10.12+ is Required

macOS 10.12 (Sierra) introduced the **Unified Logging System**, which replaced legacy text-based log files:

- **Unified Logging System** (macOS 10.12+):
  - Stores logs in a binary format for efficiency
  - Provides structured querying via predicates
  - Uses the `log` command-line tool
  - Offers better performance and filtering
  - This tool uses this system ✅

- **Legacy Logging** (macOS 10.11 and earlier):
  - Text-based log files in `/var/log/*`
  - No structured querying
  - Different format entirely
  - This tool does NOT support this ❌

### Additional Requirements

- **Python 3.8+** (3.10+ recommended)
- **Administrative access** may be required for some log types
- **Internet connection** for installing dependencies (first time only)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd LogAnalyzer
```

### 2. Create and Activate Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it (macOS/Linux)
source venv/bin/activate

# Your prompt should show (venv) now
```

**Why use a virtual environment?**
- Keeps project dependencies isolated from system packages
- Ensures consistent versions across team members
- Makes deployment easier
- Prevents conflicts with other Python projects

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Verify System Compatibility

```bash
python backend/utils/system_check.py
```

You should see:
```
macOS X.X is compatible (10.12+ required)
Unified Logging System found at: /usr/bin/log
```

### 5. Start the Backend Server

```bash
python run.py
```

The API will be available at `http://127.0.0.1:5000`

You should see:
```
macOS Log Analyzer Backend
========================================
✓ macOS X.X is compatible (10.12+ required)
✓ Unified Logging System found at: /usr/bin/log

Starting API server...
API available at: http://127.0.0.1:5000
```

### 6. Test the API

In another terminal:

```bash
# Health check
curl http://127.0.0.1:5000/api/health

# Get system logs
curl "http://127.0.0.1:5000/api/logs/system?limit=5"
```

## 📁 Project Structure

```
LogAnalyzer/
├── backend/
│   ├── parsers/          # Log parsers
│   │   ├── __init__.py
│   │   ├── base_parser.py
│   │   ├── unified_log_parser.py
│   │   ├── crash_log_parser.py
│   │   └── package_log_parser.py
│   ├── analyzers/        # Analysis logic (future: stats, timelines)
│   │   └── __init__.py
│   ├── api/              # Flask API endpoints
│   │   ├── __init__.py
│   │   └── app.py
│   └── utils/            # Helper utilities
│       ├── __init__.py
│       └── system_check.py
├── tests/                # Unit and integration tests
│   └── __init__.py
├── venv/                 # Virtual environment (gitignored)
├── .gitignore
├── requirements.txt
├── run.py                # Main entry point
└── README.md
```

## 🌐 API Documentation

All endpoints return JSON and support CORS for frontend integration.

### Base URL
```
http://127.0.0.1:5000
```

### Common Query Parameters

Most log endpoints support:
- `time_period` (optional): Time range (e.g., `1h`, `24h`, `7d`) - default varies by endpoint
- `limit` (optional): Maximum number of entries - default varies by endpoint

### Response Format

All endpoints return JSON with this structure:

**Success Response:**
```json
{
  "status": "success",
  "log_type": "system",
  "count": 10,
  "logs": [
    {
      "timestamp": "2025-11-01 16:45:29.904939+0200",
      "hostname": "localhost",
      "process": "kernel",
      "pid": "0",
      "level": "Unknown",
      "message": "Log message here",
      "log_type": "system",
      "raw": "Full raw log line"
    }
  ]
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description here"
}
```

---

## 📡 API Endpoints

### 1. Health Check

```http
GET /api/health
```

**Description:** Check system compatibility and API status.

**Response:**
```json
{
  "status": "ok",
  "macos_compatible": true,
  "macos_message": "macOS 14.5 is compatible (10.12+ required)",
  "unified_logging_available": true,
  "unified_logging_message": "Unified Logging System found at: /usr/bin/log"
}
```

**Example:**
```bash
curl http://127.0.0.1:5000/api/health
```

---

### 2. System Logs

```http
GET /api/logs/system
```

**Description:** Get general system logs.

**Query Parameters:**
- `time_period` (optional): Default `1h`
- `limit` (optional): No default (returns all)

**Example:**
```bash
curl "http://127.0.0.1:5000/api/logs/system?time_period=1h&limit=10"
```

---

### 3. Kernel Logs

```http
GET /api/logs/kernel
```

**Description:** Get kernel-level logs.

**Query Parameters:**
- `time_period` (optional): Default `1h`
- `limit` (optional): No default

**Example:**
```bash
curl "http://127.0.0.1:5000/api/logs/kernel?limit=5"
```

---

### 4. Authentication Logs

```http
GET /api/logs/auth
```

**Description:** Get authentication logs (loginwindow and sudo activities).

**Query Parameters:**
- `time_period` (optional): Default `1h`
- `limit` (optional): No default

**Example:**
```bash
curl "http://127.0.0.1:5000/api/logs/auth?time_period=24h&limit=10"
```

---

### 5. Hardware Logs

```http
GET /api/logs/hardware
```

**Description:** Get hardware-related logs (filtered from kernel logs).

**Query Parameters:**
- `time_period` (optional): Default `1h`
- `limit` (optional): No default

**Note:** Hardware logs are filtered from kernel logs using hardware-related keywords. May return 0 logs if there's no hardware activity.

**Example:**
```bash
curl "http://127.0.0.1:5000/api/logs/hardware?limit=5"
```

---

### 6. Power Management Logs

```http
GET /api/logs/power
```

**Description:** Get power management events.

**Query Parameters:**
- `time_period` (optional): Default `1h`
- `limit` (optional): No default

**Example:**
```bash
curl "http://127.0.0.1:5000/api/logs/power?time_period=24h&limit=10"
```

---

### 7. Scheduler Logs

```http
GET /api/logs/scheduler
```

**Description:** Get launchd (process scheduler) logs.

**Query Parameters:**
- `time_period` (optional): Default `1h`
- `limit` (optional): No default

**Example:**
```bash
curl "http://127.0.0.1:5000/api/logs/scheduler?time_period=24h&limit=10"
```

---

### 8. Boot Logs

```http
GET /api/logs/boot
```

**Description:** Get boot-related logs.

**Query Parameters:**
- `time_period` (optional): Default `1h` (limited to 1h to avoid timeouts)
- `limit` (optional): Default `50`, max `50`

**Note:** Boot logs are limited to 1h periods to avoid timeouts. Boot events may be sparse.

**Example:**
```bash
curl "http://127.0.0.1:5000/api/logs/boot?time_period=1h&limit=10"
```

---

### 9. Crash Logs

```http
GET /api/logs/crashes
```

**Description:** Get crash logs from DiagnosticReports directories.

**Query Parameters:**
- `limit` (optional): Default `20`

**Note:** Reads from `~/Library/Logs/DiagnosticReports/` and `/Library/Logs/DiagnosticReports/`. Returns 0 if no crashes found.

**Response Format (different from other endpoints):**
```json
{
  "status": "success",
  "log_type": "crashes",
  "count": 2,
  "logs": [
    {
      "file_path": "/Users/username/Library/Logs/DiagnosticReports/App_2025-11-01-123456.ips",
      "file_name": "App_2025-11-01-123456.ips",
      "format": "ips",
      "timestamp": "2025-11-01 12:34:56",
      "process": "App",
      "exception_type": "EXC_CRASH",
      "exception_message": "SIGABRT",
      "crash_location": "DiagnosticReports",
      "file_size": 12345,
      "modified_time": 1698840896.0
    }
  ]
}
```

**Example:**
```bash
curl "http://127.0.0.1:5000/api/logs/crashes?limit=10"
```

---

### 10. Package Logs

```http
GET /api/logs/packages
```

**Description:** Get Homebrew/package manager logs.

**Query Parameters:**
- `limit` (optional): Default `50`

**Note:** Reads from `/opt/homebrew/var/log/` (Apple Silicon) or `/usr/local/var/log/` (Intel). Returns 0 if Homebrew is not installed or no logs found.

**Response Format (different from other endpoints):**
```json
{
  "status": "success",
  "log_type": "packages",
  "count": 5,
  "logs": [
    {
      "timestamp": "2025-11-01 10:30:45",
      "message": "Log message from Homebrew",
      "file_name": "brew.log",
      "file_path": "/opt/homebrew/var/log/brew.log",
      "line_number": 123,
      "file_mtime": 1698840896.0,
      "log_type": "package"
    }
  ]
}
```

**Example:**
```bash
curl "http://127.0.0.1:5000/api/logs/packages?limit=20"
```

---

## 📝 Log Entry Format

### Standard Log Entry (Unified Logging System)

All log entries from Unified Logging System endpoints follow this structure:

```json
{
  "timestamp": "2025-11-01 16:45:29.904939+0200",
  "hostname": "localhost",
  "process": "kernel",
  "pid": "0",
  "level": "Unknown",
  "message": "The actual log message",
  "log_type": "system",
  "raw": "Full raw log line as returned by log command"
}
```

**Field Descriptions:**
- `timestamp`: ISO-style timestamp with timezone
- `hostname`: System hostname (usually "localhost")
- `process`: Process name that generated the log
- `pid`: Process ID
- `level`: Log level (may be "Unknown" if not parsed)
- `message`: The actual log message content
- `log_type`: Type of log (system, kernel, auth, etc.)
- `raw`: Complete raw log line

---

## 💻 Frontend Integration Guide

### CORS Support

The backend has CORS enabled, so your frontend can make requests from any origin.

### Connecting to the Backend

The backend runs on `http://127.0.0.1:5000` by default.

### Basic JavaScript Example

```javascript
// Fetch system logs
async function fetchLogs(logType = 'system', timePeriod = '1h', limit = 50) {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/logs/${logType}?time_period=${timePeriod}&limit=${limit}`
    );
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log(`Retrieved ${data.count} ${data.log_type} logs`);
      return data.logs;
    } else {
      console.error('Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Network error:', error);
    return [];
  }
}

// Usage
fetchLogs('system', '1h', 10).then(logs => {
  // Display logs in your UI
  logs.forEach(log => {
    console.log(`${log.timestamp}: ${log.message}`);
  });
});
```

### React Example

```jsx
import React, { useState, useEffect } from 'react';

function LogViewer({ logType = 'system' }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [logType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/logs/${logType}?time_period=1h&limit=50`
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        setLogs(data.logs);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{logType} Logs ({logs.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Process</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{log.timestamp}</td>
              <td>{log.process}</td>
              <td>{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LogViewer;
```

### Vue.js Example

```vue
<template>
  <div>
    <h2>{{ logType }} Logs ({{ logs.length }})</h2>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <table v-else>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Process</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log, index) in logs" :key="index">
          <td>{{ log.timestamp }}</td>
          <td>{{ log.process }}</td>
          <td>{{ log.message }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    logType: {
      type: String,
      default: 'system'
    }
  },
  data() {
    return {
      logs: [],
      loading: true,
      error: null
    };
  },
  mounted() {
    this.fetchLogs();
  },
  methods: {
    async fetchLogs() {
      this.loading = true;
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/logs/${this.logType}?time_period=1h&limit=50`
        );
        const data = await response.json();
        
        if (data.status === 'success') {
          this.logs = data.logs;
          this.error = null;
        } else {
          this.error = data.message;
        }
      } catch (err) {
        this.error = 'Failed to fetch logs';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

### Available Log Types for Frontend

Use these values for the `logType` parameter:

- `system` - General system logs
- `kernel` - Kernel logs
- `auth` - Authentication logs (loginwindow, sudo)
- `hardware` - Hardware-related logs
- `power` - Power management logs
- `scheduler` - Launchd/scheduler logs
- `boot` - Boot logs
- `crashes` - Crash logs (different response format)
- `packages` - Homebrew/package logs (different response format)

### Error Handling Best Practices

```javascript
async function fetchLogsWithErrorHandling(logType, timePeriod, limit) {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/logs/${logType}?time_period=${timePeriod}&limit=${limit}`
    );
    
    // Check HTTP status
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check API status
    if (data.status === 'success') {
      return {
        success: true,
        logs: data.logs,
        count: data.count,
        logType: data.log_type
      };
    } else {
      return {
        success: false,
        error: data.message || 'Unknown error',
        logs: []
      };
    }
  } catch (error) {
    // Handle network errors, JSON parsing errors, etc.
    return {
      success: false,
      error: error.message || 'Network error',
      logs: []
    };
  }
}
```

### Real-time Updates (Polling)

```javascript
// Poll for new logs every 30 seconds
function startLogPolling(logType, callback) {
  const interval = setInterval(async () => {
    const result = await fetchLogsWithErrorHandling(logType, '1h', 50);
    if (result.success) {
      callback(result.logs);
    }
  }, 30000); // 30 seconds
  
  // Return function to stop polling
  return () => clearInterval(interval);
}

// Usage
const stopPolling = startLogPolling('system', (logs) => {
  console.log(`Received ${logs.length} logs`);
  // Update UI with new logs
});

// Stop polling when needed
// stopPolling();
```

### Time Period Options

Valid `time_period` values:
- `5m`, `15m`, `30m` - Minutes
- `1h`, `2h`, `6h`, `12h`, `24h` - Hours
- `1d`, `7d`, `30d` - Days

**Note:** Some endpoints have limitations:
- Boot logs: Limited to 1h to avoid timeouts
- Hardware logs: May use shorter periods for long time ranges

---

## 🔧 Development

### Running in Development Mode

The server runs in debug mode by default:

```bash
python run.py
```

This enables:
- Auto-reload on code changes
- Detailed error messages
- Debug console

### Testing Endpoints

Use `curl` or any HTTP client:

```bash
# Pretty JSON output
curl -s "http://127.0.0.1:5000/api/logs/system?limit=3" | python3 -m json.tool

# Check response time
curl -w "\nTime: %{time_total}s\n" -s -o /dev/null "http://127.0.0.1:5000/api/health"
```

### Common Issues

**Issue: "Connection refused"**
- **Solution:** Make sure the server is running (`python run.py`)

**Issue: Empty logs (`count: 0`)**
- **Solution:** Normal if no events in the time period. Try `time_period=24h`

**Issue: "macOS version too old"**
- **Solution:** This tool requires macOS 10.12+. Upgrade your macOS.

**Issue: "Unified Logging System not found"**
- **Solution:** This shouldn't happen on macOS 10.12+. Check your system.

**Issue: "Log command timed out"**
- **Solution:** Some queries (especially boot logs) can be slow. Try shorter time periods or smaller limits.

---

## 📦 Dependencies

See `requirements.txt` for complete list:

- **flask** - Web framework
- **flask-cors** - CORS support for frontend
- **python-dateutil** - Date/time utilities
- **pytest** - Testing framework (optional)
- **gunicorn** - Production WSGI server (optional)

## 🧪 Testing

```bash
# Run tests (when implemented)
pytest tests/
```

## 📄 License

[Your License Here]

## 🤝 Contributing

This is a team project. Backend and frontend are developed separately.

- **Backend:** Python/Flask (this repository)
- **Frontend:** Web interface (separate repository)

## 📞 Support

For issues or questions:
1. Check system requirements (macOS 10.12+)
2. Verify virtual environment is activated
3. Check server logs for errors
4. Test with `curl` to isolate frontend vs backend issues
5. Check the `/api/health` endpoint first

---

**Built for macOS 10.12+ using the Unified Logging System** 🍎

