import React, { useEffect, useState } from 'react';
import { LogTable } from '../components/LogTable';
import { Modal } from '../components/Modal';

interface GenericLogPageProps {
  title: string;
  description: string;
  fetchData: (subType: string) => Promise<any>;
  tabs: string[];
  columns: any[];
  educationalContent?: Record<string, { title: string; body: string }>;
}

export const GenericLogPage: React.FC<GenericLogPageProps> = ({ 
  title, 
  description, 
  fetchData, 
  tabs, 
  columns,
  educationalContent 
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  // Handle Tab Click
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle Info Icon Click
  const handleInfoClick = (e: React.MouseEvent, content: { title: string; body: string }) => {
    e.stopPropagation(); // Prevent tab switching when clicking the info icon
    setModalContent(content);
    setShowModal(true);
  };

  useEffect(() => {
    setLoading(true);
    // Convert friendly tab name to API param (e.g., "Web Server" -> "webserver")
    const apiParam = activeTab.toLowerCase().replace(/\s+/g, '');
    
    fetchData(apiParam)
      .then(res => {
        setLogs(res.logs);
        setError('');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeTab, fetchData]);

  return (
    <div className="space-y-6">
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={modalContent.title}
      >
        {modalContent.body}
      </Modal>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="text-slate-400">{description}</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded text-sm transition-colors border border-slate-700">
          Export JSON
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const hasInfo = educationalContent && educationalContent[tab];
            const isActive = activeTab === tab;
            
            return (
              <div
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`${
                  isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 group cursor-pointer`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleTabClick(tab);
                }}
              >
                <span>{tab}</span>
                {hasInfo && (
                  <button 
                    onClick={(e) => handleInfoClick(e, educationalContent[tab])}
                    className={`transition-colors duration-200 p-1 rounded-full hover:bg-slate-800 focus:outline-none focus:bg-slate-800 ${
                      isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-blue-400'
                    }`} 
                    title="Learn more about this log type"
                    aria-label={`Learn more about ${tab}`}
                  >
                    {/* Question Mark Circle SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {error && <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded">{error}</div>}
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <LogTable data={logs} columns={columns} />
      )}
    </div>
  );
};