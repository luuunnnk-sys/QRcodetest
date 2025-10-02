import { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';

export function EventSetup() {
  const { createEvent } = useEvent();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await createEvent(name.trim(), description.trim() || undefined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Check-in Manager
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Créez un événement pour commencer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Nom de l'événement *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Conférence Tech 2025"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Description (optionnel)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Quelques mots sur votre événement..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-red-800 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-xl py-4 px-6 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Création...' : 'Créer l\'événement'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-500">
          Un événement vous permet de gérer les participants et le check-in
        </p>
      </div>
    </div>
  );
}
