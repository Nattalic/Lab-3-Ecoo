import { useState } from 'react';
import { API_URL } from '../api/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

interface Props {
  onSuccess: (user: User) => void;
  onRegister: () => void;
}

export default function Login({ onSuccess, onRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('DELIVERY LOGIN RESPONSE:', data);

      if (!res.ok) {
        throw new Error(data.message || 'No se pudo iniciar sesión');
      }

      const payload = data.data ?? data;
      const userData = payload.user ?? payload;
      const sessionData = payload.session ?? null;

      if (sessionData?.access_token) {
        localStorage.setItem('access_token', sessionData.access_token);
      }

      localStorage.setItem('user', JSON.stringify(userData));

      onSuccess({
        id: userData?.id || '',
        name: userData?.name || userData?.user_metadata?.name || 'Usuario',
        email: userData?.email || email,
        role: 'delivery',
      });
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-orange-500 mb-2">Delivery App</p>
          <h1 className="text-3xl font-bold text-gray-900">Inicia sesión</h1>
          <p className="text-sm text-gray-500 mt-2">
            Accede al panel de repartidor
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo
            </label>
            <input
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
              placeholder="correo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-2xl bg-orange-500 px-5 py-3 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-gray-500 text-sm">
            ¿No tienes cuenta?{' '}
            <button
              onClick={onRegister}
              className="text-orange-500 font-semibold hover:text-orange-600 transition"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}