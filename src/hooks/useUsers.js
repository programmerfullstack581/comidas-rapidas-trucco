// ═══════════════════════════════════════════════════════════════
// Hook de Gestión de Usuarios y Autenticación con Google Sheets
// Pestaña 'usuarios' sincronizada en tiempo real.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { SHEET_ID, APPS_SCRIPT_URL, parseCSVLine } from './useSheetProducts';

export const SHEET_USERS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=usuarios`;

export const DEFAULT_USERS = [
  { id: 1, usuario: 'admin', password: 'Olga2026', nombre: 'Administrador Principal', rol: 'admin' },
  { id: 2, usuario: 'olga', password: 'Olga2026', nombre: 'Olga', rol: 'admin' }
];

const CACHE_USERS_KEY = 'trucco_users_cache';
const CACHE_USERS_TIME_KEY = 'trucco_users_cache_time';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const SESSION_KEY = 'trucco_admin_session';
const CURRENT_USER_KEY = 'trucco_current_user';

/**
 * Parsea el CSV de la pestaña 'usuarios' de Google Sheets
 */
function parseUsersCSV(csvText) {
  if (!csvText) return null;
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return null;

  const headerCols = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/["']/g, ''));
  // Verificar si la cabecera corresponde a la pestaña de usuarios
  if (!headerCols.includes('usuario') && !headerCols.includes('password')) {
    return null; // Probablemente Google Sheets devolvió la primera pestaña porque 'usuarios' no existe
  }

  const uIndex = headerCols.indexOf('usuario') !== -1 ? headerCols.indexOf('usuario') : 1;
  const pIndex = headerCols.indexOf('password') !== -1 ? headerCols.indexOf('password') : 2;
  const nIndex = headerCols.indexOf('nombre') !== -1 ? headerCols.indexOf('nombre') : 3;
  const rIndex = headerCols.indexOf('rol') !== -1 ? headerCols.indexOf('rol') : 4;

  const users = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const id = cols[0] || String(i);
    const usuario = (cols[uIndex] || '').replace(/["']/g, '').trim();
    const password = (cols[pIndex] || '').replace(/["']/g, '').trim();
    const nombre = (cols[nIndex] || usuario).replace(/["']/g, '').trim();
    const rol = (cols[rIndex] || 'admin').replace(/["']/g, '').trim();

    if (usuario && password) {
      users.push({ id: Number(id) || i, usuario, password, nombre, rol });
    }
  }

  return users.length > 0 ? users : null;
}

export function useUsers() {
  const [users, setUsers] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_USERS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_USERS;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar usuarios desde la nube (Google Apps Script o CSV directo)
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Intentar primero con Apps Script doGet
      try {
        const apiResp = await fetch(`${APPS_SCRIPT_URL}?action=getUsers&t=${Date.now()}`);
        if (apiResp.ok) {
          const apiData = await apiResp.json();
          if (apiData && Array.isArray(apiData.users) && apiData.users.length > 0) {
            setUsers(apiData.users);
            localStorage.setItem(CACHE_USERS_KEY, JSON.stringify(apiData.users));
            localStorage.setItem(CACHE_USERS_TIME_KEY, String(Date.now()));
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback al CSV de Google Sheets
      }

      // 2. Intentar con exportación directa CSV de Google Sheets
      const csvResp = await fetch(`${SHEET_USERS_URL}&t=${Date.now()}`);
      if (csvResp.ok) {
        const csvText = await csvResp.text();
        const parsed = parseUsersCSV(csvText);
        if (parsed && parsed.length > 0) {
          setUsers(parsed);
          localStorage.setItem(CACHE_USERS_KEY, JSON.stringify(parsed));
          localStorage.setItem(CACHE_USERS_TIME_KEY, String(Date.now()));
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("No se pudieron cargar usuarios de Google Sheets, usando locales:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedTime = localStorage.getItem(CACHE_USERS_TIME_KEY);
    const expired = !cachedTime || Date.now() - Number(cachedTime) > CACHE_TTL;
    if (expired) {
      fetchUsers();
    }
  }, []);

  // Guardar usuarios en Google Sheets (pestaña 'usuarios')
  const syncUsersToSheet = async (newUsers) => {
    setLoading(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveUsers',
          users: newUsers
        })
      });

      setUsers(newUsers);
      localStorage.setItem(CACHE_USERS_KEY, JSON.stringify(newUsers));
      localStorage.setItem(CACHE_USERS_TIME_KEY, String(Date.now()));
    } catch (err) {
      console.error("Error guardando usuarios en Google Sheets:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addUser = async ({ usuario, password, nombre, rol = 'admin' }) => {
    const cleanUser = usuario.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanName = nombre.trim() || cleanUser;

    if (!cleanUser || !cleanPass) {
      throw new Error("Usuario y contraseña son requeridos.");
    }

    if (users.some(u => u.usuario.toLowerCase() === cleanUser)) {
      throw new Error(`El usuario "${cleanUser}" ya existe.`);
    }

    const newId = Math.max(...users.map(u => u.id || 0), 0) + 1;
    const newUser = { id: newId, usuario: cleanUser, password: cleanPass, nombre: cleanName, rol };
    const updated = [...users, newUser];

    await syncUsersToSheet(updated);
    return newUser;
  };

  const updateUser = async (id, data) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return {
          ...u,
          usuario: data.usuario ? data.usuario.trim().toLowerCase() : u.usuario,
          password: data.password ? data.password.trim() : u.password,
          nombre: data.nombre ? data.nombre.trim() : u.nombre,
          rol: data.rol || u.rol
        };
      }
      return u;
    });

    await syncUsersToSheet(updated);
  };

  const deleteUser = async (id) => {
    if (users.length <= 1) {
      throw new Error("No puedes eliminar el único usuario administrador.");
    }
    const updated = users.filter(u => u.id !== id);
    await syncUsersToSheet(updated);
  };

  const changePassword = async (usuario, newPassword) => {
    const cleanUser = usuario.trim().toLowerCase();
    const cleanPass = newPassword.trim();
    if (!cleanPass) throw new Error("La nueva contraseña no puede estar vacía.");

    const updated = users.map(u => {
      if (u.usuario.toLowerCase() === cleanUser) {
        return { ...u, password: cleanPass };
      }
      return u;
    });

    await syncUsersToSheet(updated);
  };

  // Función de autenticación (Login)
  const authenticate = (inputUser, inputPassword) => {
    const cleanUser = (inputUser || '').trim().toLowerCase();
    const cleanPass = (inputPassword || '').trim();

    // 1. Buscar en los usuarios cargados
    const found = users.find(
      u => u.usuario.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (found) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        usuario: found.usuario,
        nombre: found.nombre,
        rol: found.rol
      }));
      return { success: true, user: found };
    }

    // 2. Fallback de emergencia por si la hoja aún no cargó
    const defaultFound = DEFAULT_USERS.find(
      u => u.usuario.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (defaultFound) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        usuario: defaultFound.usuario,
        nombre: defaultFound.nombre,
        rol: defaultFound.rol
      }));
      return { success: true, user: defaultFound };
    }

    return { success: false, message: 'Usuario o contraseña incorrectos.' };
  };

  const getCurrentUser = () => {
    try {
      const stored = sessionStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : { usuario: 'admin', nombre: 'Administrador' };
    } catch (e) {
      return { usuario: 'admin', nombre: 'Administrador' };
    }
  };

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    changePassword,
    authenticate,
    getCurrentUser,
    refreshUsers: fetchUsers,
  };
}
