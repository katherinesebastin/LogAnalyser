import React from 'react';

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="mb-10">
    <h3 className="text-xl font-bold text-blue-400 mb-4 border-b border-slate-800 pb-2">{title}</h3>
    <div className="text-slate-300 leading-relaxed">
      {children}
    </div>
  </div>
);

const Card = ({ title, children, className = "" }: { title: string; children?: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-950 p-6 rounded-lg border border-slate-800 ${className}`}>
    <h4 className="font-semibold text-white mb-2">{title}</h4>
    <div className="text-sm text-slate-400">
      {children}
    </div>
  </div>
);

export const ProjectInfo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">LogLite Project Report</h2>
        <p className="text-slate-400">IT Engineering Final Project Documentation</p>
      </div>

      <Section title="1. Introduction">
        <p className="mb-6">
          LogLite is a comprehensive log analysis dashboard designed to aggregate disparate log sources into a single "pane of glass". 
          The project aims to simplify security monitoring for students and junior administrators by providing visualized insights 
          alongside raw data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Project Goal">
            To create an educational SIEM (Security Information and Event Management) tool that parses macOS, Network, and Server logs into a unified format.
          </Card>
          <Card title="Target Audience">
            Junior System Administrators, Network Security Students, and Homelab enthusiasts who need simple, readable security monitoring.
          </Card>
        </div>
      </Section>

      <Section title="2. Technology Stack">
        <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Frontend (Client-Side)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Core Framework">
                <span className="text-blue-400 font-mono">React 19</span><br/>
                Component-based UI library selected for its virtual DOM performance and modularity.
            </Card>
            <Card title="Language">
                <span className="text-blue-300 font-mono">TypeScript</span><br/>
                Ensures type safety and strict interface definitions for log data structures.
            </Card>
            <Card title="Styling">
                <span className="text-cyan-400 font-mono">Tailwind CSS</span><br/>
                Utility-first framework enabling rapid dark-mode implementation and responsive grid layouts.
            </Card>
            <Card title="Visualization">
                <span className="text-green-400 font-mono">Recharts</span><br/>
                Declarative charting library used to render real-time analytics and event distributions.
            </Card>
            </div>
        </div>

        <div className="mb-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Backend (Server-Side)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Core Runtime">
                <span className="text-yellow-400 font-mono">Python 3.8</span><br/>
                Chosen for its extensive standard library and ease of log string manipulation.
            </Card>
            <Card title="API Framework">
                <span className="text-white font-mono">Flask + CORS</span><br/>
                Lightweight WSGI web application framework to serve RESTful JSON endpoints.
            </Card>
            <Card title="Data Processing">
                <span className="text-purple-400 font-mono">python-dateutil</span><br/>
                Robust datetime parsing utility to standardize inconsistent log timestamps.
            </Card>
            </div>
        </div>
        
        <p className="text-sm italic text-slate-500 mt-6 border-t border-slate-800 pt-4">
          * Architectural Note: The application is designed as a decoupled client-server architecture. While the live demo currently uses a TypeScript Mock Service for portability, the production design relies on the Python/Flask stack described above.
        </p>
      </Section>

      <Section title="3. Implementation Process">
        <ul className="space-y-4">
          <li className="flex gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold">1</span>
            <div>
              <strong className="text-white">Requirement Analysis</strong>
              <p className="text-sm text-slate-400">Defined log structures (System, Network, Server) and required TypeScript interfaces.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold">2</span>
            <div>
              <strong className="text-white">Component Architecture</strong>
              <p className="text-sm text-slate-400">Built reusable components like <code>LogTable</code> to handle dynamic data columns.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold">3</span>
            <div>
              <strong className="text-white">Service Layer</strong>
              <p className="text-sm text-slate-400">Implemented a mock API layer to simulate network latency and realistic log generation.</p>
            </div>
          </li>
        </ul>
      </Section>

      <Section title="4. Problems & Solutions">
        <div className="space-y-4">
          <div className="bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r">
            <h5 className="font-bold text-red-400">Problem: Data Consistency in Demos</h5>
            <p className="text-sm text-slate-300 mt-1">
              Relying on purely random data meant "Critical" security alerts didn't always appear during presentations.
            </p>
            <p className="text-sm text-green-400 mt-2 font-medium">
              Solution: Implemented weighted random generation in the Mock Service to guarantee specific threat scenarios appear.
            </p>
          </div>
          <div className="bg-orange-900/10 border-l-4 border-orange-500 p-4 rounded-r">
            <h5 className="font-bold text-orange-400">Problem: Large Dataset Performance</h5>
            <p className="text-sm text-slate-300 mt-1">
              Rendering thousands of log lines caused DOM lag.
            </p>
            <p className="text-sm text-green-400 mt-2 font-medium">
              Solution: Implemented client-side pagination limits (default 50 rows) to ensure 60fps scrolling.
            </p>
          </div>
        </div>
      </Section>

      <Section title="5. Assessment & Future Roadmap">
        <p className="mb-4">
          The project successfully demonstrates the ability to parse and visualize complex data streams. 
          The modular code structure allows for easy addition of new log types (e.g., IoT devices).
        </p>
        <div className="bg-slate-800 p-4 rounded-lg">
          <h4 className="font-bold text-white mb-2">Next Steps</h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
            <li>Replace Mock Service with real Python/Flask backend.</li>
            <li>Implement WebSockets for true real-time log streaming.</li>
            <li>Add CSV/JSON export functionality for external analysis.</li>
          </ul>
        </div>
      </Section>
    </div>
  );
};