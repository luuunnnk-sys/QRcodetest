import { useState } from 'react';
import { EventProvider, useEvent } from './contexts/EventContext';
import { ScannerProvider, useScanner } from './contexts/ScannerContext';
import { EventSetup } from './components/EventSetup';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';
import { ScannerSetup } from './components/ScannerSetup';
import { History } from './components/History';
import { BottomNav } from './components/BottomNav';

function AppContent() {
  const { currentEvent, loading: eventLoading } = useEvent();
  const { scannerInfo } = useScanner();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'scanner' | 'history'
  >('dashboard');
  const [showScannerSetup, setShowScannerSetup] = useState(false);

  function handleTabChange(tab: 'dashboard' | 'scanner' | 'history') {
    if (tab === 'scanner' && !scannerInfo) {
      setShowScannerSetup(true);
    } else {
      setActiveTab(tab);
      setShowScannerSetup(false);
    }
  }

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return <EventSetup />;
  }

  if (showScannerSetup) {
    return (
      <ScannerSetup
        onComplete={() => {
          setShowScannerSetup(false);
          setActiveTab('scanner');
        }}
      />
    );
  }

  return (
    <>
      <div className="pb-20">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'scanner' && <Scanner />}
        {activeTab === 'history' && <History />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
}

export default function App() {
  return (
    <EventProvider>
      <ScannerProvider>
        <AppContent />
      </ScannerProvider>
    </EventProvider>
  );
}
