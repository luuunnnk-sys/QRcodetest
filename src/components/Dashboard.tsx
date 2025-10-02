import { useState, useRef, useEffect } from 'react';
import { Upload, Users, QrCode, Download, Trash2 } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { supabase, Participant as SupabaseParticipant } from '../lib/supabase';
import { parseFile } from '../lib/csv-parser';
import { generateSignedQRCode, generateDeterministicId } from '../lib/qrcode';
import { generateBadgePDF } from '../lib/badge-generator';

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  qr_code_data: string;
}

export function Dashboard() {
  const { currentEvent } = useEvent();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentEvent) {
      loadParticipants();
    }
  }, [currentEvent]);

  async function loadParticipants() {
    if (!currentEvent) return;

    try {
      const stored = localStorage.getItem(`participants_${currentEvent.id}`);
      if (stored) {
        setParticipants(JSON.parse(stored));
      } else {
        setParticipants([]);
      }
    } catch (err: any) {
      console.error('Error loading participants:', err);
      setError(err.message);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentEvent) return;

    setLoading(true);
    setError(null);

    try {
      const importedData = await parseFile(file);

      const stored = localStorage.getItem(`participants_${currentEvent.id}`);
      const existingParticipants = stored ? JSON.parse(stored) : [];

      const existingEmails = new Set((existingParticipants || []).map((p: Participant) => p.email.toLowerCase()));

      const participantsToInsert = await Promise.all(
        importedData
          .filter(p => !existingEmails.has(p.email.toLowerCase()))
          .map(async (p) => {
            const id = await generateDeterministicId(
              p.firstName,
              p.lastName,
              p.email,
              currentEvent.secret_key
            );

            const qrData = await generateSignedQRCode(
              {
                id,
                firstName: p.firstName,
                lastName: p.lastName,
                company: p.company,
                email: p.email,
              },
              currentEvent.secret_key
            );

            return {
              id,
              event_id: currentEvent.id,
              first_name: p.firstName,
              last_name: p.lastName,
              company: p.company,
              email: p.email,
              qr_code_data: qrData,
              created_at: new Date().toISOString(),
            };
          })
      );

      if (participantsToInsert.length > 0) {
        const updatedParticipants = [...existingParticipants, ...participantsToInsert];
        localStorage.setItem(`participants_${currentEvent.id}`, JSON.stringify(updatedParticipants));
      }

      const skippedCount = importedData.length - participantsToInsert.length;
      if (skippedCount > 0) {
        alert(`${participantsToInsert.length} participant(s) ajouté(s). ${skippedCount} doublon(s) ignoré(s).`);
      }

      await loadParticipants();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleGenerateBadges() {
    if (!currentEvent || participants.length === 0) return;

    setLoading(true);
    try {
      const badgeData = participants.map((p) => ({
        firstName: p.first_name,
        lastName: p.last_name,
        company: p.company,
        qrCodeData: p.qr_code_data,
        eventName: currentEvent.name,
      }));

      const pdfBlob = await generateBadgePDF(badgeData, currentEvent.name);

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badges-${currentEvent.name.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (!currentEvent || participants.length === 0) return;
    if (!confirm('Supprimer tous les participants ?')) return;

    setLoading(true);
    try {
      localStorage.removeItem(`participants_${currentEvent.id}`);
      await loadParticipants();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Chargement...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {currentEvent.name}
          </h1>
          {currentEvent.description && (
            <p className="text-slate-600 dark:text-slate-400">
              {currentEvent.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Participants
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {participants.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <QrCode className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  QR Codes
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {participants.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-4 px-6 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center space-x-3"
          >
            <Upload className="w-6 h-6" />
            <span>Importer CSV / Excel</span>
          </button>

          {participants.length > 0 && (
            <>
              <button
                onClick={handleGenerateBadges}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl py-4 px-6 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center space-x-3"
              >
                <Download className="w-6 h-6" />
                <span>Télécharger badges PDF</span>
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl py-4 px-6 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center space-x-3"
              >
                <Trash2 className="w-6 h-6" />
                <span>Supprimer tous les participants</span>
              </button>
            </>
          )}
        </div>

        {participants.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Liste des participants
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Prénom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      Entreprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {p.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {p.first_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {p.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {p.company || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
