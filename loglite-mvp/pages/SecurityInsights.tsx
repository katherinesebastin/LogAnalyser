import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SecurityStats } from '../types';

export const SecurityInsights: React.FC = () => {
  const [stats, setStats] = useState<SecurityStats | null>(null);

  useEffect(() => {
    api.stats.security().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="border-l-4 border-blue-500 pl-4">
        <h2 className="text-3xl font-bold text-white">Security Insights</h2>
        <p className="text-slate-400">Anomaly detection and threat analysis report.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Threat Level */}
        <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-400 uppercase tracking-widest text-sm mb-4">Current Threat Level</h3>
            <div className={`text-6xl font-black mb-2 ${
                stats.threat_level === 'Critical' ? 'text-red-600' :
                stats.threat_level === 'High' ? 'text-orange-500' :
                stats.threat_level === 'Medium' ? 'text-yellow-400' : 'text-green-500'
            }`}>
                {stats.threat_level}
            </div>
            <p className="text-slate-500 text-sm">Based on aggregated heuristic analysis of IDS and Firewall logs.</p>
        </div>

        {/* Suspicious IPs */}
        <div className="bg-slate-950 p-8 rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Flagged IP Addresses
            </h3>
            <div className="space-y-3">
                {stats.suspicious_ips.map(ip => (
                    <div key={ip} className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800">
                        <span className="font-mono text-blue-400">{ip}</span>
                        <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">High Confidence</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Educational Note: Anomaly Detection</h3>
        <p className="text-slate-400 leading-relaxed">
            LogLite uses a simplified signature-based detection method. In a production environment, 
            Anomaly Detection often involves Machine Learning models (like Isolation Forests) to detect 
            deviations from baseline traffic patterns. For example, a sudden spike in outbound traffic (data exfiltration) 
            or repeated login failures from a single IP (brute force) would trigger the alerts seen above.
        </p>
      </div>
    </div>
  );
};
