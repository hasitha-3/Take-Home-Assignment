import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { X } from "lucide-react";


// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Registration/Login";
import Registration from "./pages/Registration/Registration";
import Profile from "./pages/Profile/Profile";
import Cart from "./pages/Cart/Cart";
import Orders from "./pages/Orders/Orders";
import History from "./pages/OrderHis/History";
import Seller from "./pages/Home/Seller";
import Items_show from "./pages/Item/Items_show";
import ItemDetail from "./pages/Item/ItemDetail";
import MyProducts from "./pages/MyProducts/MyProducts";
import Wishlist from "./pages/Wishlist/Wishlist";
import Notifications from "./pages/Notifications/Notifications";
import Admin from "./pages/Admin/Admin";
import ContactUs from "./pages/ContactUs/ContactUs";
import NotFound from "./pages/NotFound";

// Protected route wrapper
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("userToken");
  return token ? element : <Navigate to="/login" replace />;
};

const AdminRoute = ({ element }) => {
  const token = localStorage.getItem("userToken");
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    return token && userInfo.isAdmin ? (
      element
    ) : (
      <Navigate to="/home" replace />
    );
  } catch {
    return <Navigate to="/home" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Protected */}
          <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
          <Route
            path="/items"
            element={<ProtectedRoute element={<Items_show />} />}
          />
          <Route
            path="/items/:itemId"
            element={<ProtectedRoute element={<ItemDetail />} />}
          />
          <Route
            path="/profile/:userId"
            element={<ProtectedRoute element={<Profile />} />}
          />
          <Route path="/cart" element={<ProtectedRoute element={<Cart />} />} />
          <Route
            path="/orders"
            element={<ProtectedRoute element={<Orders />} />}
          />
          <Route
            path="/history"
            element={<ProtectedRoute element={<History />} />}
          />
          <Route
            path="/seller"
            element={<ProtectedRoute element={<Seller />} />}
          />
          <Route
            path="/my-products"
            element={<ProtectedRoute element={<MyProducts />} />}
          />
          <Route
            path="/wishlist"
            element={<ProtectedRoute element={<Wishlist />} />}
          />
          <Route
            path="/notifications"
            element={<ProtectedRoute element={<Notifications />} />}
          />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute element={<Admin />} />} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/Registration"
            element={<Navigate to="/registration" replace />}
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "var(--shadow-lg)",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
              maxWidth: "400px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            duration: 3000,
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  <div className="flex-1">{message}</div>
                  {t.type !== "loading" && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="ml-2 p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-md transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
      </BrowserRouter>
  );
}

export default App;
