import { createContext, useContext, useState, ReactNode } from 'react';

interface ScannerInfo {
  name: string;
  email?: string;
}

interface ScannerContextType {
  scannerInfo: ScannerInfo | null;
  setScannerInfo: (info: ScannerInfo | null) => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export function ScannerProvider({ children }: { children: ReactNode }) {
  const [scannerInfo, setScannerInfo] = useState<ScannerInfo | null>(() => {
    const saved = localStorage.getItem('scannerInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSetScannerInfo = (info: ScannerInfo | null) => {
    setScannerInfo(info);
    if (info) {
      localStorage.setItem('scannerInfo', JSON.stringify(info));
    } else {
      localStorage.removeItem('scannerInfo');
    }
  };

  return (
    <ScannerContext.Provider
      value={{ scannerInfo, setScannerInfo: handleSetScannerInfo }}
    >
      {children}
    </ScannerContext.Provider>
  );
}

export function useScanner() {
  const context = useContext(ScannerContext);
  if (context === undefined) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
}
