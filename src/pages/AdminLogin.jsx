import { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, ChefHat, LogIn, ShieldCheck } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';

export function useAdminAuth() {
  const { authenticate, getCurrentUser } = useUsers();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('trucco_admin_session') === 'true';
  });

  const login = (username, password) => {
    const res = authenticate(username, password);
    if (res.success) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('trucco_admin_session');
    sessionStorage.removeItem('trucco_current_user');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout, currentUser: getCurrentUser() };
}

export default function AdminLogin({ onLogin }) {
  const { authenticate, loading: loadingUsers } = useUsers();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const result = authenticate(username, password);
      if (result.success) {
        if (onLogin) onLogin(result.user);
      } else {
        setError(result.message || 'Usuario o contraseña incorrectos.');
      }
      setLoading(false);
    }, 400);
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
        <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-3">
              <img src="/logo.png" alt="Comidas Rápidas Trucco" className="h-20 w-auto object-contain drop-shadow-2xl" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Acceso Administrativo</h1>
            <p className="text-gray-400 text-xs mt-1">Ingresa con tu usuario y contraseña asignados</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Usuario */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                <User className="w-3.5 h-3.5 inline mr-1 text-yellow-400" />
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Ej. admin u olga"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-500 text-sm transition"
                required
                autoFocus
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                <Lock className="w-3.5 h-3.5 inline mr-1 text-yellow-400" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-500 text-sm transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full mt-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" /> Acceso Seguro
            </span>
            <span>Comidas Rápidas Trucco</span>
          </div>
        </div>

        {/* Link volver al menú */}
        <div className="text-center mt-4">
          <a
            href="/"
            className="text-gray-500 hover:text-yellow-400 text-sm transition-colors font-medium"
          >
            ← Volver al menú principal
          </a>
        </div>
      </div>
    </div>
  );
}
