import { useState } from 'react';
import { ChefHat, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ADMIN_PASSWORD = 'Olga2026';
const SESSION_KEY = 'trucco_admin_session';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        onLogin();
      } else {
        setError('Contraseña incorrecta. Inténtalo de nuevo.');
        setPassword('');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card principal */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src="/logo.png" alt="Comidas Rápidas Trucco" className="h-24 w-auto object-contain drop-shadow-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Panel Administrador</h1>
            <p className="text-gray-400 text-sm">Comidas Rápidas Trucco</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-1.5 text-yellow-400" />
                Contraseña de acceso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Ingresa tu contraseña"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-500 transition"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Ingresar al Panel
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-6">
            Acceso restringido solo al administrador
          </p>
        </div>

        {/* Link volver al menú */}
        <div className="text-center mt-4">
          <a
            href="/"
            className="text-gray-500 hover:text-yellow-400 text-sm transition-colors"
          >
            ← Volver al menú principal
          </a>
        </div>
      </div>
    </div>
  );
}
