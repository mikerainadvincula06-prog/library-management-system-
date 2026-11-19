
import { create } from "zustand";

export const useStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("libraryUser")) || null,

  login: (user) => {
    localStorage.setItem("libraryUser", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("libraryUser");
    set({ user: null });
  }
}));
