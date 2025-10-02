import { useState, useEffect } from 'react';
import { Search, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { supabase } from '../lib/supabase';

interface CheckIn {
  id: string;
  checked_in_at: string;
  scanner_name: string;
  scanner_email: string | null;
  is_duplicate: boolean;
  participant: {
    first_name: string;
    last_name: string;
    company: string;
  };
}

export function History() {
  const { currentEvent } = useEvent();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [filteredCheckIns, setFilteredCheckIns] = useState<CheckIn[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    duplicates: 0,
  });

  useEffect(() => {
    if (currentEvent) {
      loadCheckIns();
      const interval = setInterval(loadCheckIns, 2000);
      return () => clearInterval(interval);
    }
  }, [currentEvent]);

  useEffect(() => {
    filterCheckIns();
  }, [checkIns, searchQuery]);

  async function loadCheckIns() {
    if (!currentEvent) return;

    setLoading(true);
    try {
      const checkInsStored = localStorage.getItem(`check_ins_${currentEvent.id}`);
      const checkInsData = checkInsStored ? JSON.parse(checkInsStored) : [];

      const participantsStored = localStorage.getItem(`participants_${currentEvent.id}`);
      const participants = participantsStored ? JSON.parse(participantsStored) : [];

      const formattedData = checkInsData.map((checkIn: any) => {
        const participant = participants.find((p: any) => p.id === checkIn.participant_id);
        return {
          id: checkIn.id,
          checked_in_at: checkIn.checked_in_at,
          scanner_name: checkIn.scanner_name,
          scanner_email: checkIn.scanner_email || null,
          is_duplicate: checkIn.is_duplicate,
          participant: {
            first_name: participant?.first_name || 'Inconnu',
            last_name: participant?.last_name || '',
            company: participant?.company || '',
          },
        };
      }).sort((a: any, b: any) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime());

      setCheckIns(formattedData);

      const total = formattedData.length;
      const duplicates = formattedData.filter((c) => c.is_duplicate).length;
      const valid = total - duplicates;

      setStats({ total, valid, duplicates });
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterCheckIns() {
    if (!searchQuery.trim()) {
      setFilteredCheckIns(checkIns);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = checkIns.filter((c) => {
      const fullName =
        `${c.participant.first_name} ${c.participant.last_name}`.toLowerCase();
      const company = c.participant.company.toLowerCase();
      return fullName.includes(query) || company.includes(query);
    });

    setFilteredCheckIns(filtered);
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    });
  }

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <p className="text-slate-600 dark:text-slate-400">
          Aucun événement sélectionné
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white text-center">
          Historique des entrées
        </h1>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.total}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Valides
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.valid}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Doublons
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.duplicates}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCheckIns.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery
                ? 'Aucun résultat trouvé'
                : 'Aucune entrée enregistrée'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCheckIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md transition-all duration-200 hover:shadow-lg border-l-4 ${
                  checkIn.is_duplicate
                    ? 'border-orange-500'
                    : 'border-green-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {checkIn.participant.first_name}{' '}
                      {checkIn.participant.last_name}
                    </h3>
                    {checkIn.participant.company && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {checkIn.participant.company}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatTime(checkIn.checked_in_at)} •{' '}
                          {formatDate(checkIn.checked_in_at)}
                        </span>
                      </span>
                      <span>Scanné par {checkIn.scanner_name}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {checkIn.is_duplicate ? (
                      <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-semibold">
                        Doublon
                      </div>
                    ) : (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                        Valide
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
