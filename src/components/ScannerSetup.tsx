import { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';
import { useScanner } from '../contexts/ScannerContext';

interface ScannerSetupProps {
  onComplete: () => void;
}

export function ScannerSetup({ onComplete }: ScannerSetupProps) {
  const { setScannerInfo } = useScanner();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setScannerInfo({
      name: name.trim(),
      email: email.trim() || undefined,
    });

    onComplete();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Configuration du scanner
          </h1>
          <p className="text-slate-300">
            Identifiez-vous pour commencer le check-in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-6 space-y-4 border border-slate-700">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Votre nom *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Marie Dupont"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Email (optionnel)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marie@exemple.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-xl py-4 px-6 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Commencer le scan</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
