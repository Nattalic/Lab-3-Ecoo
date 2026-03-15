import { useEffect, useState } from 'react';
import { API_URL } from '../api/api';
import type { User } from '../App';

export default function Orders({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [available, setAvailable] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<'available' | 'mine'>('available');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const loadAvailable = async () => {
    const res = await fetch(`${API_URL}/orders/available`, { headers });

    if (!res.ok) throw new Error('No se pudieron cargar los pedidos disponibles');

    const data = await res.json();
    console.log('AVAILABLE ORDERS RESPONSE:', data);

    const parsed = Array.isArray(data) ? data : data.data ?? [];
    setAvailable(parsed);
  };

  const loadMyOrders = async () => {
    const res = await fetch(`${API_URL}/orders/accepted`, { headers });

    if (!res.ok) throw new Error('No se pudieron cargar tus entregas');

    const data = await res.json();
    console.log('MY DELIVERY ORDERS RESPONSE:', data);

    const parsed = Array.isArray(data) ? data : data.data ?? [];
    setMyOrders(parsed);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadAvailable(), loadMyOrders()]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user.id]);

  const acceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/accept`, {
        method: 'PATCH',
        headers,
      });

      const data = await res.json();
      console.log('ACCEPT ORDER RESPONSE:', data);

      if (!res.ok) throw new Error(data.message || 'No se pudo aceptar el pedido');

      await Promise.all([loadAvailable(), loadMyOrders()]);
    } catch (error) {
      console.error(error);
    }
  };

  const declineOrder = async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/decline`, {
        method: 'PATCH',
        headers,
      });

      const data = await res.json();
      console.log('DECLINE ORDER RESPONSE:', data);

      if (!res.ok) throw new Error(data.message || 'No se pudo rechazar el pedido');

      await Promise.all([loadAvailable(), loadMyOrders()]);
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'accepted') return 'bg-green-100 text-green-700';
    if (status === 'declined') return 'bg-red-100 text-red-700';
    if (status === 'delivered') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <nav className="bg-white border-b border-orange-100 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-xl text-gray-900">Delivery App</h1>
          <p className="text-sm text-gray-500">Hola, {user.name}</p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl font-medium text-sm bg-gray-900 text-white hover:bg-black transition"
        >
          Salir
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTab('available')}
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              tab === 'available'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Disponibles ({available.length})
          </button>

          <button
            onClick={() => setTab('mine')}
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              tab === 'mine'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Mis entregas ({myOrders.length})
          </button>
        </div>

        {tab === 'available' && (
          <div className="flex flex-col gap-4">
            {available.length === 0 ? (
              <div className="bg-white border border-orange-100 rounded-3xl p-8 text-center text-gray-400">
                No hay pedidos disponibles
              </div>
            ) : (
              available.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-gray-700">
                      Pedido #{order.id.slice(0, 8)}
                    </p>

                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="font-medium text-gray-800 mb-3">
                    Tienda: {order.stores?.name || 'Tienda'}
                  </p>

                  <div className="flex flex-col gap-2 mb-4">
                    {order.order_items?.length > 0 ? (
                      order.order_items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm text-gray-600"
                        >
                          <span>
                            • {item.products?.name || 'Producto'} x{item.quantity}
                          </span>
                          <span className="font-medium text-gray-700">
                            {item.products?.price
                              ? `$${(item.products.price * item.quantity).toLocaleString('es-CO')}`
                              : ''}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">Sin productos</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="flex-1 rounded-2xl bg-green-500 text-white py-3 font-semibold hover:bg-green-600 transition"
                    >
                      Aceptar
                    </button>

                    <button
                      onClick={() => declineOrder(order.id)}
                      className="flex-1 rounded-2xl bg-red-50 text-red-600 py-3 font-semibold hover:bg-red-100 transition border border-red-100"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'mine' && (
          <div className="flex flex-col gap-4">
            {myOrders.length === 0 ? (
              <div className="bg-white border border-orange-100 rounded-3xl p-8 text-center text-gray-400">
                No tienes entregas asignadas
              </div>
            ) : (
              myOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-gray-700">
                      Pedido #{order.id.slice(0, 8)}
                    </p>

                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="font-medium text-gray-800 mb-3">
                    Tienda: {order.stores?.name || 'Tienda'}
                  </p>

                  <div className="flex flex-col gap-2">
                    {order.order_items?.length > 0 ? (
                      order.order_items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm text-gray-600"
                        >
                          <span>
                            • {item.products?.name || 'Producto'} x{item.quantity}
                          </span>
                          <span className="font-medium text-gray-700">
                            {item.products?.price
                              ? `$${(item.products.price * item.quantity).toLocaleString('es-CO')}`
                              : ''}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">Sin productos</p>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 border-t border-gray-100 pt-3 mt-4">
                    {new Date(order.createdAt).toLocaleString('es-CO')}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}