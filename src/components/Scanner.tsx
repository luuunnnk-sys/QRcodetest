import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { CheckCircle2, XCircle, AlertCircle, Camera } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { useScanner } from '../contexts/ScannerContext';
import { verifyQRCode, ParticipantData } from '../lib/qrcode';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

type ScanStatus = 'idle' | 'success' | 'duplicate' | 'invalid';

interface ScanResult {
  status: ScanStatus;
  participant?: ParticipantData;
  message?: string;
}

export function Scanner() {
  const { currentEvent } = useEvent();
  const { scannerInfo } = useScanner();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  function startScanning() {
    setScanning(true);
    setResult(null);
    setCameraError(null);

    scanIntervalRef.current = setInterval(() => {
      captureAndScan();
    }, 300);
  }

  function stopScanning() {
    setScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }

  async function captureAndScan() {
    if (!webcamRef.current || !currentEvent) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        stopScanning();
        await handleQRCodeDetected(code.data);
      }
    };
  }

  async function handleQRCodeDetected(qrData: string) {
    if (!currentEvent || !scannerInfo) {
      setResult({
        status: 'invalid',
        message: 'Configuration manquante',
      });
      return;
    }

    const participant = await verifyQRCode(qrData, currentEvent.secret_key);

    if (!participant) {
      setResult({
        status: 'invalid',
        message: 'QR code invalide ou falsifié',
      });
      setTimeout(() => setResult(null), 3000);
      return;
    }

    const stored = localStorage.getItem(`participants_${currentEvent.id}`);
    const participants = stored ? JSON.parse(stored) : [];
    const existingParticipant = participants.find((p: any) => p.qr_code_data === qrData);

    if (!existingParticipant) {
      setResult({
        status: 'invalid',
        message: 'Participant non trouvé',
      });
      setTimeout(() => setResult(null), 3000);
      return;
    }

    const checkInsStored = localStorage.getItem(`check_ins_${currentEvent.id}`);
    const checkIns = checkInsStored ? JSON.parse(checkInsStored) : [];
    const isDuplicate = checkIns.some((ci: any) => ci.participant_id === existingParticipant.id);

    const checkIn = {
      id: crypto.randomUUID(),
      participant_id: existingParticipant.id,
      scanner_name: scannerInfo.name,
      scanner_email: scannerInfo.email,
      checked_in_at: new Date().toISOString(),
      is_duplicate: isDuplicate,
    };

    try {
      checkIns.push(checkIn);
      localStorage.setItem(`check_ins_${currentEvent.id}`, JSON.stringify(checkIns));
    } catch (error) {
      setResult({
        status: 'invalid',
        message: 'Erreur lors de l\'enregistrement',
      });
      setTimeout(() => setResult(null), 3000);
      return;
    }

    setResult({
      status: isDuplicate ? 'duplicate' : 'success',
      participant,
      message: isDuplicate ? 'Déjà scanné' : 'Bienvenue !',
    });

    setTimeout(() => setResult(null), 3000);
  }

  function handleCameraError() {
    setCameraError('Impossible d\'accéder à la caméra');
    stopScanning();
  }

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-white">Aucun événement sélectionné</p>
      </div>
    );
  }

  if (!scannerInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-white">Veuillez configurer vos informations</p>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (result?.status) {
      case 'success':
        return 'from-green-500 to-emerald-500';
      case 'duplicate':
        return 'from-orange-500 to-amber-500';
      case 'invalid':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-slate-800 to-slate-900';
    }
  };

  const getStatusIcon = () => {
    switch (result?.status) {
      case 'success':
        return <CheckCircle2 className="w-20 h-20 text-white" />;
      case 'duplicate':
        return <AlertCircle className="w-20 h-20 text-white" />;
      case 'invalid':
        return <XCircle className="w-20 h-20 text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden">
      <div className="absolute inset-0">
        {scanning && (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: 'environment',
              width: 1920,
              height: 1080,
            }}
            onUserMediaError={handleCameraError}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-gradient-to-br ${getStatusColor()} flex items-center justify-center z-20`}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="text-center space-y-6 p-8"
            >
              {getStatusIcon()}
              <h2 className="text-4xl font-bold text-white">
                {result.message}
              </h2>
              {result.participant && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-2">
                  <p className="text-2xl font-semibold text-white">
                    {result.participant.firstName} {result.participant.lastName}
                  </p>
                  {result.participant.company && (
                    <p className="text-xl text-white/80">
                      {result.participant.company}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!scanning && !result && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={startScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-8 shadow-2xl transition-all duration-200 hover:shadow-blue-500/50 active:scale-95"
          >
            <Camera className="w-16 h-16" />
          </button>
        </div>
      )}

      {scanning && !result && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-4 border-white rounded-3xl shadow-2xl">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl animate-pulse" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-3xl animate-pulse" />
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white text-lg font-semibold bg-black/50 backdrop-blur-sm inline-block px-6 py-3 rounded-full">
              Positionnez le QR code dans le cadre
            </p>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
          <div className="text-center space-y-4 p-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <p className="text-white text-xl">{cameraError}</p>
            <button
              onClick={() => {
                setCameraError(null);
                startScanning();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {scanning && (
        <button
          onClick={stopScanning}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold shadow-2xl z-30"
        >
          Arrêter le scan
        </button>
      )}
    </div>
  );
}
