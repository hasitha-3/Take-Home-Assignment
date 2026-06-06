import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "./api";

const MyContext = createContext();

export const AppProvider = ({ children }) => {
  // ── Initialize from localStorage so context survives page refresh ──────────
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("userInfo");
      return stored
        ? JSON.parse(stored)
        : {
            firstname: "",
            lastname: "",
            Email: "",
            contact_number: "",
            age: "",
            userId: "",
            isAdmin: false,
            avatar: "",
            address: "",
            college: "",
            sellerRating: 0,
          };
    } catch {
      return {
        firstname: "",
        lastname: "",
        Email: "",
        contact_number: "",
        age: "",
        userId: "",
        isAdmin: false,
      };
    }
  };

  const [info, setInfo] = useState(getStoredUser);
  const [cartCount, setCartCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // ── Update user info + persist ─────────────────────────────────────────────
  const change_info = useCallback((newInfo) => {
    const merged = {
      firstname: newInfo.firstname || "",
      lastname: newInfo.lastname || "",
      Email: newInfo.Email || "",
      contact_number: newInfo.contact_number || "",
      age: newInfo.age || "",
      userId: newInfo._id || newInfo.userId || "",
      isAdmin: newInfo.isAdmin || false,
      avatar: newInfo.avatar || "",
      address: newInfo.address || "",
      college: newInfo.college || "",
      sellerRating: newInfo.sellerRating || 0,
      bio: newInfo.bio || "",
    };
    setInfo(merged);
    localStorage.setItem("userInfo", JSON.stringify(merged));
  }, []);

  const clearInfo = useCallback(() => {
    setInfo({
      firstname: "",
      lastname: "",
      Email: "",
      contact_number: "",
      age: "",
      userId: "",
      isAdmin: false,
    });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    setCartCount(0);
    setUnreadNotifs(0);
  }, []);

  // ── Fetch cart count ───────────────────────────────────────────────────────
  const refreshCartCount = useCallback(async () => {
    if (!info.userId) return;
    try {
      const res = await api.get("/cart");
      const total = res.data.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      setCartCount(total);
    } catch {
      /* ignore */
    }
  }, [info.userId]);

  // ── Fetch unread notifications ─────────────────────────────────────────────
  const refreshNotifCount = useCallback(async () => {
    if (!info.userId) return;
    try {
      const res = await api.get("/notifications?limit=1");
      setUnreadNotifs(res.data.unread || 0);
    } catch {
      /* ignore */
    }
  }, [info.userId]);

  useEffect(() => {
    if (info.userId) {
      refreshCartCount();
      refreshNotifCount();
    }
  }, [info.userId]);

  // ── Theme toggle ──────────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }, [theme]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <MyContext.Provider
      value={{
        info,
        change_info,
        clearInfo,
        cartCount,
        setCartCount,
        refreshCartCount,
        unreadNotifs,
        setUnreadNotifs,
        refreshNotifCount,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useAppContext = () => useContext(MyContext);
