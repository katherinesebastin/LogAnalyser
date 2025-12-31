import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SecurityStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

// Mock data for charts since we don't have a real time series db
const activityData = [
  { time: '00:00', system: 400, network: 240, server: 240 },
  { time: '04:00', system: 300, network: 139, server: 221 },
  { time: '08:00', system: 200, network: 980, server: 229 },
  { time: '12:00', system: 278, network: 390, server: 200 },
  { time: '16:00', system: 189, network: 480, server: 218 },
  { time: '20:00', system: 239, network: 380, server: 250 },
  { time: '23:59', system: 349, network: 430, server: 210 },
];

const StatCard = ({ title, value, subtext, color }: any) => (
  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${color}`}></div>
    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <span className="text-3xl font-bold text-slate-100">{value}</span>
    </div>
    <p className="mt-1 text-sm text-slate-500">{subtext}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<SecurityStats | null>(null);

  useEffect(() => {
    api.stats.security().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="text-slate-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">System Overview</h2>
        <p className="text-slate-400">Real-time log analysis and security monitoring.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Threat Level" 
          value={stats.threat_level} 
          subtext="Based on IDS alerts" 
          color={stats.threat_level === 'High' || stats.threat_level === 'Critical' ? 'bg-red-500' : 'bg-green-500'}
        />
        <StatCard 
          title="Firewall Blocks" 
          value={stats.firewall_blocks} 
          subtext="Last 24 hours" 
          color="bg-orange-500"
        />
        <StatCard 
          title="Failed Logins" 
          value={stats.failed_logins} 
          subtext="Authentication failures" 
          color="bg-yellow-500"
        />
        <StatCard 
          title="Active Alerts" 
          value={stats.ids_alerts} 
          subtext="Requires attention" 
          color="bg-blue-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4">Log Volume Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="network" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="system" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4">Event Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.2}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="server" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
