import { useState } from 'react';
import { API_URL } from '../api/api';

interface Props {
  onSuccess: () => void;
  onLogin: () => void;
}

export default function Register({ onSuccess, onLogin }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'delivery',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log('DELIVERY REGISTER RESPONSE:', data);

      if (!res.ok) throw new Error(data.message || 'No se pudo registrar');

      onSuccess();
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
          <h1 className="text-3xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-sm text-gray-500 mt-2">
            Regístrate como repartidor
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
              Nombre
            </label>
            <input
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
              placeholder="Tu nombre completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo
            </label>
            <input
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
              placeholder="correo@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-2xl bg-orange-500 px-5 py-3 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-gray-500 text-sm">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onLogin}
              className="text-orange-500 font-semibold hover:text-orange-600 transition"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}