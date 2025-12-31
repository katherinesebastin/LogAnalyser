import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { GenericLogPage } from './pages/GenericLogPage';
import { SecurityInsights } from './pages/SecurityInsights';
import { ProjectInfo } from './pages/ProjectInfo';
import { api } from './services/api';

const MacOSLogs = () => (
  <GenericLogPage 
    title="macOS Unified Logs"
    description="System, Kernel, and Auth logs. Click the ❓ icon on tabs for educational details."
    fetchData={api.logs.system}
    tabs={[
      'System', 'Kernel', 'Authentication', 'Hardware', 
      'Power Management', 'Process Scheduler', 'Boot', 'Crash', 'Package Manager'
    ]}
    educationalContent={{
      'System': {
        title: 'What are System Logs?',
        body: 'System logs in macOS are managed by the Unified Logging System (ULS). They act as the primary record of operating system activity, capturing events from background services (daemons), the launchd init system, and general application behaviors. Administrators rely on these logs to diagnose boot failures, service crashes, and configuration errors.'
      }
    }}
    columns={[
      { header: 'Timestamp', accessor: (row: any) => new Date(row.timestamp).toLocaleString() },
      { header: 'Process', accessor: 'process' },
      { header: 'PID', accessor: 'pid', className: 'font-mono text-xs' },
      { header: 'Level', accessor: 'level' },
      { header: 'Message', accessor: 'message', className: 'max-w-md truncate' },
    ]}
  />
);

const NetworkLogs = () => (
  <GenericLogPage 
    title="Network & Communication"
    description="Traffic analysis including Firewall, DNS, and IDS alerts."
    fetchData={api.logs.network}
    tabs={[
      'Firewall', 'DNS Query', 'DHCP Lease', 'VPN Connection', 
      'Proxy Access', 'IDS Alert'
    ]}
    columns={[
      { header: 'Timestamp', accessor: (row: any) => new Date(row.timestamp).toLocaleTimeString() },
      { header: 'Source', accessor: 'source_ip', className: 'font-mono text-blue-400' },
      { header: 'Destination', accessor: 'dest_ip', className: 'font-mono' },
      { header: 'Proto', accessor: 'protocol' },
      { header: 'Info', accessor: (row: any) => row.domain || row.action || row.alert_type || row.info || '-' },
    ]}
  />
);

const ServerLogs = () => (
  <GenericLogPage 
    title="Server Logs"
    description="Web server access, database queries, and application errors."
    fetchData={api.logs.server}
    tabs={[
      'Web Server', 'Application Server', 'Database', 'Mail Server', 'FTP Server'
    ]}
    columns={[
      { header: 'Timestamp', accessor: (row: any) => new Date(row.timestamp).toLocaleString() },
      { header: 'Method/Type', accessor: (row: any) => row.method || row.query_type || row.command || 'INFO' },
      { header: 'Status/Level', accessor: (row: any) => row.status_code || row.level || row.status || '-' },
      { header: 'Details', accessor: (row: any) => row.path || row.query_duration || row.table_name || row.file || row.recipient || '-' },
    ]}
  />
);

const Settings = () => (
    <div className="p-8 text-center text-slate-500">
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p>Configuration options would appear here.</p>
    </div>
);

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/macos" element={<MacOSLogs />} />
          <Route path="/network" element={<NetworkLogs />} />
          <Route path="/server" element={<ServerLogs />} />
          <Route path="/security" element={<SecurityInsights />} />
          <Route path="/project" element={<ProjectInfo />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;