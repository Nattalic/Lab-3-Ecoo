import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Stores from "./pages/Stores";
import MyOrders from "./pages/MyOrders";

type Page = "login" | "register" | "stores" | "my-orders";
type Role = "consumer" | "store" | "delivery" | null;

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function App() {
  const [page, setPage] = useState<Page>("login");

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedRole, setSelectedRole] = useState<Role>(() => {
    const savedRole = localStorage.getItem("selectedRole");
    return savedRole ? (savedRole as Role) : null;
  });

  const handleLogin = (u: User) => {
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("selectedRole", "consumer");
    setUser(u);
    setSelectedRole("consumer");
    setPage("stores");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("selectedRole");
    setUser(null);
    setSelectedRole(null);
    setPage("login");
  };

  const handleSelectRole = (role: Role) => {
    if (role === "consumer") {
      localStorage.setItem("selectedRole", "consumer");
      setSelectedRole(role);
      return;
    }

    if (role === "store") {
      window.open("http://localhost:5174", "_blank");
      return;
    }

    if (role === "delivery") {
      window.open("http://localhost:5175", "_blank");
      return;
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium text-orange-500 mb-2">
              Delivery App
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Elige cómo quieres entrar a la plataforma
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleSelectRole("consumer")}
              className="w-full rounded-2xl bg-white border border-gray-200 px-5 py-4 text-gray-800 font-semibold hover:bg-gray-50 transition"
            >
              Entrar como consumidor
            </button>

            <button
              onClick={() => handleSelectRole("store")}
              className="w-full rounded-2xl bg-white border border-gray-200 px-5 py-4 text-gray-800 font-semibold hover:bg-gray-50 transition"
            >
              Entrar como tienda
            </button>

            <button
              onClick={() => handleSelectRole("delivery")}
              className="w-full rounded-2xl bg-white border border-gray-200 px-5 py-4 text-gray-800 font-semibold hover:bg-gray-50 transition"
            >
              Entrar como repartidor
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (page === "register") {
      return (
        <Register
          onSuccess={() => setPage("login")}
          onLogin={() => setPage("login")}
        />
      );
    }

    return (
      <Login
        onSuccess={handleLogin}
        onRegister={() => setPage("register")}
        onBack={() => {
          localStorage.removeItem("selectedRole");
          setSelectedRole(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-orange-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Consumer App</h1>
          <p className="text-sm text-gray-500">Hola, {user.name}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage("stores")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              page === "stores"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Tiendas
          </button>

          <button
            onClick={() => setPage("my-orders")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              page === "my-orders"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Mis pedidos
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-black transition"
          >
            Salir
          </button>
        </div>
      </nav>

      <main className="px-6 py-6">
        {page === "stores" && <Stores user={user} />}
        {page === "my-orders" && <MyOrders user={user} />}
      </main>
    </div>
  );
}

export default App;
